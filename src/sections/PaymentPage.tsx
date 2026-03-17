import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import SEO from '../components/SEO';

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

const loadPaystack = () =>
  new Promise<void>((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack.'));
    document.body.appendChild(script);
  });

const PaymentPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const plan = useMemo(() => {
    const raw = (searchParams.get('tier') || '').toLowerCase();
    if (raw === 'professional') return { key: 'Professional', label: 'Professional', amountEnv: 'VITE_PAYSTACK_PROFESSIONAL_AMOUNT' };
    if (raw === 'firm' || raw === 'partners' || raw === 'custom') return { key: 'Firm', label: 'Partners', amountEnv: 'VITE_PAYSTACK_CUSTOM_AMOUNT' };
    return { key: 'Professional', label: 'Professional', amountEnv: 'VITE_PAYSTACK_PROFESSIONAL_AMOUNT' };
  }, [searchParams]);

  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const currency = import.meta.env.VITE_PAYSTACK_CURRENCY || 'USD';
  const amount = Number((import.meta.env as any)[plan.amountEnv] || 0);
  const amountValid = Number.isFinite(amount) && amount > 0;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadPaystack()
      .then(() => setIsReady(true))
      .catch((err) => toast.error(err.message || 'Payment setup failed.'));
  }, [user, navigate]);

  const handlePaymentSuccess = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        tier: plan.key,
        profile_type: 'Premium (Verified)',
        onboarding_completed: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      toast.error(error.message || 'Failed to update subscription.');
      return;
    }
    navigate('/onboarding/full');
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

  const handlePayNow = async () => {
    if (!user) return;
    if (!publicKey) {
      toast.error('Paystack public key not configured.');
      return;
    }
    if (!amountValid) {
      toast.error('Payment amount not configured.');
      return;
    }
    setIsLoading(true);
    try {
      await loadPaystack();
      const handler = window.PaystackPop?.setup({
        key: publicKey,
        email: user.email || '',
        amount,
        currency,
        metadata: {
          tier: plan.key,
          user_id: user.id,
        },
        callback: () => {
          handlePaymentSuccess();
        },
        onClose: () => {
          handlePaymentCancel();
        }
      });

      handler?.openIframe();
    } catch (error: any) {
      toast.error(error.message || 'Payment failed to start.');
    } finally {
      setIsLoading(false);
    }
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
              <p className="text-[var(--text-secondary)]">You’re upgrading to the {plan.label} plan.</p>
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
                {amountValid ? `${currency} ${(amount / 100).toLocaleString()}` : 'Not configured'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePayNow}
            disabled={!isReady || isLoading || !amountValid}
            className="sp-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
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
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
