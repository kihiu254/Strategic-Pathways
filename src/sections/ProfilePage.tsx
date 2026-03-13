import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, 
  Edit2, Camera, Linkedin, Twitter, Globe, Award, FileText,
  CheckCircle, Clock, Star, Upload, Trash2, Loader2, Shield, Zap, Search, Plus, Share2, Eye, X,
  Activity, Settings, Heart
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { calculateDynamicMatchScore } from '../utils/matchScoring';
import type { MatchScores } from '../utils/matchScoring';
import { rankOpportunities, MOCK_OPPORTUNITIES } from '../utils/opportunities';

const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({
    project_title: '',
    project_description: '',
    organization: '',
    role: '',
    is_current: false,
    tags: [] as string[]
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('profilePage.greeting.morning');
    if (hour < 18) return t('profilePage.greeting.afternoon');
    return t('profilePage.greeting.evening');
  };

  const [profile, setProfile] = useState<{
    name: string;
    title: string;
    email: string;
    phone: string;
    countryCode: string;
    location: string;
    language: string;
    bio: string;
    education: any[];
    experience: any[];
    skills: string[];
    certifications: string[];
    projects: number;
    connections: number;
    rating: number;
    memberSince: string;
    tier: string;
    avatar_url: string;
    profileType: string;
    userCategory: string;
    verificationTier: string;
    matchScore: number;
    matchScoresDetails: MatchScores | null;
    sector?: string;
    primarySector?: string;
  }>({
    name: user?.user_metadata?.full_name || t('common.loading'),
    title: t('profilePage.status.professional'),
    email: '',
    phone: '',
    countryCode: '+254',
    location: '',
    language: 'English',
    bio: '',
    education: [],
    experience: [],
    skills: [],
    certifications: [],
    projects: 0,
    connections: 0,
    rating: 0.0,
    memberSince: '',
    tier: 'Community',
    avatar_url: '',
    profileType: 'Standard Member',
    userCategory: '',
    verificationTier: 'Tier 1 – Self-Declared',
    matchScore: 0,
    matchScoresDetails: null
  });

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const date = new Date(data.created_at);
          const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

          setProfile(prev => ({
            ...prev,
            name: data.full_name || user.user_metadata?.full_name || t('profilePage.status.member'),
            email: data.email || user.email || '',
            phone: data.phone || '',
            countryCode: data.country_code || '+254',
            language: data.language || 'English',
            bio: data.bio || '',
            location: data.location || '',
            tier: data.tier || 'Community',
            title: data.role === 'admin' ? t('profilePage.status.admin') : t('profilePage.status.professional'),
            memberSince: monthYear,
            avatar_url: data.avatar_url || '',
            profileType: data.profile_type || 'Standard Member',
            userCategory: data.user_category || '',
            verificationTier: data.verification_tier || 'Tier 1 – Self-Declared',
            matchScore: data.profile_completion_percentage || 0,
            education: data.education && typeof data.education === 'object' && !Array.isArray(data.education) 
              ? [{
                  degree: data.education.level || 'Not specified',
                  school: data.education.institutions || 'Not specified',
                  year: data.education.country || 'Not specified',
                  field: data.education.field || 'Not specified'
                }] 
              : Array.isArray(data.education) ? data.education : [],
            // Create experience from professional data
            experience: data.years_of_experience && data.sector 
              ? [{
                  role: data.professional_title || 'Professional',
                  company: data.organisation || data.sector,
                  period: `${data.years_of_experience} years experience`,
                  description: data.bio || 'Professional experience'
                }]
              : Array.isArray(data.experience_json) ? data.experience_json : [], 
            certifications: Array.isArray(data.certifications) ? data.certifications : 
              (data.verification_tier && data.verification_tier !== 'Tier 1 – Self-Declared' ? 
                [`${data.verification_tier} Verified`] : [])
          }));
        } else {
          setProfile(prev => ({
            ...prev,
            name: user.user_metadata?.full_name || 'Strategic Member',
            email: user.email || ''
          }));
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        if (user.role === 'authenticated') {
          toast.error('Failed to load profile data.');
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    const fetchSkills = async () => {
      try {
        // First try to get skills from user_skills table
        const { data: userSkillsData, error: userSkillsError } = await supabase
          .from('user_skills')
          .select('skill_name')
          .eq('user_id', user.id);
        
        if (userSkillsError) throw userSkillsError;
        
        let skillsArray = [];
        if (userSkillsData && userSkillsData.length > 0) {
          skillsArray = userSkillsData.map(s => s.skill_name);
        } else {
          // Fallback to skills from profiles table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('skills, expertise')
            .eq('id', user.id)
            .single();
          
          if (profileData) {
            // Parse skills from text field or expertise array
            if (profileData.skills && typeof profileData.skills === 'string') {
              skillsArray = profileData.skills.split('\n').filter(skill => skill.trim());
            } else if (Array.isArray(profileData.expertise)) {
              skillsArray = profileData.expertise;
            }
          }
        }
        
        setProfile(prev => ({
          ...prev,
          skills: skillsArray
        }));
      } catch (err) {
        console.error('Error fetching skills:', err);
      }
    };

    const fetchProjects = async () => {
      try {
        const { data, error, count } = await supabase
          .from('user_projects')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data) {
          setProfile(prev => ({
            ...prev,
            projects: count || 0
          }));
          setUserProjects(data);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };

    const fetchActivities = async () => {
      try {
        // Fetch recent verification documents as activities
        const { data: verificationData } = await supabase
          .from('verification_documents')
          .select('document_type, created_at, status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        const activities = [];
        
        if (verificationData) {
          activities.push(...verificationData.map(v => ({
            action: 'Submitted verification',
            target: v.document_type,
            time: new Date(v.created_at).toLocaleDateString(),
            type: 'verification'
          })));
        }

        // Fetch recent projects as activities
        const { data: projectData } = await supabase
          .from('user_projects')
          .select('project_title, created_at, is_current')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (projectData) {
          activities.push(...projectData.map(p => ({
            action: p.is_current ? 'Started project' : 'Completed project',
            target: p.project_title,
            time: new Date(p.created_at).toLocaleDateString(),
            type: 'project'
          })));
        }

        // Sort by date
        activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setActivities(activities.slice(0, 10));
      } catch (err) {
        console.error('Error fetching activities:', err);
      }
    };

    const fetchDocuments = async () => {
      try {
        const { data, error } = await supabase.storage
          .from('resumes')
          .list(user.id);

        if (error) throw error;
        
        let hasCV = false;
        if (data) {
          const actualDocs = data.filter(file => file.name !== '.emptyFolderPlaceholder');
          setDocuments(actualDocs);
          hasCV = actualDocs.length > 0;
        }
        return hasCV;
      } catch (err: any) {
        console.error('Error fetching documents:', err);
        return false;
      }
    };

    const loadAllData = async () => {
      await fetchProfile();
      await fetchSkills();
      await fetchProjects();
      await fetchActivities();
      const hasCV = await fetchDocuments();

      setProfile(prev => {
        const scores = calculateDynamicMatchScore(prev, prev.skills?.length || 0, prev.projects || 0, hasCV);
        return {
          ...prev,
          matchScore: scores.total,
          matchScoresDetails: scores
        };
      });
    };

    loadAllData();
  }, [user, navigate]);

  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const handleSave = async () => {
    try {
      if (!user) throw new Error("Not logged in");

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.name,
          professional_title: profile.title,
          location: profile.location,
          phone: profile.phone,
          country_code: profile.countryCode,
          email: profile.email,
          language: profile.language,
          bio: profile.bio,
          profile_completion_percentage: profile.matchScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error('Failed to update profile: ' + err.message);
    }
  };

  const handleAddProject = async () => {
    try {
      if (!user) throw new Error("Not logged in");
      if (!newProject.project_title) {
        toast.error('Project title is required');
        return;
      }

      const { data, error } = await supabase
        .from('user_projects')
        .insert({
          user_id: user.id,
          project_title: newProject.project_title,
          project_description: newProject.project_description,
          organization: newProject.organization,
          role: newProject.role,
          is_current: newProject.is_current,
          tags: newProject.tags,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;

      toast.success('Project added successfully!');
      setShowAddProject(false);
      setNewProject({
        project_title: '',
        project_description: '',
        organization: '',
        role: '',
        is_current: false,
        tags: []
      });

      // Add to local state
      if (data) {
        setUserProjects([...data, ...userProjects]);
        setProfile(prev => ({ ...prev, projects: prev.projects + 1 }));
      }

      // Trigger email notification
      const { EmailAutomationService } = await import('../lib/emailAutomation');
      await EmailAutomationService.onProjectAdded(
        user.email || '',
        profile.name,
        newProject.project_title
      );
    } catch (err: any) {
      console.error('Add project error:', err);
      toast.error('Failed to add project: ' + err.message);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const { error } = await supabase
        .from('user_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast.success('Project deleted');
      setUserProjects(prev => prev.filter(p => p.id !== projectId));
      setProfile(prev => ({ ...prev, projects: Math.max(0, prev.projects - 1) }));
    } catch (err: any) {
      toast.error('Failed to delete project: ' + err.message);
    }
  };

  const handleShareDocument = async (fileName: string) => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(`${user.id}/${fileName}`, 3600); // 1 hour expiry

      if (error) throw error;
      if (data) {
        await navigator.clipboard.writeText(data.signedUrl);
        toast.success('Shareable link copied to clipboard!');
      }
    } catch (err: any) {
      toast.error('Failed to generate share link: ' + err.message);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploadingFile(true);
    try {
      if (!user) {
        throw new Error("You must be logged in to upload documents.");
      }
      
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (error) throw error;
      
      toast.success('Document uploaded successfully!');
      
      // Refresh documents list
      const { data } = await supabase.storage.from('resumes').list(user.id);
      if (data) setDocuments(data.filter(file => file.name !== '.emptyFolderPlaceholder'));

      // Trigger email notification
      const { EmailAutomationService } = await import('../lib/emailAutomation');
      await EmailAutomationService.onCVUploaded(
        user.email || '',
        profile.name,
        file.name
      );
    } catch (error: any) {
      toast.error('Failed to upload document: ' + error.message);
    } finally {
      setIsUploadingFile(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDownloadFile = async (fileName: string) => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(`${user.id}/${fileName}`, 60);

      if (error) throw error;
      if (data) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err: any) {
      toast.error('Failed to download: ' + err.message);
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    try {
      if (!user) return;
      
      const { error } = await supabase.storage
        .from('resumes')
        .remove([`${user.id}/${fileName}`]);

      if (error) throw error;
      
      toast.success('File deleted successfully');
      setDocuments(prev => prev.filter(doc => doc.name !== fileName));
    } catch (err: any) {
      toast.error('Failed to delete file: ' + err.message);
    }
  };

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      if (!user) {
        throw new Error("You must be logged in to upload a profile picture.");
      }

      const { uploadFile } = await import('../lib/uploadUtils');
      const { url } = await uploadFile(file, 'profiles');
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      setProfile(prev => ({ ...prev, avatar_url: url }));
      toast.success('Profile picture updated successfully!');
    } catch (error: any) {
      toast.error('Failed to upload profile picture: ' + error.message);
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const tabs = [
    { id: 'overview', label: t('profilePage.tabs.overview'), icon: User },
    { id: 'projects', label: t('profilePage.tabs.projects'), icon: Briefcase },
    { id: 'documents', label: t('profilePage.tabs.documents'), icon: FileText },
    { id: 'activity', label: t('profilePage.tabs.activity'), icon: Clock },
  ];

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 gap-4">
        <Loader2 className="w-10 h-10 text-[var(--sp-accent)] animate-spin" />
        <p className="text-[var(--text-secondary)]">{t('profilePage.status.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12">
      <div className="w-full px-6 lg:px-12">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="sp-btn-glass mb-6 flex items-center gap-2"
        >
          {t('profilePage.labels.back')}
        </button>

        {/* Profile Header */}
        <div className="premium-card mb-8 relative overflow-hidden group">
          {/* Background Decorative Element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--sp-accent)]/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-[var(--sp-accent)]/10 transition-colors duration-700" />
          
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 relative z-10">

            {/* Avatar Section */}
            <div className="relative shrink-0">
              <div className="relative w-32 h-32 lg:w-44 lg:h-44">
                {/* Profile Completion Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-white/5"
                  />
                  <circle
                    cx="50" cy="50" r="48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - (profile.matchScore / 100))}
                    className="text-[var(--sp-accent)] transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute inset-2 rounded-full profile-avatar flex items-center justify-center overflow-hidden bg-white/5 border-2 border-[var(--sp-accent)]/20 group-hover:border-[var(--sp-accent)]/40 transition-colors">
                  {isUploadingAvatar ? (
                    <Loader2 size={40} className="text-[var(--sp-accent)] animate-spin" />
                  ) : profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Profile" 
                      width={160}
                      height={160}
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" 
                    />
                  ) : (
                    <User size={64} className="text-[var(--sp-accent)]" />
                  )}
                </div>
              </div>
              
              <input 
                type="file" 
                id="avatar-upload"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isUploadingAvatar}
              />
              <button 
                onClick={() => document.getElementById('avatar-upload')?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[var(--sp-accent)] flex items-center justify-center text-[var(--text-inverse)] hover:bg-[#D4B76E] transition-all shadow-lg hover:scale-110 active:scale-95 disabled:opacity-50 z-20"
              >
                <Camera size={18} />
              </button>
              
              {/* Completion Badge */}
              <div className="absolute -top-1 -right-1 bg-[var(--bg-primary)] px-2 py-1 rounded-lg border border-[var(--sp-accent)]/30 text-[10px] font-bold text-[var(--sp-accent)] animate-pulse-subtle">
                {profile.matchScore}%
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-grow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {isEditing ? (
                      <input 
                        value={profile.name} 
                        onChange={e => setProfile({...profile, name: e.target.value})} 
                        className="input-glass py-2 px-3 text-2xl lg:text-3xl font-bold w-full"
                        placeholder="Your full name"
                      />
                    ) : (
                      <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">
                        {getGreeting()}, {profile.name.split(' ')[0]} 👋
                      </h1>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <input 
                      value={profile.title} 
                      onChange={e => setProfile({...profile, title: e.target.value})} 
                      className="input-glass py-1 px-2 text-lg mb-1 w-full"
                      placeholder="Professional title"
                    />
                  ) : (
                    <p className="text-[var(--sp-accent)] text-lg mb-1">{profile.title}</p>
                  )}
                  
                  {profile.userCategory && (
                    <p className="text-[var(--text-secondary)] text-sm mb-2 italic">
                      {profile.userCategory}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 mb-2">
                    {profile.verificationTier === 'Tier 1 – Self-Declared' ? (
                      <span className="px-3 py-1.5 rounded-xl bg-white/5 text-[var(--text-secondary)] text-[10px] font-medium flex items-center gap-1.5 border border-white/10 hover:border-white/20 transition-colors">
                        <Clock size={12} />
                        {t('profilePage.status.selfDeclared')}
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 rounded-xl bg-[var(--sp-accent)]/20 text-[var(--sp-accent)] text-xs font-bold flex items-center gap-1.5 border border-[var(--sp-accent)]/30 shadow-lg shadow-[var(--sp-accent)]/10">
                          <Shield size={14} className="fill-[var(--sp-accent)]/20" />
                          {profile.verificationTier === 'Tier 3 – Institutional Ready' ? 'Institutional Ready' : 'Verified Professional'}
                        </span>
                        {profile.profileType === 'Premium (Verified)' && (
                          <span className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center gap-1.5 border border-blue-500/30 shadow-lg shadow-blue-500/10">
                            <Zap size={14} />
                            Venture Builder
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[var(--text-secondary)] text-sm mt-3">
                    {isEditing ? (
                      <>
                        <div className="flex items-center gap-2 w-full lg:w-auto">
                           <MapPin size={14} className="shrink-0" />
                           <input value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} className="input-glass py-1 px-2 text-sm w-full lg:w-48" />
                        </div>
                        <div className="flex items-center gap-2 w-full lg:w-auto">
                           <Mail size={14} className="shrink-0" />
                           <input value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="input-glass py-1 px-2 text-sm w-full lg:w-48" />
                        </div>
                        <div className="flex items-center gap-2 w-full lg:w-auto">
                           <Globe size={14} className="shrink-0" />
                           <select 
                             value={profile.language} 
                             onChange={e => setProfile({...profile, language: e.target.value})} 
                             className="input-glass py-1 px-2 text-sm w-full lg:w-48 appearance-none"
                           >
                             <option value="English">English</option>
                             <option value="Swahili">Swahili</option>
                             <option value="French">French</option>
                           </select>
                        </div>
                        <div className="flex items-center gap-2 w-full lg:w-auto">
                           <Phone size={14} className="shrink-0" />
                           <div className="flex bg-white/5 border border-[var(--sp-accent)]/20 rounded-xl overflow-hidden w-full lg:w-64">
                             <select 
                               value={profile.countryCode} 
                               onChange={e => setProfile({...profile, countryCode: e.target.value})} 
                               className="bg-transparent text-[var(--text-primary)] px-2 py-1 outline-none text-sm border-r border-[var(--sp-accent)]/20 appearance-none min-w-[70px]"
                             >
                               <option value="+254">+254</option>
                               <option value="+1">+1</option>
                               <option value="+44">+44</option>
                               <option value="+256">+256</option>
                               <option value="+255">+255</option>
                             </select>
                             <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="bg-transparent border-none outline-none py-1 px-2 text-sm w-full text-[var(--text-primary)]" placeholder="Phone Number" />
                           </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {profile.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail size={14} />
                          {profile.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe size={14} />
                          {profile.language}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={14} />
                          {profile.countryCode} {profile.phone}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => navigate('/profile/edit')}
                    className="sp-btn-primary flex items-center gap-2"
                  >
                    <Edit2 size={16} />
                    Edit Full Profile
                  </button>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="sp-btn-glass flex items-center gap-2"
                  >
                    <Edit2 size={16} />
                    {isEditing ? t('profilePage.actions.cancel') : 'Quick Edit'}
                  </button>
                  {isEditing && (
                    <button 
                      onClick={handleSave}
                      className="sp-btn-primary flex items-center gap-2"
                    >
                      <CheckCircle size={16} />
                      {t('profilePage.actions.save')}
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                <div className="glass-light backdrop-blur-xl rounded-2xl p-4 text-center border border-white/5 hover:border-[var(--sp-accent)]/20 transition-all group/stat">
                  <div className="text-2xl font-bold text-[var(--sp-accent)] group-hover:scale-110 transition-transform">{profile.projects}</div>
                  <div className="text-[var(--text-secondary)] text-xs uppercase tracking-wider font-semibold opacity-70 mt-1">{t('profilePage.labels.projects')}</div>
                </div>
                <div className="glass-light backdrop-blur-xl rounded-2xl p-4 text-center border border-white/5 hover:border-[var(--sp-accent)]/20 transition-all group/stat">
                  <div className="text-2xl font-bold text-[var(--sp-accent)] group-hover:scale-110 transition-transform">{profile.connections}</div>
                  <div className="text-[var(--text-secondary)] text-xs uppercase tracking-wider font-semibold opacity-70 mt-1">{t('profilePage.labels.connections')}</div>
                </div>
                <div className="glass-light backdrop-blur-xl rounded-2xl p-4 text-center border border-white/5 hover:border-[var(--sp-accent)]/20 transition-all group/stat">
                  <div className="text-2xl font-bold text-[var(--sp-accent)] flex items-center justify-center gap-1.5 group-hover:scale-110 transition-transform">
                    {profile.rating}
                    <Star size={16} className="fill-[var(--sp-accent)] text-[var(--sp-accent)]" />
                  </div>
                  <div className="text-[var(--text-secondary)] text-xs uppercase tracking-wider font-semibold opacity-70 mt-1">{t('profilePage.labels.rating')}</div>
                </div>
                <div className="glass-light backdrop-blur-xl rounded-2xl p-4 text-center border border-white/5 hover:border-[var(--sp-accent)]/20 transition-all group/stat">
                  <div className="text-lg font-bold text-[var(--sp-accent)] group-hover:scale-110 transition-transform">{profile.tier}</div>
                  <div className="text-[var(--text-secondary)] text-xs uppercase tracking-wider font-semibold opacity-70 mt-1">{t('profilePage.labels.tier')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl transition-all duration-300 whitespace-nowrap border ${
                activeTab === tab.id
                  ? 'bg-[var(--sp-accent)] text-[var(--text-inverse)] border-[var(--sp-accent)] shadow-lg shadow-[var(--sp-accent)]/20 font-bold scale-105'
                  : 'glass-light text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-white/5 hover:border-white/20'
              }`}
            >
              <tab.icon size={20} className={activeTab === tab.id ? 'animate-pulse-subtle' : ''} />
              <span className="tracking-wide">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* About */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <User size={18} className="text-[var(--sp-accent)]" />
                    {t('profilePage.labels.about')}
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="input-glass w-full min-h-[120px] p-4"
                    />
                  ) : (
                    <p className="text-[var(--text-secondary)] leading-relaxed">{profile.bio}</p>
                  )}
                </div>

                {/* Experience */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Briefcase size={18} className="text-[var(--sp-accent)]" />
                    {t('profilePage.labels.experience')}
                  </h3>
                  <div className="space-y-4">
                    {profile.experience.map((exp, index) => (
                      <div key={index} className="glass-light rounded-xl p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-[var(--text-primary)] font-medium">{exp.role}</h4>
                            <p className="text-[var(--sp-accent)] text-sm">{exp.company}</p>
                          </div>
                          <span className="text-[var(--text-secondary)] text-sm">{exp.period}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <GraduationCap size={18} className="text-[var(--sp-accent)]" />
                    {t('profilePage.labels.education')}
                  </h3>
                  <div className="space-y-4">
                    {profile.education.map((edu, index) => (
                      <div key={index} className="glass-light rounded-xl p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-[var(--text-primary)] font-medium">{edu.degree}</h4>
                            <p className="text-[var(--sp-accent)] text-sm">{edu.school}</p>
                          </div>
                          <span className="text-[var(--text-secondary)] text-sm">{edu.year}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'projects' && (
              <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{t('profilePage.labels.myProjects')}</h3>
                  <button
                    onClick={() => setShowAddProject(!showAddProject)}
                    className="sp-btn-primary flex items-center gap-2 text-sm"
                  >
                    <Plus size={16} />
                    Add Project
                  </button>
                </div>

                {showAddProject && (
                  <div className="glass-light p-6 rounded-xl mb-6 space-y-4">
                    <h4 className="text-[var(--text-primary)] font-medium mb-4">New Project</h4>
                    <input
                      placeholder="Project Title *"
                      value={newProject.project_title}
                      onChange={(e) => setNewProject({...newProject, project_title: e.target.value})}
                      className="input-glass w-full"
                    />
                    <textarea
                      placeholder="Description"
                      value={newProject.project_description}
                      onChange={(e) => setNewProject({...newProject, project_description: e.target.value})}
                      className="input-glass w-full min-h-[100px]"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        placeholder="Organization"
                        value={newProject.organization}
                        onChange={(e) => setNewProject({...newProject, organization: e.target.value})}
                        className="input-glass w-full"
                      />
                      <input
                        placeholder="Your Role"
                        value={newProject.role}
                        onChange={(e) => setNewProject({...newProject, role: e.target.value})}
                        className="input-glass w-full"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <input
                        type="checkbox"
                        checked={newProject.is_current}
                        onChange={(e) => setNewProject({...newProject, is_current: e.target.checked})}
                        className="w-4 h-4 rounded"
                      />
                      Currently working on this project
                    </label>
                    <div className="flex gap-2">
                      <button onClick={handleAddProject} className="sp-btn-primary">
                        Save Project
                      </button>
                      <button onClick={() => setShowAddProject(false)} className="sp-btn-glass">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {userProjects.length === 0 ? (
                  <div className="text-center py-8 text-[var(--text-secondary)]">
                    No projects yet. Start adding your work!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userProjects.map((project) => (
                      <div key={project.id} className="glass-light rounded-xl p-4 hover:bg-white/5 transition-colors group relative">
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete project"
                        >
                          <X size={14} />
                        </button>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-[var(--sp-accent)]/20 flex items-center justify-center">
                            <Briefcase size={18} className="text-[var(--sp-accent)]" />
                          </div>
                          <div>
                            <h4 className="text-[var(--text-primary)] font-medium">{project.project_title}</h4>
                            <p className="text-[var(--text-secondary)] text-xs">
                              {project.organization || 'Personal'} • {new Date(project.created_at).getFullYear()}
                            </p>
                          </div>
                        </div>
                        <p className="text-[var(--text-secondary)] text-sm line-clamp-2">
                          {project.project_description || 'No description provided'}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            project.is_current 
                              ? 'bg-green-500/10 text-green-400' 
                              : 'bg-[var(--sp-accent)]/10 text-[var(--sp-accent)]'
                          }`}>
                            {project.is_current ? 'In Progress' : 'Completed'}
                          </span>
                          {project.tags && project.tags.map((tag: string) => (
                            <span key={tag} className="px-2 py-1 rounded-full bg-white/5 text-[var(--text-secondary)] text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{t('profilePage.tabs.documents')}</h3>
                  <div>
                    <input 
                      type="file" 
                      id="cv-upload" 
                      className="hidden" 
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      disabled={isUploadingFile}
                    />
                    <label 
                      htmlFor="cv-upload"
                      className={`sp-btn-primary flex items-center gap-2 cursor-pointer text-sm ${isUploadingFile ? 'opacity-50' : ''}`}
                    >
                      {isUploadingFile ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      {isUploadingFile ? t('profilePage.actions.uploading') : t('profilePage.actions.upload')}
                    </label>
                  </div>
                </div>
                
                  <div className="space-y-3">
                  {documents.length === 0 ? (
                    <div className="text-center py-6 text-[var(--text-secondary)]">{t('profilePage.actions.noDocs')}</div>
                  ) : (
                    documents.map((doc, i) => (
                      <div key={i} className="glass-light rounded-xl p-4 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                            <FileText size={18} className="text-red-400" />
                          </div>
                          <div>
                            <p className="text-[var(--text-primary)] font-medium truncate max-w-[150px] sm:max-w-[250px] md:max-w-xs">{doc.name.replace(/^\d+_/, '')}</p>
                            <p className="text-[var(--text-secondary)] text-xs">
                              {(doc.metadata?.size / (1024 * 1024)).toFixed(2)} MB • {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleDownloadFile(doc.name)}
                            className="p-2 rounded-lg bg-white/5 text-[var(--text-secondary)] hover:text-[var(--sp-accent)] hover:bg-[var(--sp-accent)]/10 transition-colors"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleShareDocument(doc.name)}
                            className="p-2 rounded-lg bg-white/5 text-[var(--text-secondary)] hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                            title="Copy share link"
                          >
                            <Share2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteFile(doc.name)}
                            className="p-2 text-[var(--text-secondary)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 rounded-lg hover:bg-red-500/10"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  
                  <div className="mt-6 p-4 bg-[var(--sp-accent)]/10 border border-[var(--sp-accent)]/20 rounded-xl">
                    <p className="text-sm text-[var(--text-secondary)] text-center">
                      Upload your latest CV/Resume here to rapidly apply for Opportunities. Supports PDF and DOCX formats up to 5MB.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div className="premium-glass p-8 rounded-[32px] border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--sp-accent)] to-transparent opacity-30" />
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-8 tracking-tight flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[var(--sp-accent)]/10">
                      <Zap size={20} className="text-[var(--sp-accent)]" />
                    </div>
                    {t('profilePage.labels.recentActivity')}
                  </h3>
                  
                  {activities.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Activity size={24} className="text-[var(--text-secondary)] opacity-30" />
                      </div>
                      <p className="text-[var(--text-secondary)] font-medium">No recent activity found</p>
                    </div>
                  ) : (
                    <div className="relative space-y-0">
                      {/* Vertical line */}
                      <div className="absolute left-[19px] top-2 bottom-8 w-0.5 bg-gradient-to-b from-[var(--sp-accent)]/20 via-white/5 to-transparent" />
                      
                      {activities.map((activity, i) => (
                        <div key={i} className="relative pl-12 pb-8 group">
                          {/* Dot */}
                          <div className="absolute left-0 top-1.5 w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-white/10 flex items-center justify-center group-hover:border-[var(--sp-accent)]/50 transition-all z-10">
                            <Activity size={16} className="text-[var(--sp-accent)]" />
                          </div>
                          
                          <div className="premium-glass-gold p-4 rounded-2xl border border-white/5 group-hover:border-[var(--sp-accent)]/20 transition-all">
                            <p className="text-[var(--text-primary)] text-sm font-medium mb-1">
                              <span className="text-[var(--sp-accent)] font-bold">{activity.action}</span> {activity.target}
                            </p>
                            <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest opacity-60">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Components moved to main content area */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {/* Recommended Opportunities Widget */}
            <div className="premium-glass p-8 rounded-[32px] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--sp-accent)]/10 blur-[50px] rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3 relative z-10 tracking-tight">
                <Star size={20} className="text-[var(--sp-accent)] fill-[var(--sp-accent)] animate-pulse-subtle" />
                {t('profilePage.labels.recommended')}
              </h3>
              
              <div className="space-y-4 relative z-10">
                {(profile.tier === 'Community' || ['Standard Member', 'Standard (MVP)'].includes(profile.profileType)) ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Shield size={40} className="text-[var(--sp-accent)]/20 mb-3" />
                    <p className="text-sm font-bold text-[var(--text-primary)] mb-1">Premium Feature</p>
                    <p className="text-[10px] text-[var(--text-secondary)] max-w-[180px]">Upgrade to view personalized opportunities matched to your profile.</p>
                  </div>
                ) : (
                  (() => {
                    const ranked = rankOpportunities(MOCK_OPPORTUNITIES, profile, profile.skills || []);
                    return ranked.slice(0, 2).map((opp: any) => (
                      <div key={opp.id} className="premium-glass-gold p-4 rounded-2xl border border-white/5 hover:border-[var(--sp-accent)]/30 transition-all group/item cursor-pointer" onClick={() => navigate('/opportunities')}>
                        <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1 group-hover/item:text-[var(--sp-accent)] transition-colors">{opp.title}</h4>
                        <p className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider mb-2">{opp.org}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {opp.tags.map((tag: string) => (
                            <span key={tag} className="text-[8px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[var(--text-secondary)] uppercase tracking-widest">{tag}</span>
                          ))}
                        </div>
                      </div>
                    ));
                  })()
                )}
              </div>

              <button 
                onClick={() => (profile.tier === 'Community' || ['Standard Member', 'Standard (MVP)'].includes(profile.profileType)) ? navigate('/pricing') : navigate('/opportunities')} 
                className="w-full mt-6 py-3 rounded-2xl bg-[var(--sp-accent)] text-[var(--text-inverse)] font-bold text-xs uppercase tracking-widest shadow-lg shadow-[var(--sp-accent)]/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {(profile.tier === 'Community' || ['Standard Member', 'Standard (MVP)'].includes(profile.profileType)) ? 'Upgrade to Unlock' : t('profilePage.labels.viewMatches')}
              </button>
            </div>

            {/* Quick Actions Panel */}
            <div className="premium-glass p-8 rounded-[32px] border border-white/5 relative overflow-hidden">
               <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3 relative z-10 tracking-tight">
                <Zap size={20} className="text-[var(--sp-accent)]" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: FileText, label: 'Update CV', color: 'bg-blue-500/10 text-blue-400', action: () => { setActiveTab('documents'); setTimeout(() => document.getElementById('cv-upload')?.click(), 100); } },
                  { icon: Share2, label: 'Share Profile', color: 'bg-purple-500/10 text-purple-400', action: () => handleShareDocument('profile') },
                  { icon: Search, label: 'Find Work', color: 'bg-green-500/10 text-green-400', action: () => navigate('/opportunities') },
                  { icon: Settings, label: 'Edit Profile', color: 'bg-orange-500/10 text-orange-400', action: () => navigate('/profile/edit') },
                ].map((action, i) => (
                  <button key={i} onClick={action.action} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[var(--sp-accent)]/20 hover:bg-white/[0.05] transition-all group">
                    <div className={`p-2 rounded-xl mb-2 ${action.color} group-hover:scale-110 transition-transform`}>
                      <action.icon size={18} />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="premium-glass p-8 rounded-[32px] border border-white/5 border-l-4 border-l-[var(--sp-accent)]">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-[var(--sp-accent)]/10 text-[var(--sp-accent)]">
                  <Heart size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2">Pro Tip</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed opacity-80">
                    Profiles with verified skills get 3x more visibility from high-value opportunities. Consider taking a skill assessment today!
                  </p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <Award size={18} className="text-[var(--sp-accent)]" />
                  {t('profilePage.labels.skills')}
                </h3>
                <button onClick={() => toast.success('Verification request submitted. Our team will review your portfolio.')} className="text-[var(--text-secondary)] hover:text-green-400 transition-colors text-xs font-bold flex items-center gap-1 bg-white/5 py-1 px-2 rounded-lg">
                  <Shield size={14} /> Verify Skills
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1.5 rounded-full bg-[var(--sp-accent)]/10 text-[var(--sp-accent)] text-sm flex items-center gap-1.5"
                  >
                    {skill}
                    {index < 2 && (
                      <CheckCircle size={14} className="text-green-400" />
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Shield size={18} className="text-[var(--sp-accent)]" />
                {t('profilePage.labels.certifications')}
              </h3>
              <div className="space-y-3">
                {profile.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-[var(--sp-accent)]" />
                    <span className="text-[var(--text-secondary)] text-sm">{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Connect</h3>
              <div className="flex gap-3">
                <button className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--sp-accent)] hover:bg-[var(--sp-accent)]/10 transition-colors">
                  <Linkedin size={18} />
                </button>
                <button className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--sp-accent)] hover:bg-[var(--sp-accent)]/10 transition-colors">
                  <Twitter size={18} />
                </button>
                <button className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--sp-accent)] hover:bg-[var(--sp-accent)]/10 transition-colors">
                  <Globe size={18} />
                </button>
              </div>
            </div>

            {/* Match Intelligence - NEW */}
            <div className="glass-card p-6 border-t-4 border-[var(--sp-accent)]">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <Search size={18} className="text-[var(--sp-accent)]" />
                  Match Score
                </h3>
                <div className="text-2xl font-bold text-[var(--sp-accent)]">{profile.matchScore}%</div>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: 'Sector Match', weight: 25, score: profile.matchScoresDetails?.sectorMatch || 0 },
                  { label: 'Functional Skill', weight: 25, score: profile.matchScoresDetails?.functionalSkill || 0 },
                  { label: 'Geo Relevance', weight: 15, score: profile.matchScoresDetails?.geoRelevance || 0 },
                  { label: 'Experience Prep', weight: 15, score: profile.matchScoresDetails?.experiencePrep || 0 },
                  { label: 'Intent Overlay', weight: 20, score: profile.matchScoresDetails?.intentOverlay || 0 }
                ].map((m, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                      <span>{m.label} ({m.weight}%)</span>
                      <span className="text-[var(--sp-accent)]">{Math.round((m.score / m.weight) * 100)}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--sp-accent)] transition-all duration-1000" 
                        style={{ width: `${(m.score / m.weight) * 100}%`, opacity: m.weight / 25 }} 
                      />
                    </div>
                  </div>
                ))}
              </div>

              {(profile.tier === 'Community' || ['Standard Member', 'Standard (MVP)'].includes(profile.profileType)) && (
                <div className="mt-8 p-4 rounded-xl bg-[var(--sp-accent)]/10 border border-[var(--sp-accent)]/20">
                  <p className="text-[10px] text-[var(--sp-accent)] font-bold mb-2 uppercase flex items-center gap-1">
                    <Star size={10} /> Premium Unlock
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    Complete your Premium profile to unlock institutional matching and detailed skill indexing.
                  </p>
                  <button onClick={() => navigate('/pricing')} className="w-full sp-btn-primary py-2 text-xs">Upgrade to Premium</button>
                </div>
              )}
            </div>

            {/* Member Info */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Membership</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Member Since</span>
                  <span className="text-[var(--text-primary)]">{profile.memberSince}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Tier</span>
                  <span className="text-[var(--sp-accent)]">{profile.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Verification</span>
                  <span className={`text-xs font-bold ${profile.verificationTier === 'Tier 1 – Self-Declared' ? 'text-[var(--text-secondary)]' : 'text-[var(--sp-accent)]'}`}>
                    {profile.verificationTier.split(' – ')[1] || profile.verificationTier}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Status</span>
                  <span className="text-green-400 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
