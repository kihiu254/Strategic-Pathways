import React from 'react';
import { useTranslation } from 'react-i18next';

interface Tier {
  name: string;
  price: string;
  features: number;
}

interface AdminSettingsProps {
  tierData: Record<string, Tier>;
  setTierData: (data: Record<string, Tier>) => void;
  editingTier: string | null;
  setEditingTier: (tier: string | null) => void;
  handleSaveTier: (tierName: string) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({
  tierData,
  setTierData,
  editingTier,
  setEditingTier,
  handleSaveTier
}) => {
  const { t } = useTranslation();

  return (
    <div className="admin-section-shell max-w-3xl">
      <div className="mb-6" />
      
      <div className="admin-surface-card premium-glass p-8 rounded-[32px] border border-white/5 space-y-6">
        <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{t('dashboard.settings.general')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">{t('dashboard.settings.platformName')}</label>
            <input type="text" defaultValue="Strategic Pathways" className="input-glass w-full px-4 py-3" aria-label="Platform name" title="Platform name" />
          </div>
          <div className="space-y-2">
            <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">{t('dashboard.settings.contactEmail')}</label>
            <input type="email" defaultValue="joinstrategicpathways@gmail.com" className="input-glass w-full px-4 py-3" aria-label="Contact email" title="Contact email" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">{t('dashboard.settings.defaultCurrency')}</label>
            <select className="input-glass w-full px-4 py-3" aria-label="Default currency" title="Default currency">
              <option value="KES">Kenyan Shilling (KSh)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-surface-card premium-glass p-8 rounded-[32px] border border-white/5 space-y-6">
        <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{t('dashboard.settings.membershipTiers')}</h3>
        <div className="grid grid-cols-1 gap-4">
          {Object.values(tierData).map((tier) => (
            <div key={tier.name} className={`glass-light rounded-[24px] p-6 border transition-all ${editingTier === tier.name ? 'border-[var(--sp-accent)]/50 ring-1 ring-[var(--sp-accent)]/50' : 'border-white/5'}`}>
              {editingTier === tier.name ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      value={tier.name}
                      onChange={(e) => setTierData({...tierData, [tier.name]: {...tier, name: e.target.value}})}
                      className="input-glass w-full px-4 py-2"
                      placeholder="Tier Name"
                      aria-label={`Tier name for ${tier.name}`}
                      title={`Tier name for ${tier.name}`}
                    />
                    <input
                      value={tier.price}
                      onChange={(e) => setTierData({...tierData, [tier.name]: {...tier, price: e.target.value}})}
                      className="input-glass w-full px-4 py-2"
                      placeholder="Price"
                      aria-label={`Tier price for ${tier.name}`}
                      title={`Tier price for ${tier.name}`}
                    />
                  </div>
                  <input
                    type="number"
                    value={tier.features}
                    onChange={(e) => setTierData({...tierData, [tier.name]: {...tier, features: parseInt(e.target.value)}})}
                    className="input-glass w-full px-4 py-2"
                    placeholder="Number of features"
                    aria-label={`Number of features for ${tier.name}`}
                    title={`Number of features for ${tier.name}`}
                  />
                  <div className="flex gap-3">
                    <button onClick={() => handleSaveTier(tier.name)} className="sp-btn-primary px-6 py-2">
                      Save Tier
                    </button>
                    <button onClick={() => setEditingTier(null)} className="sp-btn-glass px-6 py-2">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--sp-accent)] transition-colors">{tier.name}</h4>
                    <p className="text-[var(--text-secondary)] text-sm opacity-70 font-medium mt-1">{tier.features} features &middot; {tier.price}</p>
                  </div>
                  <button onClick={() => setEditingTier(tier.name)} className="sp-btn-glass px-6 py-2 font-bold tracking-wide">Edit</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="admin-surface-card premium-glass p-8 rounded-[32px] border border-white/5 space-y-6">
        <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{t('dashboard.settings.notifications')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            'Email notifications for new applications',
            'Email notifications for project updates',
            'Weekly summary reports',
            'Member activity alerts',
          ].map((setting, i) => (
            <label key={i} className="flex items-center gap-4 cursor-pointer glass-light p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors group">
              <input 
                type="checkbox" 
                defaultChecked 
                className="w-5 h-5 rounded-lg border-[var(--sp-accent)]/30 bg-white/5 text-[var(--sp-accent)] focus:ring-[var(--sp-accent)] focus:ring-offset-[var(--bg-primary)] transition-all cursor-pointer" 
                aria-label={setting} 
                title={setting} 
              />
              <span className="text-[var(--text-secondary)] text-sm font-medium group-hover:text-[var(--text-primary)] transition-colors">{setting}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button className="sp-btn-primary flex-1 py-4 font-bold text-lg">{t('dashboard.buttons.saveChanges')}</button>
        <button className="sp-btn-glass px-12 py-4 font-bold">{t('dashboard.buttons.cancel')}</button>
      </div>
    </div>
  );
};

export default AdminSettings;
