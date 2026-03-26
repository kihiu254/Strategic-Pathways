import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Download, Eye, Globe, GraduationCap, Printer, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { formatAdminDate } from './admin/helpers';

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  profile_type?: string;
  user_category?: string;
  verification_tier?: string;
  verification_status?: string;
  created_at?: string;
  updated_at?: string;
  country_code?: string;
  phone?: string;
  location?: string;
  nationality?: string;
  education?: any;
  verification_docs?: any;
  engagement_types?: string[];
  availability?: string;
  preferred_format?: string;
  expertise?: string[];
  sector?: string;
  employment_status?: string;
  organisation?: string;
};

const ARCHIVE_STORAGE_KEY = 'sp_admin_archived_onboarding_records';

const AdminOnboardingList = () => {
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(ARCHIVE_STORAGE_KEY);
    if (!stored) return;

    try {
      setArchivedIds(JSON.parse(stored) as string[]);
    } catch (error) {
      console.warn('Could not parse archived onboarding IDs:', error);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(archivedIds));
  }, [archivedIds]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id, full_name, email, profile_type, user_category,
            verification_tier, verification_status, created_at, updated_at,
            country_code, phone, location, nationality,
            education, verification_docs,
            engagement_types, availability, preferred_format,
            expertise, sector, employment_status, organisation
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRows((data || []) as ProfileRow[]);
      } catch (error) {
        console.error('Error loading onboarding records:', error);
        toast.error('Onboarding records could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const archived = archivedIds.includes(row.id);
      const matchesArchive = showArchivedOnly ? archived : !archived;
      const matchesQuery =
        !query ||
        [row.full_name, row.email, row.profile_type, row.user_category]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(query.toLowerCase()));

      return matchesArchive && matchesQuery;
    });
  }, [archivedIds, query, rows, showArchivedOnly]);

  const csv = useMemo(() => {
    if (!filteredRows.length) return '';

    const headers = [
      'id',
      'full_name',
      'email',
      'profile_type',
      'user_category',
      'verification_tier',
      'verification_status',
      'created_at',
      'location',
      'nationality',
      'education.level',
      'education.country',
      'education.institutions',
      'education.field',
      'education.other_countries',
      'education.worked_countries',
      'languagesSpoken',
    ];

    const toRow = (row: ProfileRow) => {
      const education = row.education || {};
      const languages = Array.isArray(education.languages)
        ? education.languages
            .map((language: any) => `${language.lang ?? language} (${language.level ?? ''})`)
            .join('; ')
        : '';

      return [
        row.id,
        row.full_name,
        row.email,
        row.profile_type,
        row.user_category,
        row.verification_tier,
        row.verification_status,
        row.created_at,
        row.location,
        row.nationality,
        education.level,
        education.country,
        education.institutions,
        education.field,
        education.other_countries,
        Array.isArray(education.worked_countries) ? education.worked_countries.join('; ') : '',
        languages,
      ]
        .map((value) => `"${(value ?? '').toString().replace(/"/g, '""')}"`)
        .join(',');
    };

    return [headers.join(','), ...filteredRows.map(toRow)].join('\n');
  }, [filteredRows]);

  const downloadCSV = () => {
    if (!csv) {
      toast.error('There are no onboarding records to export.');
      return;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', showArchivedOnly ? 'archived_onboarding_records.csv' : 'onboarding_records.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleArchive = (id: string) => {
    setArchivedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const printRecord = (row: ProfileRow) => {
    const education = row.education || {};
    const docs = row.verification_docs && typeof row.verification_docs === 'object' ? Object.entries(row.verification_docs) : [];

    const printWindow = window.open('', '_blank', 'width=960,height=720');
    if (!printWindow) {
      toast.error('Pop-up blocked. Allow pop-ups to print onboarding records.');
      return;
    }

    const documentLinks = docs
      .map(([key, value]: [string, any]) => {
        const url = value?.url || '#';
        return `<li><a href="${url}" target="_blank" rel="noreferrer">${key.replace(/_/g, ' ')}</a></li>`;
      })
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Onboarding Record - ${row.full_name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #111827; }
            h1, h2 { margin-bottom: 8px; }
            p, li { line-height: 1.6; }
            .section { margin-top: 24px; }
          </style>
        </head>
        <body>
          <h1>${row.full_name}</h1>
          <p>${row.email}</p>
          <p>${row.profile_type || 'No profile type'} | ${row.user_category || 'No category'}</p>
          <p>Submitted ${formatAdminDate(row.created_at)}</p>
          <div class="section">
            <h2>Education</h2>
            <p>${education.level || 'No level'} | ${education.field || 'No field'}</p>
            <p>${education.institutions || 'No institution supplied'}</p>
          </div>
          <div class="section">
            <h2>Geography</h2>
            <p>Studied in: ${education.country || 'Not supplied'}</p>
            <p>Worked in: ${
              Array.isArray(education.worked_countries)
                ? education.worked_countries.join(', ')
                : education.other_countries || 'Not supplied'
            }</p>
          </div>
          <div class="section">
            <h2>Verification Documents</h2>
            <ul>${documentLinks || '<li>No verification documents linked.</li>'}</ul>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="admin-section-shell">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Visible queue', value: rows.length - archivedIds.length },
          { label: 'Archived', value: archivedIds.length },
          { label: 'Showing now', value: filteredRows.length },
        ].map((item) => (
          <div key={item.label} className="admin-surface-card premium-glass p-5 rounded-[24px] border border-white/5">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">{item.label}</p>
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-4">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="admin-surface-card premium-glass p-6 rounded-[28px] border border-white/5">
        <div className="flex flex-col xl:flex-row gap-3 xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="input-glass pl-10 pr-4 py-3 w-full"
              placeholder="Search onboarding records"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowArchivedOnly(false)}
              className={`rounded-full px-4 py-2 text-sm ${!showArchivedOnly ? 'bg-[var(--sp-accent)] text-[var(--text-inverse)]' : 'bg-white/5 text-[var(--text-secondary)]'}`}
            >
              Active queue
            </button>
            <button
              onClick={() => setShowArchivedOnly(true)}
              className={`rounded-full px-4 py-2 text-sm ${showArchivedOnly ? 'bg-[var(--sp-accent)] text-[var(--text-inverse)]' : 'bg-white/5 text-[var(--text-secondary)]'}`}
            >
              Archived
            </button>
            <button onClick={downloadCSV} className="sp-btn-primary px-4 py-2 inline-flex items-center gap-2 text-sm">
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="admin-surface-card premium-glass p-10 rounded-[28px] border border-white/5 text-center text-[var(--text-secondary)]">
          Loading onboarding records...
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRows.map((row) => {
            const education = row.education || {};
            const workedCountries = Array.isArray(education.worked_countries)
              ? education.worked_countries.join(', ')
              : education.other_countries || '-';
            const languages = Array.isArray(education.languages)
              ? education.languages.map((language: any) => `${language.lang ?? language} (${language.level ?? ''})`).join(', ')
              : '-';
            const docs =
              row.verification_docs && typeof row.verification_docs === 'object'
                ? Object.entries(row.verification_docs)
                : [];
            const archived = archivedIds.includes(row.id);

            return (
              <div key={row.id} className="admin-surface-card premium-glass p-5 rounded-[28px] border border-white/5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-lg text-[var(--text-primary)]">{row.full_name}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10">{row.profile_type || 'No type'}</span>
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">{row.email}</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1">
                      {row.user_category || 'No category'} · {row.verification_tier || 'No tier'} ({row.verification_status || 'unknown'})
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link to={`/admin/user/${row.id}`} className="sp-btn-glass flex items-center gap-2 text-sm px-3 py-2">
                      <Eye size={14} />
                      View profile
                    </Link>
                    <button onClick={() => printRecord(row)} className="sp-btn-glass flex items-center gap-2 text-sm px-3 py-2">
                      <Printer size={14} />
                      Print
                    </button>
                    <button onClick={() => toggleArchive(row.id)} className="sp-btn-primary flex items-center gap-2 text-sm px-3 py-2">
                      <ClipboardList size={14} />
                      {archived ? 'Restore' : 'Archive'}
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-sm">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                      <GraduationCap size={14} />
                      Education
                    </div>
                    <div className="text-[var(--text-secondary)] mt-1">
                      {education.level || '-'} · {education.field || '-'}
                      <br />
                      {education.institutions || '-'}
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                      <Globe size={14} />
                      Geography
                    </div>
                    <div className="text-[var(--text-secondary)] mt-1">
                      Studied in: {education.country || '-'}
                      <br />
                      Worked in: {workedCountries}
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="font-semibold text-[var(--text-primary)]">Languages</div>
                    <div className="text-[var(--text-secondary)] mt-1">{languages}</div>
                  </div>
                </div>

                {docs.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-2">Verification documents</div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {docs.map(([key, value]: [string, any]) => (
                        <a
                          key={key}
                          href={value?.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-full bg-[var(--sp-accent)]/15 text-[var(--sp-accent)] border border-[var(--sp-accent)]/30"
                        >
                          {key.replace(/_/g, ' ')}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredRows.length === 0 && (
        <div className="admin-surface-card premium-glass p-10 rounded-[28px] border border-dashed border-white/10 text-center text-[var(--text-secondary)]">
          No onboarding records match the current view.
        </div>
      )}
    </div>
  );
};

export default AdminOnboardingList;
