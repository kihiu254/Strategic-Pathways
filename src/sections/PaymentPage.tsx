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
import { AppNotificationService } from '../lib/appNotifications';
import { EmailAutomationService } from '../lib/emailAutomation';

const PaymentPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
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
        const amountLabel = formatMembershipAmount(paymentPlan.currency, amount);
        const redirectTo = payload.redirectTo || '/onboarding/full';
        await AppNotificationService.notifySelf({
          title: 'Payment confirmed',
          message: `${plan.label} membership payment confirmed successfully.`,
          type: 'success',
          data: {
            action: 'payment_confirmed',
            tier: plan.queryTier,
            currency: paymentPlan.currency,
            amount: amountLabel,
          },
        }).catch((notificationError) => console.warn('Notification failed:', notificationError));
        await EmailAutomationService.onPaymentConfirmed(
          user.email || '',
          user.user_metadata?.full_name || user.email || 'Member',
          plan.label,
          amountLabel,
          paymentPlan.currency
        );
        toast.success(
          redirectTo === '/profile'
            ? `${plan.label} membership is active. Your saved profile is ready to use.`
            : `${plan.label} payment confirmed. Continue with your full onboarding.`
        );
        navigate(redirectTo, { replace: true });
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
  }, [amount, navigate, paymentPlan.currency, paymentReference, plan.label, plan.queryTier, session?.access_token, user]);

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
              <div className="mt-6 border-t border-white/5 pt-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-[var(--text-primary)] font-medium">Select Currency</span>
                    <p className="text-[var(--text-secondary)] text-xs mt-1">
                      Choose <strong>KES</strong> for M-Pesa and Kenyan cards. Choose <strong>USD</strong> for international cards.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currencyOptions.map((option) => (
                      <button
                        key={option.code}
                        type="button"
                        onClick={() => handleCurrencyChange(option.code)}
                        className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                          option.code === selectedCurrency
                            ? 'border-[var(--sp-accent)] bg-[var(--sp-accent)]/12 text-[var(--text-primary)] shadow-lg shadow-[var(--sp-accent)]/10'
                            : 'border-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-bold">{option.code}</div>
                            <div className={`text-xs mt-1 ${option.code === selectedCurrency ? 'text-[var(--text-primary)]/80' : 'text-[var(--text-secondary)]'}`}>
                              {option.label.replace(`${option.code} `, '')}
                            </div>
                          </div>
                          {option.code === selectedCurrency && (
                            <CheckCircle2 size={18} className="text-[var(--sp-accent)]" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
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
                Continue to Paystack
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
            After a successful payment, we will unlock your {plan.label} onboarding flow automatically.
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

