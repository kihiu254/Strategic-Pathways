import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, CreditCard, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  formatMembershipAmount,
  getDefaultMembershipCurrency,
  getMembershipCurrencyOptions,
  getMembershipPlanDetails,
  handleMembershipVerificationFailure,
  launchMembershipCheckout,
  verifyMembershipPayment,
  type MembershipCurrency,
  type MembershipTier,
} from '../lib/membershipCheckout';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import SEO from '../components/SEO';

const PaymentPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const checkoutStartedRef = useRef(false);
  const verificationRef = useRef<string | null>(null);
  const currencyOptions = getMembershipCurrencyOptions();
  const requestedCurrency = (searchParams.get('currency') || '').toUpperCase();
  const [selectedCurrency, setSelectedCurrency] = useState<MembershipCurrency>(() => {
    const supportedCodes = currencyOptions.map((option) => option.code);
    return supportedCodes.includes(requestedCurrency) ? requestedCurrency : getDefaultMembershipCurrency();
  });

  const plan = useMemo(() => {
    const raw = (searchParams.get('tier') || '').toLowerCase();
    if (raw === 'professional') return { key: 'Professional', label: 'Professional', queryTier: 'professional', amountEnv: 'VITE_PAYSTACK_PROFESSIONAL_AMOUNT' } as const;
    if (raw === 'firm' || raw === 'partners' || raw === 'custom') return { key: 'Firm', label: 'Partners', queryTier: 'firm', amountEnv: 'VITE_PAYSTACK_CUSTOM_AMOUNT' } as const;
    return { key: 'Professional', label: 'Professional', queryTier: 'professional', amountEnv: 'VITE_PAYSTACK_PROFESSIONAL_AMOUNT' } as const;
  }, [searchParams]);

  const paymentPlan = useMemo(
    () => getMembershipPlanDetails(plan.queryTier as MembershipTier, selectedCurrency),
    [plan.queryTier, selectedCurrency]
  );
  const amount = paymentPlan.amount;
  const amountValid = Number.isFinite(amount) && amount > 0;
  const paystackMode = (import.meta.env.VITE_PAYSTACK_MODE || 'test').toLowerCase() === 'live' ? 'live' : 'test';
  const paymentReference = searchParams.get('reference') || searchParams.get('trxref');
  const checkoutReady = amountValid && Boolean(session?.access_token);

  useEffect(() => {
    const supportedCodes = currencyOptions.map((option) => option.code);
    if (supportedCodes.includes(requestedCurrency) && requestedCurrency !== selectedCurrency) {
      setSelectedCurrency(requestedCurrency);
    }
  }, [currencyOptions, requestedCurrency, selectedCurrency]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [isLoading, user, navigate]);

  useEffect(() => {
    if (!user || !session?.access_token || !paymentReference || verificationRef.current === paymentReference) {
      return;
    }

    verificationRef.current = paymentReference;
    setIsVerifying(true);

    const verifyPayment = async () => {
      try {
        const payload = await verifyMembershipPayment(session.access_token, paymentReference);
        toast.success(`${plan.label} payment confirmed. Continue with your full onboarding.`);
        navigate(payload.redirectTo || '/onboarding/full', { replace: true });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unable to verify your payment.';
        await handleMembershipVerificationFailure(user.id, errorMessage, () => {
          navigate('/onboarding/basic', { replace: true });
        });
      } finally {
        setIsVerifying(false);
      }
    };

    void verifyPayment();
  }, [navigate, paymentReference, plan.label, plan.queryTier, session?.access_token, user]);

  useEffect(() => {
    if (
      checkoutStartedRef.current ||
      isLoading ||
      !user ||
      !session?.access_token ||
      paymentReference ||
      !amountValid
    ) {
      return;
    }

    checkoutStartedRef.current = true;
    setIsRedirecting(true);

    void launchMembershipCheckout({
      tier: plan.queryTier as MembershipTier,
      currency: selectedCurrency,
      user,
      session,
      onCommunityFallback: () => {
        navigate('/onboarding/basic');
      },
    }).finally(() => {
      setIsRedirecting(false);
    });
  }, [amountValid, isLoading, navigate, paymentReference, plan.queryTier, selectedCurrency, session, user]);

  const handleStartPayment = async () => {
    setIsRedirecting(true);

    await launchMembershipCheckout({
      tier: plan.queryTier as MembershipTier,
      currency: selectedCurrency,
      user,
      session,
      onCommunityFallback: () => {
        navigate('/onboarding/basic');
      },
    });

    setIsRedirecting(false);
  };

  const handleCurrencyChange = (currency: MembershipCurrency) => {
    setSelectedCurrency(currency);
    checkoutStartedRef.current = false;

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('currency', currency);
    setSearchParams(nextSearchParams, { replace: true });
  };

  const handlePaymentCancel = async () => {
    if (!user) return;
    await supabase
      .from('profiles')
      .update({
        tier: 'Community',
        profile_type: 'Standard Member',
        onboarding_completed: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    toast.info('Payment cancelled. You have been moved to the Community plan.');
    navigate('/onboarding/basic');
  };



  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-28 pb-16">
      <SEO title="Payment" />
      <div className="max-w-3xl mx-auto px-6">
        <div className="glass-card p-8 lg:p-10 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--sp-accent)]/20 flex items-center justify-center">
              <CreditCard className="text-[var(--sp-accent)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Complete Payment</h1>
              <p className="text-[var(--text-secondary)]">Choose your payment method to continue with the {plan.label} membership.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Plan</span>
              <span className="text-[var(--text-primary)] font-semibold">{plan.label}</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[var(--text-secondary)]">Amount</span>
              <span className="text-[var(--text-primary)] font-semibold">
                {formatMembershipAmount(paymentPlan.currency, amount)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[var(--text-secondary)]">Mode</span>
              <span className="text-[var(--text-primary)] font-semibold capitalize">{paystackMode}</span>
            </div>
            {currencyOptions.length > 1 && (
              <div className="mt-4">
                <span className="text-[var(--text-secondary)] text-sm">Currency</span>
                <div className="mt-2 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/5 p-2">
                  {currencyOptions.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => handleCurrencyChange(option.code)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                        option.code === selectedCurrency
                          ? 'bg-[var(--sp-accent)] text-[var(--bg-primary)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleStartPayment}
            disabled={!checkoutReady || isRedirecting || isVerifying}
            className="sp-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Verifying payment...
              </>
            ) : isRedirecting ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Redirecting to Paystack...
              </>
            ) : (
              <>
                Pay with Paystack
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePaymentCancel}
            className="mt-4 w-full sp-btn-glass"
          >
            Cancel and switch to Community
          </button>
          <p className="mt-4 text-sm text-[var(--text-secondary)] text-center bg-white/5 p-4 rounded-xl border border-white/10">
            Paystack launches automatically from this page as a fallback. After a successful payment, we will unlock your {plan.label} onboarding flow automatically.
          </p>
          {paymentReference && !isVerifying && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-300 bg-green-500/10 p-4 rounded-xl border border-green-500/20">
              <CheckCircle2 size={16} />
              Payment reference received. Finalizing your membership...
            </div>
          )}
          {!session?.access_token && (
            <p className="mt-4 text-sm text-amber-200 text-center bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
              Your session is still loading. If checkout stays disabled, refresh the page and try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

