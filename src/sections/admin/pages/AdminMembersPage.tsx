import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Search, Shield, UserCheck, Users } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatAdminDate, getStatusTone } from '../helpers';

type MemberRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  tier: string | null;
  verification_status: string | null;
  onboarding_completed: boolean | null;
  created_at: string | null;
  professional_title: string | null;
};

const AdminMembersPage = () => {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(
            'id, full_name, email, role, tier, verification_status, onboarding_completed, created_at, professional_title'
          )
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMembers((data || []) as MemberRow[]);
      } catch (error) {
        console.error('Error loading admin member directory:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesQuery =
        !query ||
        [member.full_name, member.email, member.professional_title]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(query.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || (member.verification_status || 'pending') === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [members, query, statusFilter]);

  const summary = {
    total: members.length,
    verified: members.filter((member) => member.verification_status === 'approved').length,
    onboarded: members.filter((member) => member.onboarding_completed).length,
    admins: members.filter((member) => member.role === 'admin').length,
  };

  return (
    <div className="admin-section-shell">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total members', value: summary.total, icon: Users },
          { label: 'Verified profiles', value: summary.verified, icon: UserCheck },
          { label: 'Onboarding complete', value: summary.onboarded, icon: Shield },
          { label: 'Admin accounts', value: summary.admins, icon: Shield },
        ].map((item) => (
          <div key={item.label} className="admin-surface-card premium-glass p-5 rounded-[24px] border border-white/5">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-white/5 text-[var(--sp-accent)]">
                <item.icon size={18} />
              </div>
              <span className="text-3xl font-bold text-[var(--text-primary)]">{item.value}</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-secondary)] mt-4">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div className="admin-surface-card premium-glass p-6 rounded-[28px] border border-white/5">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search members by name, email, or title"
              className="input-glass pl-10 pr-4 py-3 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="input-glass px-4 py-3 w-full lg:w-auto"
            title="Filter members by verification status"
          >
            <option value="all">All verification states</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="admin-surface-card premium-glass rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-[var(--text-secondary)] text-[10px] uppercase tracking-[0.2em] font-bold">
              <tr>
                <th className="px-6 py-5">Member</th>
                <th className="px-6 py-5">Verification</th>
                <th className="px-6 py-5">Tier</th>
                <th className="px-6 py-5">Joined</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5">
                    <div className="space-y-1 min-w-[240px]">
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        {member.full_name || 'Unnamed member'}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">{member.email || 'No email provided'}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {member.professional_title || 'Professional title not provided'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusTone(member.verification_status)}`}>
                      {member.verification_status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-[var(--text-secondary)]">
                    {member.role === 'admin' ? 'Admin' : member.tier || 'Community'}
                  </td>
                  <td className="px-6 py-5 text-sm text-[var(--text-secondary)]">
                    {formatAdminDate(member.created_at)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/user/${member.id}`} className="sp-btn-glass px-3 py-2 text-xs">
                        Review profile
                      </Link>
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="sp-btn-glass px-3 py-2 text-xs inline-flex items-center gap-2">
                          <Mail size={14} />
                          Email
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                    No members match the current search.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                    Loading member directory...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminMembersPage;
