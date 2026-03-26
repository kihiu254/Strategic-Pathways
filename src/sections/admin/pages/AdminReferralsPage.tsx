import { useEffect, useMemo, useState } from 'react';
import { Cookie, Gift, MousePointerClick, Trophy, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { formatAdminDate, readCookieConsent } from '../helpers';

type ReferralRow = {
  id: string;
  referrer_id: string | null;
  referred_email: string | null;
  referred_user_id: string | null;
  referral_code: string | null;
  status: string | null;
  created_at: string | null;
  completed_at: string | null;
};

type ReferrerSummary = {
  id: string;
  name: string;
  email: string;
  total: number;
  completed: number;
};

const AdminReferralsPage = () => {
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { full_name: string | null; email: string | null }>>({});
  const [loading, setLoading] = useState(true);
  const [consentState, setConsentState] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setConsentState(readCookieConsent());
  }, []);

  useEffect(() => {
    const loadReferrals = async () => {
      try {
        setLoadError(null);
        const { data, error } = await supabase
          .from('referrals')
          .select('id, referrer_id, referred_email, referred_user_id, referral_code, status, created_at, completed_at')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const rows = (data || []) as ReferralRow[];
        setReferrals(rows);

        const profileIds = Array.from(
          new Set(
            rows
              .flatMap((row) => [row.referrer_id, row.referred_user_id])
              .filter((value): value is string => Boolean(value))
          )
        );

        if (profileIds.length > 0) {
          const { data: profileRows, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', profileIds);

          if (profileError) throw profileError;

          setProfiles(
            (profileRows || []).reduce<Record<string, { full_name: string | null; email: string | null }>>(
              (accumulator, row) => {
                accumulator[row.id] = {
                  full_name: row.full_name,
                  email: row.email,
                };
                return accumulator;
              },
              {}
            )
          );
        }
      } catch (error) {
        const err = error as Error;
        console.error('Error loading admin referrals dashboard:', err);
        const message = err.message?.toLowerCase().includes('does not exist')
          ? 'The referrals table is missing. Run docs/admin-dashboard-v2.sql to add referral tracking tables.'
          : err.message?.toLowerCase().includes('permission')
            ? 'Admin access to referrals is blocked by RLS policies. Run docs/admin-dashboard-v2.sql to enable admin reads.'
            : 'Referral data could not be loaded. Confirm docs/admin-dashboard-v2.sql has been applied.';
        setLoadError(message);
        toast.error('Referral data could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    void loadReferrals();
  }, []);

  const summary = {
    total: referrals.length,
    clicked: referrals.filter((referral) => referral.status === 'clicked').length,
    signedUp: referrals.filter((referral) => referral.status === 'signed_up' || referral.status === 'active').length,
    verified: referrals.filter((referral) => referral.status === 'verified').length,
  };

  const leaderboard = useMemo<ReferrerSummary[]>(() => {
    const grouped = referrals.reduce<Record<string, ReferrerSummary>>((accumulator, referral) => {
      if (!referral.referrer_id) return accumulator;

      const profile = profiles[referral.referrer_id];
      if (!accumulator[referral.referrer_id]) {
        accumulator[referral.referrer_id] = {
          id: referral.referrer_id,
          name: profile?.full_name || 'Unknown member',
          email: profile?.email || 'No email',
          total: 0,
          completed: 0,
        };
      }

      accumulator[referral.referrer_id].total += 1;
      if (referral.status === 'signed_up' || referral.status === 'active' || referral.status === 'verified') {
        accumulator[referral.referrer_id].completed += 1;
      }

      return accumulator;
    }, {});

    return Object.values(grouped).sort((a, b) => b.completed - a.completed || b.total - a.total).slice(0, 6);
  }, [profiles, referrals]);

  return (
    <div className="admin-section-shell">
      {loadError && (
        <div className="rounded-[24px] border border-amber-500/30 bg-amber-500/10 px-5 py-4">
          <p className="text-sm font-semibold text-amber-100">Referral tables need database setup</p>
          <p className="mt-1 text-xs text-amber-50/80">{loadError}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Referral events', value: summary.total, icon: Users },
          { label: 'Clicks', value: summary.clicked, icon: MousePointerClick },
          { label: 'Sign-ups', value: summary.signedUp, icon: Gift },
          { label: 'Verified', value: summary.verified, icon: Trophy },
        ].map((item) => (
          <div key={item.label} className="admin-surface-card premium-glass p-5 rounded-[24px] border border-white/5">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-white/5 text-[var(--sp-accent)]">
                <item.icon size={18} />
              </div>
              <span className="text-3xl font-bold text-[var(--text-primary)]">{item.value}</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-secondary)] mt-4">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="admin-surface-card premium-glass p-6 rounded-[28px] border border-white/5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-white/5 text-[var(--sp-accent)]">
            <Cookie size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Consent readiness</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Cookie consent is currently {consentState || 'not set'} in this browser. Referral attribution stores the referrer cookie only after consent is granted, then links it to new sign-ups automatically.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6">
        <div className="admin-surface-card premium-glass p-6 rounded-[28px] border border-white/5">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Top referrers</h3>
          <div className="space-y-3 mt-5">
            {leaderboard.map((referrer) => (
              <div key={referrer.id} className="glass-light rounded-2xl p-4 border border-white/5">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{referrer.name}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{referrer.email}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-3">
                  {referrer.completed} successful outcomes from {referrer.total} tracked referrals
                </p>
              </div>
            ))}
            {!loading && leaderboard.length === 0 && (
              <p className="text-sm text-[var(--text-secondary)]">No referral leaderboard data yet.</p>
            )}
          </div>
        </div>

        <div className="admin-surface-card premium-glass p-6 rounded-[28px] border border-white/5">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent referral events</h3>
          <div className="space-y-3 mt-5">
            {referrals.slice(0, 12).map((referral) => {
              const referrer = referral.referrer_id ? profiles[referral.referrer_id] : null;
              const referred = referral.referred_user_id ? profiles[referral.referred_user_id] : null;

              return (
                <div key={referral.id} className="glass-light rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {referrer?.full_name || 'Unknown referrer'}
                    </p>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-white/5 text-[var(--text-secondary)]">
                      {referral.status || 'pending'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-2">
                    Code: {referral.referral_code || 'Not supplied'}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Referred: {referred?.full_name || referral.referred_email || 'Pending signup'}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-3">
                    Created {formatAdminDate(referral.created_at)}
                  </p>
                </div>
              );
            })}
            {!loading && referrals.length === 0 && (
              <p className="text-sm text-[var(--text-secondary)]">No referral events have been recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReferralsPage;
