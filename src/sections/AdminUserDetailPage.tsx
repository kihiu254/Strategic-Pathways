import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Briefcase, GraduationCap,
  FileText, CheckCircle, X, Shield, Globe, Heart, TrendingUp, Target
} from 'lucide-react';
import { toast } from 'sonner';
import {
  notifyVerificationStatusChange,
  VERIFIED_TIER_LABEL,
} from '../lib/verificationStatus';
import { getSafeErrorMessage } from '../lib/safeFeedback';
import { supabase } from '../lib/supabase';

const AdminUserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        setUserData(data);
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        toast.error('That member profile could not be loaded right now. Please try again shortly.');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) fetchUserData();
  }, [userId]);

  const handleApprove = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          verification_status: 'approved',
          verification_tier: VERIFIED_TIER_LABEL,
        })
        .eq('id', userId);

      if (error) throw error;
      toast.success('User approved successfully!');
      setUserData({ ...userData, verification_status: 'approved' });

      await notifyVerificationStatusChange({
        userId,
        email: userData.email,
        name: userData.full_name,
        status: 'approved',
        tier: VERIFIED_TIER_LABEL,
      });
    } catch (error: any) {
      toast.error(getSafeErrorMessage(error, 'We could not approve this member right now. Please try again.'));
    }
  };

  const handleReject = async () => {
    const reasonInput = window.prompt('Reason for rejection (required):', 'Criteria not met');
    if (reasonInput === null) return;

    const reason = reasonInput.trim();
    if (!reason) {
      toast.error('A rejection reason is required.');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verification_status: 'rejected' })
        .eq('id', userId);

      if (error) throw error;
      toast.error('User rejected');
      setUserData({ ...userData, verification_status: 'rejected' });

      await notifyVerificationStatusChange({
        userId,
        email: userData.email,
        name: userData.full_name,
        status: 'rejected',
        tier: VERIFIED_TIER_LABEL,
        reason,
      });
    } catch (error: any) {
      toast.error(getSafeErrorMessage(error, 'We could not reject this member right now. Please try again.'));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">User not found</div>
      </div>
    );
  }

  const InfoSection = ({ title, icon: Icon, children }: any) => (
    <div className="glass-card p-6 mb-6">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <Icon size={20} className="text-[var(--sp-accent)]" />
        {title}
      </h3>
      {children}
    </div>
  );

  const InfoRow = ({ label, value }: any) => (
    <div className="flex justify-between py-2 border-b border-white/5">
      <span className="text-[var(--text-secondary)] text-sm">{label}</span>
      <span className="text-[var(--text-primary)] text-sm font-medium">{value || 'N/A'}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <button 
          onClick={() => navigate('/admin/members')}
          className="sp-btn-glass mb-6 flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              {userData.full_name || 'Unnamed User'}
            </h1>
            <p className="text-[var(--text-secondary)]">{userData.email}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleApprove} className="sp-btn-primary flex items-center gap-2">
              <CheckCircle size={18} />
              Approve
            </button>
            <button onClick={handleReject} className="sp-btn-glass flex items-center gap-2 text-red-400">
              <X size={18} />
              Reject
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InfoSection title="Basic Information" icon={User}>
            <InfoRow label="Full Name" value={userData.full_name} />
            <InfoRow label="Professional Title" value={userData.professional_title} />
            <InfoRow label="Email" value={userData.email} />
            <InfoRow label="Phone" value={`${userData.country_code || ''} ${userData.phone || ''}`} />
            <InfoRow label="LinkedIn" value={userData.linkedin_url} />
            <InfoRow label="Website" value={userData.website_url} />
            <InfoRow label="Country of Residence" value={userData.location} />
            <InfoRow label="Nationality" value={userData.nationality} />
          </InfoSection>

          <InfoSection title="Profile & Verification" icon={Shield}>
            <InfoRow label="Profile Type" value={userData.profile_type} />
            <InfoRow label="User Category" value={userData.user_category} />
            <InfoRow label="Verification Tier" value={userData.verification_tier} />
            <InfoRow label="Verification Status" value={userData.verification_status} />
            <InfoRow label="Onboarding Completed" value={userData.onboarding_completed ? 'Yes' : 'No'} />
            <InfoRow label="Profile Completion" value={`${userData.profile_completion_percentage || 0}%`} />
            <InfoRow label="Tier" value={userData.tier} />
            <InfoRow label="Role" value={userData.role} />
          </InfoSection>

          <InfoSection title="Education" icon={GraduationCap}>
            {userData.education && typeof userData.education === 'object' ? (
              <>
                <InfoRow label="Highest Education" value={userData.education.level} />
                <InfoRow label="Study Country" value={userData.education.country} />
                <InfoRow label="Institutions" value={userData.education.institutions} />
                <InfoRow label="Field of Study" value={userData.education.field} />
                <InfoRow label="Other Countries Worked" value={userData.education.other_countries} />
                <InfoRow label="Languages Spoken" value={userData.education.languages?.map((l: any) => `${l.lang} (${l.level})`).join(', ')} />
              </>
            ) : (
              <p className="text-[var(--text-secondary)] text-sm">No education data</p>
            )}
          </InfoSection>

          <InfoSection title="Professional Experience" icon={Briefcase}>
            <InfoRow label="Years of Experience" value={userData.years_of_experience} />
            <InfoRow label="Primary Sector" value={userData.sector} />
            <InfoRow label="Functional Expertise" value={userData.expertise?.join(', ')} />
            <InfoRow label="Employment Status" value={userData.employment_status} />
            <InfoRow label="Current Organisation" value={userData.organisation} />
          </InfoSection>

          <InfoSection title="Professional Bio" icon={FileText}>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              {userData.bio || 'No bio provided'}
            </p>
          </InfoSection>

          <InfoSection title="Engagement Preferences" icon={Target}>
            <InfoRow label="Engagement Types" value={userData.engagement_types?.join(', ')} />
            <InfoRow label="Availability" value={userData.availability} />
            <InfoRow label="Preferred Format" value={userData.preferred_format} />
            <InfoRow label="Compensation Expectation" value={userData.compensation_expectation} />
            <InfoRow label="Preferred Project Types" value={userData.preferred_project_types?.join(', ')} />
          </InfoSection>

          <InfoSection title="Skills & Passions" icon={Heart}>
            <div className="mb-4">
              <h4 className="text-[var(--text-primary)] text-sm font-medium mb-2">Specific Skills</h4>
              <p className="text-[var(--text-secondary)] text-sm whitespace-pre-wrap">{userData.skills || 'N/A'}</p>
            </div>
            <div className="mb-4">
              <h4 className="text-[var(--text-primary)] text-sm font-medium mb-2">Passionate Problems</h4>
              <p className="text-[var(--text-secondary)] text-sm whitespace-pre-wrap">{userData.passions || 'N/A'}</p>
            </div>
            <InfoRow label="SDG Alignment" value={userData.sdg_alignment?.join(', ')} />
          </InfoSection>

          <InfoSection title="Experience & Interests" icon={TrendingUp}>
            <InfoRow label="Worked with SMEs" value={userData.worked_with_smes ? 'Yes' : 'No'} />
            {userData.worked_with_smes && (
              <div className="py-2">
                <p className="text-[var(--text-secondary)] text-sm">{userData.sme_experience}</p>
              </div>
            )}
            <InfoRow label="Cross-Sector Collaboration" value={userData.cross_sector ? 'Yes' : 'No'} />
            <InfoRow label="Seeking Income" value={userData.seeking_income} />
            <InfoRow label="Venture Interest" value={userData.venture_interest} />
            <InfoRow label="Investor Interest" value={userData.investor_interest} />
          </InfoSection>

          <InfoSection title="Professional Details" icon={Shield}>
            <div className="mb-4">
              <h4 className="text-[var(--text-primary)] text-sm font-medium mb-2">Key Achievements</h4>
              <p className="text-[var(--text-secondary)] text-sm whitespace-pre-wrap">{userData.key_achievements || 'N/A'}</p>
            </div>
            <InfoRow label="Industry Sub-Specialization" value={userData.industry_sub_spec} />
          </InfoSection>

          <InfoSection title="Visibility & Community" icon={Globe}>
            {userData.visibility_settings && typeof userData.visibility_settings === 'object' ? (
              <>
                <InfoRow label="Open to Spotlight" value={userData.visibility_settings.spotlight ? 'Yes' : 'No'} />
                <InfoRow label="Would Like to Mentor" value={userData.visibility_settings.mentor ? 'Yes' : 'No'} />
                <InfoRow label="Community Ambassador" value={userData.visibility_settings.ambassador} />
              </>
            ) : (
              <p className="text-[var(--text-secondary)] text-sm">No visibility settings</p>
            )}
          </InfoSection>

          <InfoSection title="Professional References" icon={FileText}>
            <p className="text-[var(--text-secondary)] text-sm whitespace-pre-wrap">
              {userData.professional_references || 'No references provided'}
            </p>
          </InfoSection>

          <InfoSection title="Verification Documents" icon={FileText}>
            {userData.verification_docs && typeof userData.verification_docs === 'object' ? (
              <div className="space-y-2">
                {Object.entries(userData.verification_docs).map(([key, value]: [string, any]) => {
                  if (!value) return null;
                  return (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-[var(--text-secondary)] text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                      <a 
                        href={value} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[var(--sp-accent)] text-sm hover:underline"
                      >
                        View Document
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[var(--text-secondary)] text-sm">No documents uploaded</p>
            )}
          </InfoSection>

          <InfoSection title="Network & Performance" icon={TrendingUp}>
            <InfoRow label="Connections" value={userData.connections || 0} />
            <InfoRow label="Rating" value={userData.rating ? `${userData.rating} / 5.0` : 'Not rated yet'} />
            <InfoRow label="Total Projects" value={userData.total_projects || 0} />
            <InfoRow label="Total Skills" value={userData.total_skills || 0} />
          </InfoSection>

          <InfoSection title="Timestamps" icon={FileText}>
            <InfoRow label="Created At" value={new Date(userData.created_at).toLocaleString()} />
            <InfoRow label="Updated At" value={new Date(userData.updated_at).toLocaleString()} />
          </InfoSection>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetailPage;
