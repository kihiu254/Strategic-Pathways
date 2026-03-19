import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import SEO from '../components/SEO';





const PaymentPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [searchParams] = useSearchParams();


  const plan = useMemo(() => {
    const raw = (searchParams.get('tier') || '').toLowerCase();
    if (raw === 'professional') return { key: 'Professional', label: 'Professional', amountEnv: 'VITE_PAYSTACK_PROFESSIONAL_AMOUNT' };
    if (raw === 'firm' || raw === 'partners' || raw === 'custom') return { key: 'Firm', label: 'Partners', amountEnv: 'VITE_PAYSTACK_CUSTOM_AMOUNT' };
    return { key: 'Professional', label: 'Professional', amountEnv: 'VITE_PAYSTACK_PROFESSIONAL_AMOUNT' };
  }, [searchParams]);

  const currency = import.meta.env.VITE_PAYSTACK_CURRENCY || 'USD';
  const amount = Number((import.meta.env as any)[plan.amountEnv] || 0);
  const amountValid = Number.isFinite(amount) && amount > 0;

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);



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
                {amountValid ? `${currency} ${(amount / 100).toLocaleString()}` : 'Not configured'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="sp-btn-primary w-full flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
            disabled
          >
            Paystack (Coming Soon)
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            onClick={handlePaymentCancel}
            className="mt-4 w-full sp-btn-glass"
          >
            Cancel and switch to Community
          </button>
          <p className="mt-4 text-sm text-[var(--text-secondary)] text-center bg-white/5 p-4 rounded-xl border border-white/10">
            Paystack checkout will be connected soon. In the meantime, contact the team for manual payment support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

