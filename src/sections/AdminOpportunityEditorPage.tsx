import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { getSafeErrorMessage } from '../lib/safeFeedback';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

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

type Opportunity = {
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
};

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

const baseOpportunity = (): Opportunity => ({
  title: '',
  organization: '',
  location: '',
  type: 'Project-based',
  duration: '',
  description: '',
  requirements: [],
  compensation: '',
  sector: 'Technology',
  tags: [],
  deadline: '',
  status: 'active',
  ownership: 'Private',
  applicationLink: '',
  rollingDeadline: false,
});

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
    requirements: Array.isArray(row.requirements) ? row.requirements : [],
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

const validateOpportunity = (opportunity: Opportunity): string | null => {
  if (opportunity.title.trim().length < 8) return 'Add a clearer opportunity title with at least 8 characters.';
  if (opportunity.organization.trim().length < 2) return 'Add the organization or team leading this opportunity.';
  if (opportunity.location.trim().length < 2) return 'Add where the work will happen.';
  if (opportunity.duration.trim().length < 3) return 'Add a meaningful duration for the opportunity.';
  if (opportunity.compensation.trim().length < 3) return 'Add compensation details instead of leaving this too shallow.';
  if (opportunity.description.trim().length < 120) return 'Add a fuller opportunity description with at least 120 characters.';
  if (!opportunity.rollingDeadline && !opportunity.deadline) return 'Add a deadline or mark the opportunity as rolling.';

  if (opportunity.applicationLink.trim()) {
    try {
      new URL(opportunity.applicationLink.trim());
    } catch {
      return 'The external application link must be a valid URL.';
    }
  }

  return null;
};

const AdminOpportunityEditorPage = () => {
  const navigate = useNavigate();
  const { opportunityId } = useParams();
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(Boolean(opportunityId));
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Opportunity>(baseOpportunity());
  const [tagInput, setTagInput] = useState('');

  const isEditing = useMemo(() => Boolean(opportunityId), [opportunityId]);

  useEffect(() => {
    if (!opportunityId) return;

    const loadOpportunity = async () => {
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .eq('id', opportunityId)
          .single();

        if (error) throw error;
        setFormData(parseOpportunity(data as OpportunityRow));
      } catch (error) {
        console.error('Failed to load opportunity:', error);
        toast.error('That opportunity could not be loaded right now. Please try again shortly.');
        navigate('/admin/opportunities');
      } finally {
        setIsLoading(false);
      }
    };

    void loadOpportunity();
  }, [navigate, opportunityId]);

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

  const addTag = (rawTag: string) => {
    const cleaned = rawTag.trim();
    if (!cleaned) return;

    const normalized = cleaned.toLowerCase();
    const existing = formData.tags.some((tag) => tag.toLowerCase() === normalized);
    if (existing) {
      setTagInput('');
      return;
    }

    setFormData({ ...formData, tags: [...formData.tags, cleaned] });
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateOpportunity(formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSaving(true);
    try {
      const payload = serializeOpportunity(formData, user?.id);

      if (isEditing && opportunityId) {
        const { error } = await supabase.from('opportunities').update(payload).eq('id', opportunityId);
        if (error) throw error;
        toast.success('Opportunity updated.');
      } else {
        const { error } = await supabase.from('opportunities').insert([payload]);
        if (error) throw error;
        toast.success('Opportunity created.');
      }

      navigate('/admin/opportunities');
    } catch (error) {
      toast.error(getSafeErrorMessage(error, 'We could not save that opportunity right now. Please try again shortly.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading opportunity editor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-6">
        <button
          onClick={() => {
            navigate('/admin/opportunities');
          }}
          className="sp-btn-glass mb-6 flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to Admin
        </button>

        <div className="glass-card rounded-[32px] border border-white/10 p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--sp-accent)] font-bold mb-3">Opportunity Editor</p>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                {isEditing ? 'Edit Opportunity' : 'Create Opportunity'}
              </h1>
              <p className="text-[var(--text-secondary)] mt-3 max-w-2xl">
                Publish a complete opportunity page with enough detail for members to understand the role, fit, and expected outcome before they apply.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 max-w-sm">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Quality guardrails</p>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                Keep descriptions detailed, and add requirements or tags only when they genuinely help applicants understand the opportunity.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="opp-title" className="text-sm text-[var(--text-secondary)] block mb-2">Opportunity title *</label>
                <input
                  id="opp-title"
                  required
                  minLength={8}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-glass w-full"
                  placeholder="e.g. National SME Growth Strategy Lead"
                />
              </div>
              <div>
                <label htmlFor="opp-org" className="text-sm text-[var(--text-secondary)] block mb-2">Organization / lead team *</label>
                <input
                  id="opp-org"
                  required
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="input-glass w-full"
                  placeholder="Strategic Pathways / Partner organization"
                />
              </div>
              <div>
                <label htmlFor="opp-loc" className="text-sm text-[var(--text-secondary)] block mb-2">Location *</label>
                <input
                  id="opp-loc"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-glass w-full"
                  placeholder="Nairobi / Hybrid / Remote"
                />
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
                <label htmlFor="opp-duration" className="text-sm text-[var(--text-secondary)] block mb-2">Duration *</label>
                <input
                  id="opp-duration"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="input-glass w-full"
                  placeholder="e.g. 6 months, 12-week sprint, rolling advisory support"
                />
              </div>
              <div>
                <label htmlFor="opp-comp" className="text-sm text-[var(--text-secondary)] block mb-2">Compensation *</label>
                <input
                  id="opp-comp"
                  required
                  value={formData.compensation}
                  onChange={(e) => setFormData({ ...formData, compensation: e.target.value })}
                  className="input-glass w-full"
                  placeholder="e.g. KSh 250,000/month, advisory fee, equity + stipend"
                />
              </div>
            </div>

            <div>
              <label htmlFor="opp-desc" className="text-sm text-[var(--text-secondary)] block mb-2">Opportunity description *</label>
              <textarea
                id="opp-desc"
                required
                minLength={120}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-glass w-full min-h-[180px]"
                placeholder="Describe the context, goals, scope, expected deliverables, and why this opportunity matters."
              />
              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                Aim for enough detail that a strong applicant can decide whether to apply without guessing.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <label className="text-sm text-[var(--text-secondary)] block">Requirements (optional)</label>
                <button type="button" onClick={addRequirement} className="sp-btn-glass text-sm flex items-center gap-2">
                  <Plus size={14} />
                  Add Requirement
                </button>
              </div>
              <div className="space-y-3">
                {formData.requirements.length === 0 && (
                  <p className="text-xs text-[var(--text-secondary)]">
                    Add requirements only if they genuinely help applicants understand the opportunity.
                  </p>
                )}
                {formData.requirements.map((requirement, index) => (
                  <div key={`requirement-${index}`} className="flex gap-2">
                    <input
                      value={requirement}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      className="input-glass flex-1"
                      placeholder={`Requirement ${index + 1}`}
                    />
                    <button type="button" onClick={() => removeRequirement(index)} className="sp-btn-glass px-3" aria-label="Remove requirement" title="Remove requirement">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="opp-deadline" className="text-sm text-[var(--text-secondary)] block mb-2">Application deadline</label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="opp-tags" className="text-sm text-[var(--text-secondary)] block mb-2">Tags (optional)</label>
                <div className="space-y-3">
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--text-primary)]"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            aria-label={`Remove tag ${tag}`}
                            title={`Remove tag ${tag}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      id="opp-tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Tab') {
                          e.preventDefault();
                          addTag(tagInput);
                        }
                      }}
                      className="input-glass w-full"
                      placeholder="Type a tag and press Enter"
                    />
                    <button
                      type="button"
                      onClick={() => addTag(tagInput)}
                      className="sp-btn-glass px-4 text-sm"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">Optional. Press Enter after each tag if you want to add them.</p>
                </div>
              </div>
              <div>
                <label htmlFor="opp-status" className="text-sm text-[var(--text-secondary)] block mb-2">Status</label>
                <select id="opp-status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Opportunity['status'] })} className="input-glass w-full">
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={isSaving} className="sp-btn-primary flex-1 flex items-center justify-center gap-2">
                {isSaving ? <Save size={16} className="animate-pulse" /> : <Save size={16} />}
                {isEditing ? 'Update Opportunity' : 'Publish Opportunity'}
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate('/admin/opportunities');
                }}
                className="sp-btn-glass flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminOpportunityEditorPage;
