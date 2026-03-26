import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import AdminSettings from '../AdminSettings';

const AdminSettingsPage = () => {
  const { t } = useTranslation();
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [tierData, setTierData] = useState({
    Community: { name: 'Community', price: 'Free', features: 3 },
    Professional: { name: 'Professional', price: 'only $100/year (or $10/month)', features: 6 },
    Firm: { name: 'Firm', price: 'Custom', features: 8 },
  });

  return (
    <div className="admin-section-shell">
      <div className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-4">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{t('adminSettingsPage.title')}</p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          {t('adminSettingsPage.subtitle')}
        </p>
      </div>
      <AdminSettings
        tierData={tierData}
        setTierData={setTierData}
        editingTier={editingTier}
        setEditingTier={setEditingTier}
        handleSaveTier={(tierName) => {
          toast.success(t('adminSettingsPage.saved', { tier: tierName }));
          setEditingTier(null);
        }}
      />
    </div>
  );
};

export default AdminSettingsPage;
