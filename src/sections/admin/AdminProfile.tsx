import type { AdminRecord } from './types';

interface AdminProfileProps {
  adminProfile: AdminRecord | null;
  userEmail?: string;
}

const AdminProfile: React.FC<AdminProfileProps> = ({
  adminProfile,
  userEmail
}) => {

  return (
    <div className="admin-section-shell max-w-3xl">
      <div className="mb-6" />
      
      <div className="admin-surface-card premium-glass p-8 rounded-[32px] border border-white/5 space-y-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-[#C89F5E] to-[#8B7355] flex items-center justify-center shadow-2xl relative group cursor-pointer overflow-hidden">
            {adminProfile?.avatar_url ? (
              <img src={adminProfile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-[32px] group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <span className="text-[var(--text-inverse)] font-bold text-4xl">
                {(adminProfile?.full_name || 'A').charAt(0).toUpperCase()}
              </span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-[var(--text-inverse)] text-[10px] font-bold uppercase tracking-widest">Update</span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{adminProfile?.full_name || 'Admin User'}</h3>
            <p className="text-[var(--sp-accent)] font-bold text-xs uppercase tracking-[0.2em] mt-1">Super Administrator</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">Full Name</label>
            <input type="text" defaultValue={adminProfile?.full_name || "Admin User"} className="input-glass w-full px-4 py-3" aria-label="Full name" title="Full name" />
          </div>
          <div className="space-y-2">
            <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">Email Address</label>
            <input type="email" defaultValue={adminProfile?.email || userEmail} className="input-glass w-full px-4 py-3" aria-label="Email" title="Email" />
          </div>
          <div className="space-y-2">
            <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">Phone Number</label>
            <input type="tel" defaultValue="+254 712 345 678" className="input-glass w-full px-4 py-3" aria-label="Phone" title="Phone" />
          </div>
          <div className="space-y-2">
            <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">Role Type</label>
            <input type="text" defaultValue="Super Admin" className="input-glass w-full px-4 py-3 opacity-60 cursor-not-allowed" disabled aria-label="Role" title="Role" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">Professional Bio</label>
            <textarea 
              className="input-glass w-full px-4 py-3 min-h-[120px] resize-none" 
              defaultValue="Platform administrator managing Strategic Pathways operations and member verification workflows."
              aria-label="Bio"
              title="Bio"
            />
          </div>
        </div>
      </div>

      <div className="admin-surface-card premium-glass p-8 rounded-[32px] border border-white/5 space-y-6">
        <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Access Control & Security</h3>
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">Current Password</label>
            <input type="password" placeholder="••••••••" className="input-glass w-full px-4 py-3" aria-label="Current password" title="Current password" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">New Password</label>
              <input type="password" placeholder="Min 8 characters" className="input-glass w-full px-4 py-3" aria-label="New password" title="New password" />
            </div>
            <div className="space-y-2">
              <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">Confirm Identity</label>
              <input type="password" placeholder="Repeat password" className="input-glass w-full px-4 py-3" aria-label="Confirm new password" title="Confirm new password" />
            </div>
          </div>
          <button className="sp-btn-glass px-8 py-3 font-bold text-sm">Update Security Keys</button>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button 
          onClick={() => toast.success('Profile synchronization complete.')}
          className="sp-btn-primary flex-1 py-4 font-bold text-lg shadow-xl shadow-[var(--sp-accent)]/20 active:scale-[0.98] transition-all"
        >
          Save Identity Changes
        </button>
        <button className="sp-btn-glass px-12 py-4 font-bold">Cancel</button>
      </div>
    </div>
  );
};

export default AdminProfile;
