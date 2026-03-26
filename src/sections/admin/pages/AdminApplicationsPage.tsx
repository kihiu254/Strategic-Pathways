import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Search, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/authStore';
import { AppNotificationService } from '../../../lib/appNotifications';
import { EmailAutomationService } from '../../../lib/emailAutomation';
import { formatAdminDate, getStatusTone } from '../helpers';

type ApplicationRow = {
  id: string;
  user_id: string;
  opportunity_id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  cover_letter: string | null;
  notes: string | null;
  applied_at: string | null;
  reviewed_at: string | null;
  opportunity: {
    title?: string | null;
    organization?: string | null;
  } | null;
  profile: {
    full_name?: string | null;
    email?: string | null;
    professional_title?: string | null;
  } | null;
};

const AdminApplicationsPage = () => {
  const user = useAuthStore((state) => state.user);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunity_applications')
        .select(`
          id,
          user_id,
          opportunity_id,
          status,
          cover_letter,
          notes,
          applied_at,
          reviewed_at,
          opportunity:opportunities(title, organization),
          profile:profiles!opportunity_applications_user_id_fkey(full_name, email, professional_title)
        `)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      const rows = (data || []) as ApplicationRow[];
      setApplications(rows);
      setDraftNotes(
        rows.reduce<Record<string, string>>((accumulator, row) => {
          accumulator[row.id] = row.notes || '';
          return accumulator;
        }, {})
      );
    } catch (error) {
      console.error('Error loading opportunity applications:', error);
      toast.error('Applications could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesQuery =
        !query ||
        [
          application.profile?.full_name,
          application.profile?.email,
          application.opportunity?.title,
          application.opportunity?.organization,
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(query.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || application.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [applications, query, statusFilter]);

  const summary = {
    pending: applications.filter((application) => application.status === 'pending').length,
    reviewed: applications.filter((application) => application.status === 'reviewed').length,
    accepted: applications.filter((application) => application.status === 'accepted').length,
    rejected: applications.filter((application) => application.status === 'rejected').length,
  };

  const updateApplication = async (
    application: ApplicationRow,
    updates: Partial<Pick<ApplicationRow, 'status' | 'notes'>>
  ) => {
    try {
      const payload = {
        status: updates.status || application.status,
        notes: updates.notes ?? draftNotes[application.id] ?? null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id || null,
      };

      const { error } = await supabase
        .from('opportunity_applications')
        .update(payload)
        .eq('id', application.id);

      if (error) throw error;

      setApplications((current) =>
        current.map((item) =>
          item.id === application.id
            ? {
                ...item,
                status: payload.status as ApplicationRow['status'],
                notes: payload.notes as string | null,
                reviewed_at: payload.reviewed_at,
              }
            : item
        )
      );

      if (updates.status) {
        const title = application.opportunity?.title || 'your application';
        const message =
          updates.status === 'accepted'
            ? `Your application for "${title}" has been approved.`
            : updates.status === 'rejected'
              ? `Your application for "${title}" was not selected this time.`
              : `Your application for "${title}" is under review.`;

        await AppNotificationService.notifyUser(application.user_id, {
          title: 'Application status updated',
          message,
          type:
            updates.status === 'accepted'
              ? 'success'
              : updates.status === 'rejected'
                ? 'warning'
                : 'info',
          data: {
            action: 'application_status_update',
            opportunityId: application.opportunity_id,
            status: updates.status,
          },
        }).catch((error) => console.warn('Application notification failed:', error));

        if (application.profile?.email) {
          await EmailAutomationService.onApplicationStatus(
            application.profile.email,
            application.profile.full_name || 'Member',
            application.opportunity?.title || 'Opportunity',
            updates.status
          );
        }
      }

      toast.success(updates.status ? `Application marked ${updates.status}.` : 'Application notes saved.');
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Application update failed.');
    }
  };

  return (
    <div className="admin-section-shell">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: summary.pending },
          { label: 'Reviewed', value: summary.reviewed },
          { label: 'Accepted', value: summary.accepted },
          { label: 'Rejected', value: summary.rejected },
        ].map((item) => (
          <div key={item.label} className="admin-surface-card premium-glass p-5 rounded-[24px] border border-white/5">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">{item.label}</p>
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-4">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="admin-surface-card premium-glass p-6 rounded-[28px] border border-white/5">
        <div className="flex flex-col xl:flex-row gap-3 xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search applicants, opportunities, or organizations"
              className="input-glass pl-10 pr-4 py-3 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="input-glass px-4 py-3 w-full xl:w-auto"
            title="Filter application status"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredApplications.map((application) => (
          <div key={application.id} className="admin-surface-card premium-glass p-6 rounded-[28px] border border-white/5">
            <div className="flex flex-col xl:flex-row gap-6 xl:items-start xl:justify-between">
              <div className="space-y-3 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">
                    {application.profile?.full_name || 'Unknown applicant'}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusTone(application.status)}`}>
                    {application.status}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {application.profile?.professional_title || 'Professional title not provided'}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {application.profile?.email || 'No email available'}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="admin-stat-pill text-[var(--sp-accent)]">
                    {application.opportunity?.title || 'Untitled opportunity'}
                  </span>
                  <span className="admin-stat-pill text-[var(--text-secondary)]">
                    {application.opportunity?.organization || 'Organization pending'}
                  </span>
                  <span className="admin-stat-pill text-[var(--text-secondary)]">
                    Applied {formatAdminDate(application.applied_at)}
                  </span>
                </div>
                {application.cover_letter && (
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-secondary)] mb-2">
                      Candidate note
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                      {application.cover_letter}
                    </p>
                  </div>
                )}
              </div>

              <div className="w-full xl:max-w-md space-y-3">
                <textarea
                  value={draftNotes[application.id] || ''}
                  onChange={(event) =>
                    setDraftNotes((current) => ({
                      ...current,
                      [application.id]: event.target.value,
                    }))
                  }
                  rows={4}
                  className="input-glass w-full px-4 py-3 resize-none"
                  placeholder="Add admin review notes, interview details, or next steps"
                />
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => updateApplication(application, { notes: draftNotes[application.id] || '' })} className="sp-btn-glass px-4 py-2 text-sm">
                    Save notes
                  </button>
                  <button onClick={() => updateApplication(application, { status: 'reviewed' })} className="sp-btn-glass px-4 py-2 text-sm">
                    Mark reviewed
                  </button>
                  <button onClick={() => updateApplication(application, { status: 'accepted' })} className="sp-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    Approve
                  </button>
                  <button onClick={() => updateApplication(application, { status: 'rejected' })} className="sp-btn-glass px-4 py-2 text-sm inline-flex items-center gap-2 text-red-300 border-red-500/20">
                    <XCircle size={16} />
                    Reject
                  </button>
                  <Link to={`/admin/user/${application.user_id}`} className="sp-btn-glass px-4 py-2 text-sm">
                    Open profile
                  </Link>
                </div>
                {application.reviewed_at && (
                  <p className="text-xs text-[var(--text-secondary)]">
                    Last reviewed {formatAdminDate(application.reviewed_at)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && filteredApplications.length === 0 && (
        <div className="admin-surface-card premium-glass p-10 rounded-[28px] border border-dashed border-white/10 text-center text-[var(--text-secondary)]">
          No applications match the current filters.
        </div>
      )}
    </div>
  );
};

export default AdminApplicationsPage;
