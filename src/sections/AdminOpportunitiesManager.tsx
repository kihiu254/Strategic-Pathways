import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import {
  Plus,
  ArrowRight,
  Edit2,
  Trash2,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Eye,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppNotificationService } from '../lib/appNotifications';
import { EmailAutomationService } from '../lib/emailAutomation';

const ROLLING_DEADLINE_DATE = '2099-12-31';
const OWNERSHIP_PREFIX = 'ownership:';
const APPLY_LINK_PREFIX = 'apply-link:';
const ROLLING_TAG = 'deadline:rolling';

interface Opportunity {
  id?: string;
  title: string;
  organization: string;
  location: string;
  type: string;
  duration: string;
  description: string;
  requirements: string[];
  compensation: string;
  sector: string;
  tags: string[];
  deadline: string;
  status: 'active' | 'closed';
  ownership: string;
  applicationLink: string;
  rollingDeadline: boolean;
}

interface Application {
  id: string;
  opportunity_id: string;
  user_id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  applied_at: string;
  opportunity: { title: string } | null;
  profile: { full_name: string; email: string } | null;
}

type OpportunityRow = {
  id?: string;
  title?: string;
  organization?: string;
  location?: string;
  type?: string;
  duration?: string;
  description?: string;
  requirements?: string[];
  compensation?: string;
  sector?: string;
  tags?: string[];
  deadline?: string;
  status?: string;
};

const parseOpportunity = (row: OpportunityRow): Opportunity => {
  const rawTags = Array.isArray(row.tags) ? row.tags : [];
  const ownershipTag = rawTags.find((tag) => tag.toLowerCase().startsWith(OWNERSHIP_PREFIX));
  const applyLinkTag = rawTags.find((tag) => tag.toLowerCase().startsWith(APPLY_LINK_PREFIX));
  const rollingDeadline = rawTags.some((tag) => tag.toLowerCase() === ROLLING_TAG) || String(row.deadline || '').startsWith(ROLLING_DEADLINE_DATE);

  return {
    id: row.id,
    title: row.title || '',
    organization: row.organization || '',
    location: row.location || '',
    type: row.type || 'Project-based',
    duration: row.duration || '',
    description: row.description || '',
    requirements: Array.isArray(row.requirements) ? row.requirements : [''],
    compensation: row.compensation || '',
    sector: row.sector || 'Technology',
    tags: rawTags.filter(
      (tag) =>
        !tag.toLowerCase().startsWith(OWNERSHIP_PREFIX) &&
        !tag.toLowerCase().startsWith(APPLY_LINK_PREFIX) &&
        tag.toLowerCase() !== ROLLING_TAG
    ),
    deadline: rollingDeadline || !row.deadline ? '' : new Date(row.deadline).toISOString().slice(0, 10),
    status: row.status === 'closed' ? 'closed' : 'active',
    ownership: ownershipTag ? ownershipTag.slice(OWNERSHIP_PREFIX.length) : 'Private',
    applicationLink: applyLinkTag ? applyLinkTag.slice(APPLY_LINK_PREFIX.length) : '',
    rollingDeadline,
  };
};

const formatDeadline = (opportunity: Opportunity, rolling: string, tbd: string) => {
  if (opportunity.rollingDeadline) return rolling;
  if (!opportunity.deadline) return tbd;
  return new Date(`${opportunity.deadline}T00:00:00`).toLocaleDateString();
};

const getApplicationTone = (status: Application['status']) => {
  switch (status) {
    case 'accepted':
      return 'bg-green-500/10 text-green-400';
    case 'rejected':
      return 'bg-red-500/10 text-red-400';
    case 'reviewed':
      return 'bg-blue-500/10 text-blue-400';
    default:
      return 'bg-yellow-500/10 text-yellow-300';
  }
};

const AdminOpportunitiesManager = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const text = i18n.language.startsWith('sw')
    ? {
        loadWorkspace: 'Imeshindikana kupakia eneo la kazi la fursa.',
        deleteConfirm: 'Futa fursa hii?',
        deleted: 'Fursa imefutwa.',
        reopened: 'Fursa imefunguliwa tena.',
        closed: 'Fursa imefungwa.',
        updateOpportunityFailed: 'Imeshindikana kusasisha fursa: ',
        updateApplicationFailed: 'Imeshindikana kusasisha ombi: ',
        statusUpdatedTitle: 'Hali ya ombi imesasishwa',
        acceptedMessageStart: 'Ombi lako la \"',
        acceptedMessageEnd: '\" limekubaliwa.',
        rejectedMessageEnd: '\" halikuchaguliwa safari hii.',
        reviewMessageEnd: '\" linakaguliwa.',
        loading: 'Inapakia eneo la kazi la fursa...',
        title: 'Fursa',
        subtitle: 'Chapisha fursa za kina na ukague waombaji wanaozijibu.',
        addOpportunity: 'Ongeza fursa',
        total: 'Jumla',
        active: 'Hai',
        applications: 'Maombi',
        pending: 'Yanayosubiri',
        allOpportunities: 'Fursa zote',
        allOpportunitiesHelp: 'Tumia umiliki, sekta na tarehe endelevu kuweka matangazo kwa mpangilio mmoja.',
        deadline: 'Mwisho wa kutuma: ',
        externalApplyLink: 'Kiungo cha ombi la nje',
        edit: 'Hariri',
        closeOpportunity: 'Funga fursa',
        reopenOpportunity: 'Fungua tena fursa',
        delete: 'Futa',
        noOpportunities: 'Hakuna fursa zilizochapishwa bado.',
        applicantReview: 'Ukaguzi wa waombaji',
        applicantReviewBody: 'Kagua walioomba fursa zilizochapishwa, angalia wasifu wao, na uidhinishe au ukatae.',
        unknownApplicant: 'Mwombaji asiyejulikana',
        noEmail: 'Hakuna barua pepe iliyopo',
        appliedFor: 'Ameomba ',
        untitledOpportunity: 'fursa isiyo na jina',
        viewApplicant: 'Tazama mwombaji',
        markReviewed: 'Weka kuwa imekaguliwa',
        approve: 'Idhinisha',
        reject: 'Kataa',
        noApplications: 'Hakuna maombi yaliyowasilishwa bado.',
        rolling: 'Inaendelea',
        tbd: 'Itatangazwa',
        applicationMarked: 'Ombi limewekwa kama '
      }
    : {
        loadWorkspace: 'Failed to load opportunities workspace.',
        deleteConfirm: 'Delete this opportunity?',
        deleted: 'Opportunity deleted.',
        reopened: 'Opportunity reopened.',
        closed: 'Opportunity closed.',
        updateOpportunityFailed: 'Failed to update opportunity: ',
        updateApplicationFailed: 'Failed to update application: ',
        statusUpdatedTitle: 'Application status updated',
        acceptedMessageStart: 'Your application for \"',
        acceptedMessageEnd: '\" has been accepted.',
        rejectedMessageEnd: '\" was not selected this time.',
        reviewMessageEnd: '\" is under review.',
        loading: 'Loading opportunities workspace...',
        title: 'Opportunities',
        subtitle: 'Publish detailed opportunities and review the applicants who respond to them.',
        addOpportunity: 'Add Opportunity',
        total: 'Total',
        active: 'Active',
        applications: 'Applications',
        pending: 'Pending',
        allOpportunities: 'All Opportunities',
        allOpportunitiesHelp: 'Use ownership, sector, and rolling deadline settings to keep listings consistent.',
        deadline: 'Deadline: ',
        externalApplyLink: 'External apply link',
        edit: 'Edit',
        closeOpportunity: 'Close opportunity',
        reopenOpportunity: 'Reopen opportunity',
        delete: 'Delete',
        noOpportunities: 'No opportunities posted yet.',
        applicantReview: 'Applicant Review',
        applicantReviewBody: 'Review the people who applied for published projects, view their profiles, and approve or reject them.',
        unknownApplicant: 'Unknown applicant',
        noEmail: 'No email available',
        appliedFor: 'Applied for ',
        untitledOpportunity: 'Untitled opportunity',
        viewApplicant: 'View Applicant',
        markReviewed: 'Mark Reviewed',
        approve: 'Approve',
        reject: 'Reject',
        noApplications: 'No applications have been submitted yet.',
        rolling: 'Rolling',
        tbd: 'TBD',
        applicationMarked: 'Application marked as '
      };

  const fetchOpportunities = useCallback(async () => {
    const { data, error } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    setOpportunities((data || []).map((row) => parseOpportunity(row)));
  }, []);

  const fetchApplications = useCallback(async () => {
    const { data, error } = await supabase
      .from('opportunity_applications')
      .select(`
        id,
        opportunity_id,
        user_id,
        status,
        applied_at,
        opportunity:opportunities(title),
        profile:profiles!opportunity_applications_user_id_fkey(full_name, email)
      `)
      .order('applied_at', { ascending: false });

    if (error) throw error;
    setApplications((data || []) as Application[]);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchOpportunities(), fetchApplications()]);
      } catch (error) {
        console.error('Error loading opportunities admin data:', error);
        toast.error(text.loadWorkspace);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [fetchApplications, fetchOpportunities, text.loadWorkspace]);

  const handleDelete = async (id: string) => {
    if (!confirm(text.deleteConfirm)) return;

    try {
      const { error } = await supabase.from('opportunities').delete().eq('id', id);
      if (error) throw error;
      toast.success(text.deleted);
      await fetchOpportunities();
    } catch (error) {
      toast.error(`Error: ${(error as Error).message}`);
    }
  };

  const openOpportunityEditor = (opportunityId?: string) => {
    navigate(opportunityId ? `/admin/opportunities/${opportunityId}/edit` : '/admin/opportunities/new');
  };

  const handleToggleOpportunityStatus = async (opportunity: Opportunity) => {
    try {
      const nextStatus = opportunity.status === 'active' ? 'closed' : 'active';
      const { error } = await supabase
        .from('opportunities')
        .update({ status: nextStatus })
        .eq('id', opportunity.id);

      if (error) throw error;
      toast.success(nextStatus === 'active' ? text.reopened : text.closed);
      await fetchOpportunities();
    } catch (error) {
      toast.error(`${text.updateOpportunityFailed}${(error as Error).message}`);
    }
  };

  const handleApplicationStatus = async (applicationId: string, status: Application['status']) => {
    try {
      const applicationRecord = applications.find((application) => application.id === applicationId);
      const { error } = await supabase
        .from('opportunity_applications')
        .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: user?.id || null })
        .eq('id', applicationId);

      if (error) throw error;
      setApplications((previous) => previous.map((application) => (application.id === applicationId ? { ...application, status } : application)));

      if (applicationRecord) {
        const title = applicationRecord.opportunity?.title || text.untitledOpportunity;
        const statusMessage =
          status === 'accepted'
            ? `${text.acceptedMessageStart}${title}${text.acceptedMessageEnd}`
            : status === 'rejected'
              ? `${text.acceptedMessageStart}${title}${text.rejectedMessageEnd}`
              : `${text.acceptedMessageStart}${title}${text.reviewMessageEnd}`;

        await AppNotificationService.notifyUser(applicationRecord.user_id, {
          title: text.statusUpdatedTitle,
          message: statusMessage,
          type: status === 'accepted' ? 'success' : status === 'rejected' ? 'warning' : 'info',
          data: {
            action: 'application_status_update',
            status,
            opportunityId: applicationRecord.opportunity_id,
            opportunityTitle: applicationRecord.opportunity?.title || null,
          },
        }).catch((notificationError) => console.warn('Notification failed:', notificationError));
        if (applicationRecord.profile?.email) {
          await EmailAutomationService.onApplicationStatus(
            applicationRecord.profile.email,
            applicationRecord.profile.full_name || 'Member',
            applicationRecord.opportunity?.title || text.untitledOpportunity,
            status
          );
        }
      }

      toast.success(`${text.applicationMarked}${status}.`);
    } catch (error) {
      toast.error(`${text.updateApplicationFailed}${(error as Error).message}`);
    }
  };

  if (loading) {
    return <div className="text-center py-12">{text.loading}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">{text.title}</h2>
          <p className="text-[var(--text-secondary)]">
            {text.subtitle}
          </p>
        </div>
        <button
          onClick={() => openOpportunityEditor()}
          className="sp-btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          {text.addOpportunity}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--sp-accent)]/10">
              <Calendar className="text-[var(--sp-accent)]" size={20} />
            </div>
            <span className="text-sm text-[var(--text-secondary)]">{text.total}</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{opportunities.length}</div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="text-green-400" size={20} />
            </div>
            <span className="text-sm text-[var(--text-secondary)]">{text.active}</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{opportunities.filter((item) => item.status === 'active').length}</div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="text-blue-400" size={20} />
            </div>
            <span className="text-sm text-[var(--text-secondary)]">{text.applications}</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{applications.length}</div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Clock className="text-purple-400" size={20} />
            </div>
            <span className="text-sm text-[var(--text-secondary)]">{text.pending}</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{applications.filter((item) => item.status === 'pending').length}</div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">{text.allOpportunities}</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            {text.allOpportunitiesHelp}
          </p>
        </div>

        <div className="space-y-3">
          {opportunities.map((opportunity) => (
            <div key={opportunity.id} className="glass-light p-4 rounded-xl flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[240px]">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h4 className="font-bold text-[var(--text-primary)]">{opportunity.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${opportunity.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-300'}`}>
                    {opportunity.status}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{opportunity.organization} • {opportunity.location}</p>
                <div className="flex flex-wrap gap-2 mt-3 text-xs">
                  <span className="px-2 py-1 rounded-full bg-[var(--sp-accent)]/10 text-[var(--sp-accent)]">{opportunity.sector}</span>
                  <span className="px-2 py-1 rounded-full bg-white/5 text-[var(--text-secondary)]">{opportunity.type}</span>
                  <span className="px-2 py-1 rounded-full bg-white/5 text-[var(--text-secondary)]">{opportunity.ownership}</span>
                  <span className="px-2 py-1 rounded-full bg-white/5 text-[var(--text-secondary)]">{text.deadline}{formatDeadline(opportunity, text.rolling, text.tbd)}</span>
                  {opportunity.applicationLink && (
                    <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">{text.externalApplyLink}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openOpportunityEditor(opportunity.id)} className="p-2 hover:bg-white/5 rounded-lg" aria-label={text.edit} title={text.edit}>
                  <Edit2 size={16} className="text-blue-400" />
                </button>
                <button
                  onClick={() => handleToggleOpportunityStatus(opportunity)}
                  className="p-2 hover:bg-white/5 rounded-lg"
                  aria-label={opportunity.status === 'active' ? text.closeOpportunity : text.reopenOpportunity}
                  title={opportunity.status === 'active' ? text.closeOpportunity : text.reopenOpportunity}
                >
                  <ShieldCheck size={16} className="text-amber-300" />
                </button>
                <button onClick={() => handleDelete(opportunity.id!)} className="p-2 hover:bg-white/5 rounded-lg" aria-label={text.delete} title={text.delete}>
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
          {opportunities.length === 0 && <p className="text-sm text-[var(--text-secondary)]">{text.noOpportunities}</p>}
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Applications workspace</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Applicant review now lives in its own routed page so opportunity publishing and applicant moderation are separated cleanly.
            </p>
          </div>
          <button onClick={() => navigate('/admin/applications')} className="sp-btn-primary inline-flex items-center gap-2">
            Open applications
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: 'Total applications', value: applications.length, tone: 'text-[var(--text-primary)]' },
            { label: 'Pending review', value: applications.filter((item) => item.status === 'pending').length, tone: 'text-amber-200' },
            { label: 'Under review or decided', value: applications.filter((item) => item.status !== 'pending').length, tone: 'text-[var(--sp-accent)]' },
          ].map((item) => (
            <div key={item.label} className="glass-light p-4 rounded-xl border border-white/5">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">{item.label}</p>
              <p className={`text-3xl font-bold mt-3 ${item.tone}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOpportunitiesManager;
