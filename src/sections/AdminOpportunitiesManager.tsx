import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Eye, X, Calendar, Users, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

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
}

const AdminOpportunitiesManager = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<Opportunity>({
    title: '',
    organization: '',
    location: '',
    type: 'Full-time',
    duration: '',
    description: '',
    requirements: [''],
    compensation: '',
    sector: 'Technology',
    tags: [],
    deadline: '',
    status: 'active'
  });

  useEffect(() => {
    fetchOpportunities();
    fetchApplications();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunity_applications')
        .select(`
          *,
          opportunity:opportunities(title),
          profile:profiles(full_name, email)
        `)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingOpp?.id) {
        const { error } = await supabase
          .from('opportunities')
          .update(formData)
          .eq('id', editingOpp.id);

        if (error) throw error;
        toast.success('Opportunity updated!');
      } else {
        const { error } = await supabase
          .from('opportunities')
          .insert([formData]);

        if (error) throw error;
        toast.success('Opportunity created!');
      }

      setShowForm(false);
      setEditingOpp(null);
      resetForm();
      fetchOpportunities();
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this opportunity?')) return;

    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Opportunity deleted');
      fetchOpportunities();
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    }
  };

  const handleEdit = (opp: Opportunity) => {
    setEditingOpp(opp);
    setFormData(opp);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      organization: '',
      location: '',
      type: 'Full-time',
      duration: '',
      description: '',
      requirements: [''],
      compensation: '',
      sector: 'Technology',
      tags: [],
      deadline: '',
      status: 'active'
    });
  };

  const addRequirement = () => {
    setFormData({ ...formData, requirements: [...formData.requirements, ''] });
  };

  const updateRequirement = (index: number, value: string) => {
    const newReqs = [...formData.requirements];
    newReqs[index] = value;
    setFormData({ ...formData, requirements: newReqs });
  };

  const removeRequirement = (index: number) => {
    setFormData({ ...formData, requirements: formData.requirements.filter((_, i) => i !== index) });
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Opportunities Management</h2>
          <p className="text-[var(--text-secondary)]">Create and manage opportunities</p>
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

      {/* Stats */}
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
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {opportunities.filter(o => o.status === 'active').length}
          </div>
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
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {applications.filter(a => a.status === 'pending').length}
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">All Opportunities</h3>
        <div className="space-y-3">
          {opportunities.map((opp) => (
            <div key={opp.id} className="glass-light p-4 rounded-xl flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-bold text-[var(--text-primary)]">{opp.title}</h4>
                <p className="text-sm text-[var(--text-secondary)]">{opp.organization} • {opp.location}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${opp.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                    {opp.status}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-[var(--sp-accent)]/10 text-[var(--sp-accent)] text-xs">
                    {opp.sector}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(opp)} className="p-2 hover:bg-white/5 rounded-lg">
                  <Edit2 size={16} className="text-blue-400" />
                </button>
                <button onClick={() => handleDelete(opp.id!)} className="p-2 hover:bg-white/5 rounded-lg">
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-card max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[var(--bg-card)] border-b border-white/10 p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                {editingOpp ? 'Edit' : 'Add'} Opportunity
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[var(--text-secondary)] block mb-2">Title *</label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-glass w-full"
                  />
                </div>

                <div>
                  <label className="text-sm text-[var(--text-secondary)] block mb-2">Organization *</label>
                  <input
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="input-glass w-full"
                  />
                </div>

                <div>
                  <label className="text-sm text-[var(--text-secondary)] block mb-2">Location *</label>
                  <input
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-glass w-full"
                  />
                </div>

                <div>
                  <label className="text-sm text-[var(--text-secondary)] block mb-2">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-glass w-full"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Advisory</option>
                    <option>Consulting</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-[var(--text-secondary)] block mb-2">Duration *</label>
                  <input
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input-glass w-full"
                    placeholder="e.g., 6 months"
                  />
                </div>

                <div>
                  <label className="text-sm text-[var(--text-secondary)] block mb-2">Compensation *</label>
                  <input
                    required
                    value={formData.compensation}
                    onChange={(e) => setFormData({ ...formData, compensation: e.target.value })}
                    className="input-glass w-full"
                    placeholder="e.g., Competitive"
                  />
                </div>

                <div>
                  <label className="text-sm text-[var(--text-secondary)] block mb-2">Sector *</label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="input-glass w-full"
                  >
                    <option>Technology</option>
                    <option>Agriculture</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>Education</option>
                    <option>Public Sector</option>
                    <option>NGO</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-[var(--text-secondary)] block mb-2">Deadline *</label>
                  <input
                    required
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="input-glass w-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-[var(--text-secondary)] block mb-2">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-glass w-full min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm text-[var(--text-secondary)] block mb-2">Requirements</label>
                {formData.requirements.map((req, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      value={req}
                      onChange={(e) => updateRequirement(i, e.target.value)}
                      className="input-glass flex-1"
                      placeholder="Requirement"
                    />
                    <button type="button" onClick={() => removeRequirement(i)} className="sp-btn-glass px-3">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addRequirement} className="sp-btn-glass text-sm">
                  + Add Requirement
                </button>
              </div>

              <div>
                <label className="text-sm text-[var(--text-secondary)] block mb-2">Tags (comma-separated)</label>
                <input
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
                  className="input-glass w-full"
                  placeholder="e.g., Remote, Leadership, Innovation"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="sp-btn-primary flex-1">
                  {editingOpp ? 'Update' : 'Create'} Opportunity
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="sp-btn-glass">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOpportunitiesManager;
