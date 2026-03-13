import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Search, Download, Eye, ClipboardList, Globe, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

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

const AdminOnboardingList = () => {
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [filtered, setFiltered] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
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
        setRows(data || []);
        setFiltered(data || []);
      } catch (err: any) {
        toast.error('Failed to load onboarding records');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const term = q.toLowerCase();
    if (!term) {
      setFiltered(rows);
      return;
    }
    setFiltered(
      rows.filter((r) =>
        [r.full_name, r.email, r.profile_type, r.user_category]
          .filter(Boolean)
          .some((v) => (v as string).toLowerCase().includes(term))
      )
    );
  }, [q, rows]);

  const csv = useMemo(() => {
    if (!filtered.length) return '';
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
      'languagesSpoken'
    ];
    const toRow = (r: ProfileRow) => {
      const edu = r.education || {};
      const langs = Array.isArray(edu.languages) ? edu.languages.map((l: any) => `${l.lang ?? l} (${l.level ?? ''})`).join('; ') : '';
      return [
        r.id,
        r.full_name,
        r.email,
        r.profile_type,
        r.user_category,
        r.verification_tier,
        r.verification_status,
        r.created_at,
        r.location,
        r.nationality,
        edu.level,
        edu.country,
        edu.institutions,
        edu.field,
        edu.other_countries,
        Array.isArray(edu.worked_countries) ? edu.worked_countries.join('; ') : '',
        langs
      ]
        .map((v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`)
        .join(',');
    };
    return [headers.join(','), ...filtered.map(toRow)].join('\n');
  }, [filtered]);

  const downloadCSV = () => {
    if (!csv) {
      toast.warning('No records to export');
      return;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'onboarding_records.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="px-6 py-6 flex items-center justify-between border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold">Onboarding Records</h1>
          <p className="text-sm text-[var(--text-secondary)]">All submitted onboarding data for admin review.</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
              placeholder="Search name, email, type…"
            />
          </div>
          <button onClick={downloadCSV} className="sp-btn-primary flex items-center gap-2 px-3 py-2">
            <Download size={16} /> CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[var(--text-secondary)]">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading profiles…
        </div>
      ) : (
        <div className="p-6">
          <div className="grid gap-4">
            {filtered.map((r) => {
              const edu = r.education || {};
              const worked = Array.isArray(edu.worked_countries) ? edu.worked_countries.join(', ') : (edu.other_countries || '—');
              const langs = Array.isArray(edu.languages)
                ? edu.languages.map((l: any) => `${l.lang ?? l} (${l.level ?? ''})`).join(', ')
                : '—';
              const docs = r.verification_docs && typeof r.verification_docs === 'object' ? Object.entries(r.verification_docs) : [];
              return (
                <div key={r.id} className="glass-card border border-white/10 rounded-xl p-4">
                  <div className="flex flex-wrap gap-3 items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">{r.full_name}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-white/10">{r.profile_type || '—'}</span>
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">{r.email}</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {r.user_category || '—'} · {r.verification_tier || '—'} ({r.verification_status || 'unknown'})
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/admin/user/${r.id}`} className="sp-btn-glass flex items-center gap-1 text-sm">
                        <Eye size={14} /> View profile
                      </Link>
                      <div className="sp-chip flex items-center gap-1 text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
                        <ClipboardList size={12} /> {new Date(r.created_at || '').toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-sm">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex items-center gap-2 font-semibold"><GraduationCap size={14} /> Education</div>
                      <div className="text-[var(--text-secondary)] mt-1">
                        {edu.level || '—'} • {edu.field || '—'}<br />
                        {edu.institutions || '—'}
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex items-center gap-2 font-semibold"><Globe size={14} /> Global</div>
                      <div className="text-[var(--text-secondary)] mt-1">
                        Studied: {edu.country || '—'}<br />
                        Worked: {worked}
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="font-semibold">Languages</div>
                      <div className="text-[var(--text-secondary)] mt-1">{langs}</div>
                    </div>
                  </div>

                  {docs.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-2">Verification docs</div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {docs.map(([key, val]: [string, any]) => (
                          <a key={key} href={val?.url || '#'} target="_blank" rel="noreferrer"
                            className="px-3 py-1 rounded-full bg-[var(--sp-accent)]/15 text-[var(--sp-accent)] border border-[var(--sp-accent)]/30">
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

          {!filtered.length && (
            <div className="text-center text-[var(--text-secondary)] py-12">
              No onboarding records match your filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOnboardingList;
