import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Download, RotateCcw, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

type SiteContentDraft = {
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  valuesHeadline: string;
  valuesBody: string;
  valuesCta: string;
  subscriptionHeadline: string;
  subscriptionBody: string;
  subscriptionCta: string;
  impactIntro: string;
  impactCta: string;
  announcementHeadline: string;
  announcementBody: string;
  seoTitle: string;
  seoDescription: string;
  footerTagline: string;
};

const STORAGE_KEY = 'sp_admin_site_content_draft';

const countWords = (value: string) => {
  if (!value.trim()) return 0;
  return value.trim().split(/\s+/).length;
};

const AdminSiteContentPage = () => {
  const { t } = useTranslation();
  const defaultDraft = useMemo<SiteContentDraft>(
    () => ({
      heroHeadline: t('siteContent.defaults.heroHeadline'),
      heroSubheadline: t('siteContent.defaults.heroSubheadline'),
      heroCtaPrimary: t('siteContent.defaults.heroCtaPrimary'),
      heroCtaSecondary: t('siteContent.defaults.heroCtaSecondary'),
      valuesHeadline: t('siteContent.defaults.valuesHeadline'),
      valuesBody: t('siteContent.defaults.valuesBody'),
      valuesCta: t('siteContent.defaults.valuesCta'),
      subscriptionHeadline: t('siteContent.defaults.subscriptionHeadline'),
      subscriptionBody: t('siteContent.defaults.subscriptionBody'),
      subscriptionCta: t('siteContent.defaults.subscriptionCta'),
      impactIntro: t('siteContent.defaults.impactIntro'),
      impactCta: t('siteContent.defaults.impactCta'),
      announcementHeadline: t('siteContent.defaults.announcementHeadline'),
      announcementBody: t('siteContent.defaults.announcementBody'),
      seoTitle: t('siteContent.defaults.seoTitle'),
      seoDescription: t('siteContent.defaults.seoDescription'),
      footerTagline: t('siteContent.defaults.footerTagline'),
    }),
    [t]
  );
  const [draft, setDraft] = useState<SiteContentDraft>(defaultDraft);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const skipAutoSave = useRef(true);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setDraft(defaultDraft);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as
        | { draft?: Partial<SiteContentDraft>; updatedAt?: string }
        | Partial<SiteContentDraft>;

      if (parsed && typeof parsed === 'object' && 'draft' in parsed) {
        const merged = { ...defaultDraft, ...(parsed.draft || {}) };
        setDraft(merged);
        if (parsed.updatedAt) {
          setLastSaved(new Date(parsed.updatedAt));
        }
      } else {
        setDraft({ ...defaultDraft, ...(parsed as Partial<SiteContentDraft>) });
      }
    } catch (error) {
      console.warn('Could not parse saved site content draft:', error);
      setDraft(defaultDraft);
    }
  }, [defaultDraft]);

  const persistDraft = (nextDraft: SiteContentDraft) => {
    const payload = {
      draft: nextDraft,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setLastSaved(new Date(payload.updatedAt));
  };

  useEffect(() => {
    if (skipAutoSave.current) {
      skipAutoSave.current = false;
      return;
    }
    setIsAutoSaving(true);
    const timer = window.setTimeout(() => {
      persistDraft(draft);
      setIsAutoSaving(false);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [draft]);

  const updateField = (field: keyof SiteContentDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const saveDraft = () => {
    persistDraft(draft);
    setIsAutoSaving(false);
    toast.success(t('siteContent.actions.saved'));
  };

  const resetDraft = () => {
    setDraft(defaultDraft);
    persistDraft(defaultDraft);
    setIsAutoSaving(false);
    toast.success(t('siteContent.actions.reset'));
  };

  const exportDraft = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'site-content-draft.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(draft, null, 2));
      toast.success(t('siteContent.actions.copied'));
    } catch (error) {
      console.error('Failed to copy site content JSON:', error);
      toast.error(t('siteContent.actions.copyFailed'));
    }
  };

  const sections = [
    {
      title: t('siteContent.sections.hero.title'),
      description: t('siteContent.sections.hero.description'),
      fields: [
        { key: 'heroHeadline', label: t('siteContent.fields.heroHeadline'), rows: 3 },
        { key: 'heroSubheadline', label: t('siteContent.fields.heroSubheadline'), rows: 3 },
      ],
    },
    {
      title: t('siteContent.sections.heroCta.title'),
      description: t('siteContent.sections.heroCta.description'),
      fields: [
        { key: 'heroCtaPrimary', label: t('siteContent.fields.heroCtaPrimary'), rows: 2 },
        { key: 'heroCtaSecondary', label: t('siteContent.fields.heroCtaSecondary'), rows: 2 },
      ],
    },
    {
      title: t('siteContent.sections.values.title'),
      description: t('siteContent.sections.values.description'),
      fields: [
        { key: 'valuesHeadline', label: t('siteContent.fields.valuesHeadline'), rows: 2 },
        { key: 'valuesBody', label: t('siteContent.fields.valuesBody'), rows: 4 },
        { key: 'valuesCta', label: t('siteContent.fields.valuesCta'), rows: 2 },
      ],
    },
    {
      title: t('siteContent.sections.subscription.title'),
      description: t('siteContent.sections.subscription.description'),
      fields: [
        { key: 'subscriptionHeadline', label: t('siteContent.fields.subscriptionHeadline'), rows: 2 },
        { key: 'subscriptionBody', label: t('siteContent.fields.subscriptionBody'), rows: 4 },
        { key: 'subscriptionCta', label: t('siteContent.fields.subscriptionCta'), rows: 2 },
      ],
    },
    {
      title: t('siteContent.sections.impact.title'),
      description: t('siteContent.sections.impact.description'),
      fields: [
        { key: 'impactIntro', label: t('siteContent.fields.impactIntro'), rows: 3 },
        { key: 'impactCta', label: t('siteContent.fields.impactCta'), rows: 2 },
      ],
    },
    {
      title: t('siteContent.sections.announcement.title'),
      description: t('siteContent.sections.announcement.description'),
      fields: [
        { key: 'announcementHeadline', label: t('siteContent.fields.announcementHeadline'), rows: 2 },
        { key: 'announcementBody', label: t('siteContent.fields.announcementBody'), rows: 3 },
      ],
    },
    {
      title: t('siteContent.sections.seo.title'),
      description: t('siteContent.sections.seo.description'),
      fields: [
        { key: 'seoTitle', label: t('siteContent.fields.seoTitle'), rows: 2 },
        { key: 'seoDescription', label: t('siteContent.fields.seoDescription'), rows: 3 },
      ],
    },
    {
      title: t('siteContent.sections.footer.title'),
      description: t('siteContent.sections.footer.description'),
      fields: [
        { key: 'footerTagline', label: t('siteContent.fields.footerTagline'), rows: 2 },
      ],
    },
  ];

  const formattedSavedAt =
    lastSaved?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';
  const statusLabel = lastSaved
    ? t('siteContent.status.saved', { time: formattedSavedAt })
    : t('siteContent.status.notSaved');

  return (
    <div className="admin-section-shell">
      <div className="rounded-[24px] border border-[var(--sp-accent)]/20 bg-[var(--sp-accent)]/10 px-5 py-4">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{t('siteContent.bannerTitle')}</p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          {t('siteContent.bannerBody')}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[var(--text-secondary)]">
            {isAutoSaving ? t('siteContent.status.autosaving') : statusLabel}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[var(--text-secondary)]">
            {t('siteContent.status.localOnly')}
          </span>
        </div>
      </div>

      <div className="admin-surface-card premium-glass p-6 rounded-[28px] border border-white/5 space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="glass-light rounded-[24px] p-5 border border-white/5 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{section.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{section.description}</p>
            </div>
            <div className="space-y-4">
              {section.fields.map((field) => {
                const value = draft[field.key as keyof SiteContentDraft];
                return (
                  <div key={field.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest pl-1">
                        {field.label}
                      </label>
                      <span className="text-[10px] text-[var(--text-secondary)]/70">
                        {t('siteContent.counters.words', { count: countWords(value) })}
                      </span>
                    </div>
                    <textarea
                      value={value}
                      onChange={(event) =>
                        updateField(field.key as keyof SiteContentDraft, event.target.value)
                      }
                      rows={field.rows}
                      className="input-glass w-full px-4 py-3 resize-none"
                      aria-label={field.label}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex flex-wrap gap-3">
          <button onClick={saveDraft} className="sp-btn-primary px-5 py-3 inline-flex items-center gap-2">
            <Save size={16} />
            {t('siteContent.actions.save')}
          </button>
          <button onClick={copyDraft} className="sp-btn-glass px-5 py-3 inline-flex items-center gap-2">
            <Copy size={16} />
            {t('siteContent.actions.copy')}
          </button>
          <button onClick={exportDraft} className="sp-btn-glass px-5 py-3 inline-flex items-center gap-2">
            <Download size={16} />
            {t('siteContent.actions.export')}
          </button>
          <button onClick={resetDraft} className="sp-btn-glass px-5 py-3 inline-flex items-center gap-2">
            <RotateCcw size={16} />
            {t('siteContent.actions.resetButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSiteContentPage;
