import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  ExternalLink,
  Eye,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppNotificationService } from '../lib/appNotifications';

const SECTOR_OPTIONS = [
  'Agriculture',
  'Technology',
  'Energy',
  'Health',
  'Transport',
  'Manufacturing',
  'Education',
  'Tourism',
  'Finance',
  'Real Estate',
  'Mining',
  'Trade',
  'Creatives',
  'Others',
];

const TYPE_OPTIONS = ['Full-time', 'Part-time', 'Contract', 'Advisory', 'Consulting', 'Project-based'];
const OWNERSHIP_OPTIONS = ['Private', 'Public', 'NGOs'];
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

const baseOpportunity = (): Opportunity => ({
  title: '',
  organization: '',
  location: '',
  type: 'Project-based',
  duration: '',
  description: '',
  requirements: [''],
  compensation: '',
  sector: 'Technology',
  tags: [],
  deadline: '',
  status: 'active',
  ownership: 'Private',
  applicationLink: '',
  rollingDeadline: false,
});

const parseOpportunity = (row: Record<string, any>): Opportunity => {
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

const serializeOpportunity = (opportunity: Opportunity, userId?: string) => {
  const cleanTags = opportunity.tags.map((tag) => tag.trim()).filter(Boolean);
  cleanTags.push(`${OWNERSHIP_PREFIX}${opportunity.ownership}`);
  if (opportunity.applicationLink.trim()) {
    cleanTags.push(`${APPLY_LINK_PREFIX}${opportunity.applicationLink.trim()}`);
  }
  if (opportunity.rollingDeadline) {
    cleanTags.push(ROLLING_TAG);
  }

  return {
    title: opportunity.title.trim(),
    organization: opportunity.organization.trim(),
    location: opportunity.location.trim(),
    type: opportunity.type,
    duration: opportunity.duration.trim(),
    description: opportunity.description.trim(),
    requirements: opportunity.requirements.map((item) => item.trim()).filter(Boolean),
    compensation: opportunity.compensation.trim(),
    sector: opportunity.sector,
    tags: cleanTags,
    deadline: opportunity.rollingDeadline
      ? `${ROLLING_DEADLINE_DATE}T00:00:00.000Z`
      : new Date(`${opportunity.deadline}T00:00:00`).toISOString(),
    status: opportunity.status,
    created_by: userId,
  };
};

const formatDeadline = (opportunity: Opportunity) => {
  if (opportunity.rollingDeadline) return 'Rolling';
  if (!opportunity.deadline) return 'TBD';
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
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Opportunity>(baseOpportunity());

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
        toast.error('Failed to load opportunities workspace.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [fetchApplications, fetchOpportunities]);

  const resetForm = () => setFormData(baseOpportunity());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.rollingDeadline && !formData.deadline) {
      toast.error('Add a deadline or mark the opportunity as rolling.');
      return;
    }

    try {
      const payload = serializeOpportunity(formData, user?.id);

      if (editingOpp?.id) {
        const { error } = await supabase.from('opportunities').update(payload).eq('id', editingOpp.id);
        if (error) throw error;
        toast.success('Opportunity updated.');
      } else {
        const { error } = await supabase.from('opportunities').insert([payload]);
        if (error) throw error;
        toast.success('Opportunity created.');
      }

      setShowForm(false);
      setEditingOpp(null);
      resetForm();
      await fetchOpportunities();
    } catch (error) {
      toast.error(`Error: ${(error as Error).message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this opportunity?')) return;

    try {
      const { error } = await supabase.from('opportunities').delete().eq('id', id);
      if (error) throw error;
      toast.success('Opportunity deleted.');
      await fetchOpportunities();
    } catch (error) {
      toast.error(`Error: ${(error as Error).message}`);
    }
  };

  const handleEdit = (opportunity: Opportunity) => {
    setEditingOpp(opportunity);
    setFormData(opportunity);
    setShowForm(true);
  };

  const updateRequirement = (index: number, value: string) => {
    const nextRequirements = [...formData.requirements];
    nextRequirements[index] = value;
    setFormData({ ...formData, requirements: nextRequirements });
  };

  const addRequirement = () => {
    setFormData({ ...formData, requirements: [...formData.requirements, ''] });
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, requirementIndex) => requirementIndex !== index),
    });
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
        const statusMessage =
          status === 'accepted'
            ? `Your application for "${applicationRecord.opportunity?.title || 'this opportunity'}" has been accepted.`
            : status === 'rejected'
              ? `Your application for "${applicationRecord.opportunity?.title || 'this opportunity'}" was not selected this time.`
              : `Your application for "${applicationRecord.opportunity?.title || 'this opportunity'}" is under review.`;

        await AppNotificationService.notifyUser(applicationRecord.user_id, {
          title: 'Application status updated',
          message: statusMessage,
          type: status === 'accepted' ? 'success' : status === 'rejected' ? 'warning' : 'info',
          data: {
            action: 'application_status_update',
            status,
            opportunityId: applicationRecord.opportunity_id,
            opportunityTitle: applicationRecord.opportunity?.title || null,
          },
        }).catch((notificationError) => console.warn('Notification failed:', notificationError));
      }

      toast.success(`Application marked as ${status}.`);
    } catch (error) {
      toast.error(`Failed to update application: ${(error as Error).message}`);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading opportunities workspace...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Opportunities & Projects</h2>
          <p className="text-[var(--text-secondary)]">
            Create, edit, close, and review applications for active opportunities from one workspace.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingOpp(null);
            resetForm();
          }}
          className="sp-btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add Opportunity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--sp-accent)]/10">
              <Calendar className="text-[var(--sp-accent)]" size={20} />
            </div>
            <span className="text-sm text-[var(--text-secondary)]">Total</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{opportunities.length}</div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="text-green-400" size={20} />
            </div>
            <span className="text-sm text-[var(--text-secondary)]">Active</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{opportunities.filter((item) => item.status === 'active').length}</div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="text-blue-400" size={20} />
            </div>
            <span className="text-sm text-[var(--text-secondary)]">Applications</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{applications.length}</div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Clock className="text-purple-400" size={20} />
            </div>
            <span className="text-sm text-[var(--text-secondary)]">Pending</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{applications.filter((item) => item.status === 'pending').length}</div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">All Opportunities</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Use ownership, sector, and rolling deadline settings to keep listings consistent.
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
                  <span className="px-2 py-1 rounded-full bg-white/5 text-[var(--text-secondary)]">Deadline: {formatDeadline(opportunity)}</span>
                  {opportunity.applicationLink && (
                    <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">External apply link</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(opportunity)} className="p-2 hover:bg-white/5 rounded-lg" aria-label="Edit" title="Edit">
                  <Edit2 size={16} className="text-blue-400" />
                </button>
                <button
                  onClick={() => handleEdit({ ...opportunity, status: opportunity.status === 'active' ? 'closed' : 'active' })}
                  className="p-2 hover:bg-white/5 rounded-lg"
                  aria-label={opportunity.status === 'active' ? 'Close opportunity' : 'Reopen opportunity'}
                  title={opportunity.status === 'active' ? 'Close opportunity' : 'Reopen opportunity'}
                >
                  <ShieldCheck size={16} className="text-amber-300" />
                </button>
                <button onClick={() => handleDelete(opportunity.id!)} className="p-2 hover:bg-white/5 rounded-lg" aria-label="Delete" title="Delete">
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
          {opportunities.length === 0 && <p className="text-sm text-[var(--text-secondary)]">No opportunities posted yet.</p>}
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Project Applications</h3>
            <p className="text-sm text-[var(--text-secondary)]">Review applicants, view their profiles, and approve or reject submissions.</p>
          </div>
        </div>

        <div className="space-y-3">
          {applications.map((application) => (
            <div key={application.id} className="glass-light p-4 rounded-xl flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[240px]">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h4 className="font-bold text-[var(--text-primary)]">{application.profile?.full_name || 'Unknown applicant'}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs uppercase ${getApplicationTone(application.status)}`}>{application.status}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{application.profile?.email || 'No email available'}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-[var(--text-secondary)]">
                  <MapPin size={14} className="text-[var(--sp-accent)]" />
                  Applied for {application.opportunity?.title || 'Untitled opportunity'}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => navigate(`/admin/user/${application.user_id}`)}
                  className="sp-btn-glass flex items-center gap-2"
                >
                  <Eye size={16} />
                  View Profile
                </button>
                <button
                  onClick={() => handleApplicationStatus(application.id, 'reviewed')}
                  className="sp-btn-glass"
                >
                  Mark Reviewed
                </button>
                <button
                  onClick={() => handleApplicationStatus(application.id, 'accepted')}
                  className="sp-btn-primary"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApplicationStatus(application.id, 'rejected')}
                  className="sp-btn-glass text-red-400 border-red-500/20"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          {applications.length === 0 && <p className="text-sm text-[var(--text-secondary)]">No applications have been submitted yet.</p>}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[var(--bg-card)] border-b border-white/10 p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">{editingOpp ? 'Edit' : 'Add'} Opportunity</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-lg" aria-label="Close" title="Close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="opp-title" className="text-sm text-[var(--text-secondary)] block mb-2">What is the opportunity or project title? *</label>
                  <input id="opp-title" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-glass w-full" />
                </div>
                <div>
                  <label htmlFor="opp-org" className="text-sm text-[var(--text-secondary)] block mb-2">Who is leading it? *</label>
                  <input id="opp-org" required value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} className="input-glass w-full" />
                </div>
                <div>
                  <label htmlFor="opp-loc" className="text-sm text-[var(--text-secondary)] block mb-2">Where will it happen? *</label>
                  <input id="opp-loc" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="input-glass w-full" placeholder="e.g. Nairobi / Hybrid / Remote" />
                </div>
                <div>
                  <label htmlFor="opp-type" className="text-sm text-[var(--text-secondary)] block mb-2">Type *</label>
                  <select id="opp-type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input-glass w-full">
                    {TYPE_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="opp-sector" className="text-sm text-[var(--text-secondary)] block mb-2">Sector *</label>
                  <select id="opp-sector" value={formData.sector} onChange={(e) => setFormData({ ...formData, sector: e.target.value })} className="input-glass w-full">
                    {SECTOR_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="opp-ownership" className="text-sm text-[var(--text-secondary)] block mb-2">Ownership *</label>
                  <select id="opp-ownership" value={formData.ownership} onChange={(e) => setFormData({ ...formData, ownership: e.target.value })} className="input-glass w-full">
                    {OWNERSHIP_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="opp-duration" className="text-sm text-[var(--text-secondary)] block mb-2">How long will it run? *</label>
                  <input id="opp-duration" required value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="input-glass w-full" placeholder="e.g. 6 months or Project-based" />
                </div>
                <div>
                  <label htmlFor="opp-comp" className="text-sm text-[var(--text-secondary)] block mb-2">Compensation *</label>
                  <input id="opp-comp" required value={formData.compensation} onChange={(e) => setFormData({ ...formData, compensation: e.target.value })} className="input-glass w-full" placeholder="e.g. Competitive / Advisory fee / Equity + stipend" />
                </div>
              </div>

              <div>
                <label htmlFor="opp-desc" className="text-sm text-[var(--text-secondary)] block mb-2">What is the project seeking? *</label>
                <textarea id="opp-desc" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-glass w-full min-h-[120px]" placeholder="Summarize the goal, who it is for, the expected impact, and what success looks like." />
              </div>

              <div>
                <label className="text-sm text-[var(--text-secondary)] block mb-2">Requirements</label>
                {formData.requirements.map((requirement, index) => (
                  <div key={`${requirement}-${index}`} className="flex gap-2 mb-2">
                    <input value={requirement} onChange={(e) => updateRequirement(index, e.target.value)} className="input-glass flex-1" placeholder="Requirement" />
                    <button type="button" onClick={() => removeRequirement(index)} className="sp-btn-glass px-3" aria-label="Remove requirement" title="Remove requirement">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addRequirement} className="sp-btn-glass text-sm">+ Add Requirement</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="opp-deadline" className="text-sm text-[var(--text-secondary)] block mb-2">When should people apply?</label>
                  <input
                    id="opp-deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="input-glass w-full"
                    disabled={formData.rollingDeadline}
                  />
                </div>
                <div>
                  <label htmlFor="opp-apply-link" className="text-sm text-[var(--text-secondary)] block mb-2">External application link (optional)</label>
                  <input
                    id="opp-apply-link"
                    type="url"
                    value={formData.applicationLink}
                    onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })}
                    className="input-glass w-full"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={formData.rollingDeadline}
                  onChange={(e) => setFormData({ ...formData, rollingDeadline: e.target.checked, deadline: e.target.checked ? '' : formData.deadline })}
                  className="w-4 h-4 rounded"
                />
                This opportunity has a rolling deadline.
              </label>

              <div>
                <label htmlFor="opp-tags" className="text-sm text-[var(--text-secondary)] block mb-2">Tags (comma-separated)</label>
                <input
                  id="opp-tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) })}
                  className="input-glass w-full"
                  placeholder="e.g. Advisory, County-level, Strategy"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="sp-btn-primary flex-1">{editingOpp ? 'Update' : 'Create'} Opportunity</button>
                <button type="button" onClick={() => setShowForm(false)} className="sp-btn-glass">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOpportunitiesManager;

