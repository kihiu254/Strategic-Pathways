import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getSafeErrorMessage } from '../../../lib/safeFeedback';
import { supabase } from '../../../lib/supabase';
import type { AdminRecord, DashboardMember } from '../types';
import AdminTeam from '../AdminTeam';

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  tier: string | null;
  verification_status: string | null;
  created_at: string;
  avatar_url: string | null;
};

const AdminAdminsPage = () => {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [members, setMembers] = useState<DashboardMember[]>([]);
  const [showPromoteList, setShowPromoteList] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [promoteSearch, setPromoteSearch] = useState('');
  const [newAdmin, setNewAdmin] = useState({ email: '', full_name: '', password: '' });

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, tier, verification_status, created_at, avatar_url')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = (data || []) as ProfileRow[];
      setAdmins(
        rows
          .filter((row) => row.role === 'admin')
          .map((row) => ({
            id: row.id,
            full_name: row.full_name,
            email: row.email || 'No email',
            role: row.role || 'admin',
            created_at: row.created_at,
            avatar_url: row.avatar_url,
          }))
      );
      setMembers(
        rows.map((row) => ({
          id: row.id,
          name: row.full_name || 'Unnamed member',
          email: row.email || 'No email',
          tier: row.tier || 'Community',
          projects: 0,
          rating: 0,
          status: row.verification_status || 'pending',
          joined: row.created_at,
          connections: 0,
          docs: {},
        }))
      );
    } catch (error) {
      console.error('Error loading admin team page:', error);
      toast.error('Admin team records could not be loaded.');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleMakeAdmin = async (id: string, email: string) => {
    try {
      const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', id);
      if (error) throw error;
      toast.success(`${email} now has admin access.`);
      await load();
    } catch (error) {
      console.error('Error promoting admin:', error);
      toast.error('Admin role could not be granted.');
    }
  };

  const handleRemoveAdmin = async (id: string) => {
    try {
      const { error } = await supabase.from('profiles').update({ role: 'user' }).eq('id', id);
      if (error) throw error;
      toast.success('Admin access revoked.');
      await load();
    } catch (error) {
      console.error('Error revoking admin role:', error);
      toast.error('Admin role could not be revoked.');
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.email.trim() || !newAdmin.full_name.trim()) {
      toast.error('Admin email and full name are required.');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: newAdmin.email.trim(),
        password: newAdmin.password.trim() || 'SpAdmin123!',
        options: { data: { full_name: newAdmin.full_name.trim() } },
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          email: newAdmin.email.trim(),
          full_name: newAdmin.full_name.trim(),
          role: 'admin',
        });

        if (profileError) throw profileError;
      }

      toast.success('Admin invitation created.');
      setShowAddAdmin(false);
      setNewAdmin({ email: '', full_name: '', password: '' });
      await load();
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error(getSafeErrorMessage(error, 'Admin invitation could not be created right now. Please try again.'));
    }
  };

  return (
    <div className="admin-section-shell">
      <div className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-4">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Admin access control</p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Promote trusted members, invite new admins, and keep a clean operator roster.
        </p>
      </div>
      <AdminTeam
        admins={admins}
        members={members}
        showPromoteList={showPromoteList}
        setShowPromoteList={setShowPromoteList}
        showAddAdmin={showAddAdmin}
        setShowAddAdmin={setShowAddAdmin}
        promoteSearch={promoteSearch}
        setPromoteSearch={setPromoteSearch}
        newAdmin={newAdmin}
        setNewAdmin={setNewAdmin}
        handleMakeAdmin={handleMakeAdmin}
        handleAddAdmin={handleAddAdmin}
        handleRemoveAdmin={handleRemoveAdmin}
      />
    </div>
  );
};

export default AdminAdminsPage;
