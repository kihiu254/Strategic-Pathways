import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, CheckCircle, Clock, AlertCircle, FileText, Award, Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

const VerificationPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentTier, setCurrentTier] = useState('Tier 1 – Self-Declared');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchVerificationStatus();
  }, [user, navigate]);

  const fetchVerificationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('verification_tier, verification_status')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setCurrentTier(data.verification_tier || 'Tier 1 – Self-Declared');
        setVerificationStatus(data.verification_status);
      }
    } catch (err) {
      console.error('Error fetching verification:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const filePath = `${user?.id}/verification/${docType}_${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from('verification-documents')
        .upload(filePath, file);

      if (error) throw error;

      await supabase
        .from('profiles')
        .update({ 
          verification_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      toast.success('Document uploaded! Verification pending.');
      setVerificationStatus('pending');
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const tiers = [
    {
      tier: 'Tier 1 – Self-Declared',
      icon: Clock,
      color: 'text-gray-400',
      bgColor: 'bg-gray-400/10',
      borderColor: 'border-gray-400/20',
      title: 'Self-Declared Profile',
      description: 'Basic profile with self-reported information',
      features: [
        'Create profile with basic information',
        'Browse opportunities',
        'Connect with other members',
        'Access community resources'
      ],
      requirements: [],
      status: currentTier === 'Tier 1 – Self-Declared' ? 'current' : 'completed'
    },
    {
      tier: 'Tier 2 – Verified Professional',
      icon: Shield,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/20',
      title: 'Verified Professional',
      description: 'Enhanced credibility with verified credentials',
      features: [
        'All Tier 1 features',
        'Verified badge on profile',
        'Priority in opportunity matching',
        'Access to premium resources',
        'Enhanced visibility to institutions'
      ],
      requirements: [
        'Valid government-issued ID',
        'Professional credentials (degree, certificates)',
        'LinkedIn profile verification',
        'Professional references (2 minimum)'
      ],
      status: currentTier === 'Tier 2 – Verified Professional' ? 'current' : currentTier === 'Tier 3 – Institutional Ready' ? 'completed' : 'locked'
    },
    {
      tier: 'Tier 3 – Institutional Ready',
      icon: Building2,
      color: 'text-[var(--sp-accent)]',
      bgColor: 'bg-[var(--sp-accent)]/10',
      borderColor: 'border-[var(--sp-accent)]/20',
      title: 'Institutional Ready',
      description: 'Highest verification for institutional partnerships',
      features: [
        'All Tier 2 features',
        'Institutional partnership eligibility',
        'Direct access to high-value opportunities',
        'Priority support and consultation',
        'Featured in institutional directories',
        'Advanced analytics and insights'
      ],
      requirements: [
        'All Tier 2 requirements',
        'Background check clearance',
        'Tax compliance documentation',
        'Professional liability insurance',
        'Institutional references (3 minimum)',
        'Portfolio of completed projects'
      ],
      status: currentTier === 'Tier 3 – Institutional Ready' ? 'current' : 'locked'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[var(--sp-accent)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12">
      <div className="w-full px-6 lg:px-12">
        <button 
          onClick={() => navigate('/profile')}
          className="sp-btn-glass mb-6 flex items-center gap-2"
        >
          ← Back to Profile
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Profile Verification
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Enhance your credibility and unlock premium features by verifying your professional credentials
          </p>
        </div>

        {verificationStatus === 'pending' && (
          <div className="glass-card p-6 mb-8 border-l-4 border-yellow-500">
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  Verification In Progress
                </h3>
                <p className="text-[var(--text-secondary)]">
                  Your documents are being reviewed. This typically takes 2-3 business days.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            const isLocked = tier.status === 'locked';
            const isCurrent = tier.status === 'current';

            return (
              <div 
                key={tier.tier}
                className={`glass-card p-6 lg:p-8 border-2 ${
                  isCurrent ? tier.borderColor : 'border-white/10'
                } ${isLocked ? 'opacity-60' : ''}`}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 rounded-2xl ${tier.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-8 h-8 ${tier.color}`} />
                    </div>
                  </div>

                  <div className="flex-grow">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                          {tier.title}
                        </h3>
                        <p className="text-[var(--text-secondary)]">
                          {tier.description}
                        </p>
                      </div>
                      {isCurrent && (
                        <span className="px-4 py-2 rounded-full bg-[var(--sp-accent)]/20 text-[var(--sp-accent)] text-sm font-semibold whitespace-nowrap">
                          Current Tier
                        </span>
                      )}
                    </div>

                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-[var(--sp-accent)]" />
                        Features & Benefits
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {tier.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className={`w-4 h-4 ${tier.color} flex-shrink-0 mt-0.5`} />
                            <span className="text-[var(--text-secondary)] text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {tier.requirements.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[var(--sp-accent)]" />
                          Requirements
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {tier.requirements.map((req, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-[var(--sp-accent)] flex-shrink-0 mt-2" />
                              <span className="text-[var(--text-secondary)] text-sm">{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!isLocked && tier.status !== 'completed' && (
                      <div className="flex flex-wrap gap-3">
                        <input 
                          type="file" 
                          id={`upload-${index}`}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => handleDocumentUpload(e, tier.tier)}
                          disabled={uploading}
                        />
                        <label 
                          htmlFor={`upload-${index}`}
                          className={`sp-btn-primary flex items-center gap-2 cursor-pointer ${uploading ? 'opacity-50' : ''}`}
                        >
                          {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          Upload Documents
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
