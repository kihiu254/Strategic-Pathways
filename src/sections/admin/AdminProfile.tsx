import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { AdminRecord } from './types';

interface AdminProfileProps {
  adminProfile: AdminRecord | null;
  userEmail?: string;
}

const AdminProfile: React.FC<AdminProfileProps> = ({
  adminProfile,
  userEmail
}) => {
  const { t } = useTranslation();

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
                {(adminProfile?.full_name || t('adminHeader.adminShort')).charAt(0).toUpperCase()}
              </span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-[var(--text-inverse)] text-[10px] font-bold uppercase tracking-widest">{t('adminProfile.update')}</span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{adminProfile?.full_name || t('adminHeader.adminUser')}</h3>
            <p className="text-[var(--sp-accent)] font-bold text-xs uppercase tracking-[0.2em] mt-1">{t('adminProfile.superAdministrator')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">{t('adminProfile.fullName')}</label>
            <input type="text" defaultValue={adminProfile?.full_name || t('adminHeader.adminUser')} className="input-glass w-full px-4 py-3" aria-label={t('adminProfile.fullName')} title={t('adminProfile.fullName')} />
          </div>
          <div className="space-y-2">
            <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">{t('adminProfile.emailAddress')}</label>
            <input type="email" defaultValue={adminProfile?.email || userEmail} className="input-glass w-full px-4 py-3" aria-label={t('adminProfile.emailAddress')} title={t('adminProfile.emailAddress')} />
          </div>
          <div className="space-y-2">
            <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">{t('adminProfile.phoneNumber')}</label>
            <input type="tel" defaultValue="+254 712 345 678" className="input-glass w-full px-4 py-3" aria-label={t('adminProfile.phoneNumber')} title={t('adminProfile.phoneNumber')} />
          </div>
          <div className="space-y-2">
            <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">{t('adminProfile.roleType')}</label>
            <input type="text" defaultValue={t('adminHeader.superAdmin')} className="input-glass w-full px-4 py-3 opacity-60 cursor-not-allowed" disabled aria-label={t('adminProfile.roleType')} title={t('adminProfile.roleType')} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">{t('adminProfile.professionalBio')}</label>
            <textarea
              className="input-glass w-full px-4 py-3 min-h-[120px] resize-none"
              defaultValue={t('adminProfile.bioDefault')}
              aria-label={t('adminProfile.professionalBio')}
              title={t('adminProfile.professionalBio')}
            />
          </div>
        </div>
      </div>

      <div className="admin-surface-card premium-glass p-8 rounded-[32px] border border-white/5 space-y-6">
        <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{t('adminProfile.accessControlSecurity')}</h3>
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">{t('adminProfile.currentPassword')}</label>
            <input type="password" placeholder="********" className="input-glass w-full px-4 py-3" aria-label={t('adminProfile.currentPassword')} title={t('adminProfile.currentPassword')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">{t('adminProfile.newPassword')}</label>
              <input type="password" placeholder={t('adminProfile.newPasswordPlaceholder')} className="input-glass w-full px-4 py-3" aria-label={t('adminProfile.newPassword')} title={t('adminProfile.newPassword')} />
            </div>
            <div className="space-y-2">
              <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">{t('adminProfile.confirmIdentity')}</label>
              <input type="password" placeholder={t('adminProfile.confirmIdentityPlaceholder')} className="input-glass w-full px-4 py-3" aria-label={t('adminProfile.confirmIdentity')} title={t('adminProfile.confirmIdentity')} />
            </div>
          </div>
          <button className="sp-btn-glass px-8 py-3 font-bold text-sm">{t('adminProfile.updateSecurityKeys')}</button>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={() => toast.success(t('adminProfile.syncComplete'))}
          className="sp-btn-primary flex-1 py-4 font-bold text-lg shadow-xl shadow-[var(--sp-accent)]/20 active:scale-[0.98] transition-all"
        >
          {t('adminProfile.saveIdentityChanges')}
        </button>
        <button className="sp-btn-glass px-12 py-4 font-bold">{t('dashboard.buttons.cancel')}</button>
      </div>
    </div>
  );
};

export default AdminProfile;
