import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, 
  Edit2, Camera, Linkedin, Twitter, Globe, Award, FileText,
  CheckCircle, Clock, Star, Upload, Trash2, Loader2, Shield, Zap, Search
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

const ProfilePage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const [profile, setProfile] = useState({
    name: user?.user_metadata?.full_name || 'Loading...',
    title: 'Professional Member',
    email: '',
    phone: '',
    countryCode: '+254',
    location: '',
    language: 'English',
    bio: '',
    education: [
      { degree: 'MSc in Public Policy', school: 'London School of Economics', year: '2019-2021' },
      { degree: 'BA in Economics', school: 'University of Nairobi', year: '2015-2019' }
    ],
    experience: [
      { role: 'Senior Policy Advisor', company: 'Ministry of Devolution', period: '2022 - Present' },
      { role: 'Research Associate', company: 'Kenya Institute for Public Policy Research', period: '2021 - 2022' }
    ],
    skills: ['Policy Analysis', 'Research', 'Stakeholder Engagement', 'Project Management', 'Data Analysis'],
    certifications: ['Project Management Professional (PMP)', 'Data Analytics Certificate'],
    projects: 0,
    connections: 0,
    rating: 0.0,
    memberSince: '',
    tier: 'Community',
    avatar_url: '',
    profileType: 'Standard (MVP)',
    userCategory: '',
    verificationTier: 'Tier 1 – Self-Declared',
    matchScore: 85 // Mock initial score
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
            name: data.full_name || user.user_metadata?.full_name || 'Strategic Member',
            email: data.email || user.email || '',
            phone: data.phone || '',
            countryCode: data.country_code || '+254',
            language: data.language || 'English',
            bio: data.bio || '',
            location: data.location || '',
            tier: data.tier || 'Community',
            title: data.role === 'admin' ? 'Administrator' : 'Professional Member',
            memberSince: monthYear,
            avatar_url: data.avatar_url || '',
            profileType: data.profile_type || 'Standard (MVP)',
            userCategory: data.user_category || '',
            verificationTier: data.verification_tier || 'Tier 1 – Self-Declared',
            matchScore: 85
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
        // Only show error if they are truly logged in but profile failed to load
        // Avoid flashing error on initial redirect
        if (user.role === 'authenticated') {
          toast.error('Failed to load profile data.');
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    const fetchDocuments = async () => {
      try {
        const { data, error } = await supabase.storage
          .from('resumes')
          .list(user.id);

        if (error) throw error;
        if (data) {
          // Filter out the hidden placeholder folder if Supabase created it
          setDocuments(data.filter(file => file.name !== '.emptyFolderPlaceholder'));
        }
      } catch (err: any) {
        console.error('Error fetching documents:', err);
      }
    };

    fetchProfile();
    fetchDocuments();
  }, [user, navigate]);

  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const handleSave = async () => {
    try {
      if (!user) throw new Error("Not logged in");

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          location: profile.location,
          phone: profile.phone,
          country_code: profile.countryCode,
          email: profile.email,
          language: profile.language,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error('Failed to update profile: ' + err.message);
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

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;
      
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success('Profile picture updated successfully!');
    } catch (error: any) {
      toast.error('Failed to upload profile picture: ' + error.message);
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'activity', label: 'Activity', icon: Clock },
  ];

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 gap-4">
        <Loader2 className="w-10 h-10 text-[var(--sp-accent)] animate-spin" />
        <p className="text-[var(--text-secondary)]">Loading your profile...</p>
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
          ← Back to Home
        </button>

        {/* Profile Header */}
        <div className="glass-card p-6 lg:p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Avatar Section */}
            <div className="relative">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full profile-avatar flex items-center justify-center overflow-hidden bg-white/5 border-2 border-[var(--sp-accent)]/20">
                {isUploadingAvatar ? (
                  <Loader2 size={40} className="text-[var(--sp-accent)] animate-spin" />
                ) : profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-[var(--sp-accent)]" />
                )}
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
                className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[var(--sp-accent)] flex items-center justify-center text-[var(--text-inverse)] hover:bg-[#D4B76E] transition-colors shadow-lg disabled:opacity-50"
              >
                <Camera size={18} />
              </button>
            </div>

            {/* Info Section */}
            <div className="flex-grow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">
                      {getGreeting()}, {profile.name.split(' ')[0]} 👋
                    </h1>
                  </div>
                  
                  <p className="text-[var(--sp-accent)] text-lg mb-1">{profile.title}</p>
                  
                  {profile.userCategory && (
                    <p className="text-[var(--text-secondary)] text-sm mb-2 italic">
                      {profile.userCategory}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 mb-2">
                    {profile.verificationTier === 'Tier 1 – Self-Declared' ? (
                      <span className="px-3 py-1 rounded-full bg-white/5 text-[var(--text-secondary)] text-[10px] font-medium flex items-center gap-1 border border-white/10">
                        <Clock size={10} />
                        Self-Declared
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full bg-[var(--sp-accent)]/20 text-[var(--sp-accent)] text-xs font-bold flex items-center gap-1 border border-[var(--sp-accent)]/30">
                          <Shield size={12} className="fill-[var(--sp-accent)]/20" />
                          {profile.verificationTier === 'Tier 3 – Institutional Ready' ? 'Institutional Ready' : 'Verified Professional'}
                        </span>
                        {profile.profileType === 'Premium (Verified)' && (
                          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center gap-1 border border-blue-500/30">
                            <Zap size={12} />
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
                             <option className="text-black" value="English">English</option>
                             <option className="text-black" value="Swahili">Swahili</option>
                             <option className="text-black" value="French">French</option>
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
                               <option className="text-black" value="+254">+254</option>
                               <option className="text-black" value="+1">+1</option>
                               <option className="text-black" value="+44">+44</option>
                               <option className="text-black" value="+256">+256</option>
                               <option className="text-black" value="+255">+255</option>
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
                    onClick={() => setIsEditing(!isEditing)}
                    className="sp-btn-glass flex items-center gap-2"
                  >
                    <Edit2 size={16} />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                  {isEditing && (
                    <button 
                      onClick={handleSave}
                      className="sp-btn-primary flex items-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Save
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="glass-light rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--sp-accent)]">{profile.projects}</div>
                  <div className="text-[var(--text-secondary)] text-sm">Projects</div>
                </div>
                <div className="glass-light rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--sp-accent)]">{profile.connections}</div>
                  <div className="text-[var(--text-secondary)] text-sm">Connections</div>
                </div>
                <div className="glass-light rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--sp-accent)] flex items-center justify-center gap-1">
                    {profile.rating}
                    <Star size={16} className="fill-[#C89F5E]" />
                  </div>
                  <div className="text-[var(--text-secondary)] text-sm">Rating</div>
                </div>
                <div className="glass-light rounded-xl p-4 text-center">
                  <div className="text-lg font-bold text-[var(--sp-accent)]">{profile.tier}</div>
                  <div className="text-[var(--text-secondary)] text-sm">Member Tier</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[var(--sp-accent)]/20 text-[var(--sp-accent)] border border-[var(--sp-accent)]/30'
                  : 'glass-light text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <tab.icon size={18} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* About */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <User size={18} className="text-[var(--sp-accent)]" />
                    About
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
                    Experience
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
                    Education
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
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">My Projects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass-light rounded-xl p-4 hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--sp-accent)]/20 flex items-center justify-center">
                          <Briefcase size={18} className="text-[var(--sp-accent)]" />
                        </div>
                        <div>
                          <h4 className="text-[var(--text-primary)] font-medium">County Development Strategy</h4>
                          <p className="text-[var(--text-secondary)] text-xs">Consultancy • 2024</p>
                        </div>
                      </div>
                      <p className="text-[var(--text-secondary)] text-sm">Led policy analysis for devolution framework implementation...</p>
                      <div className="flex gap-2 mt-3">
                        <span className="px-2 py-1 rounded-full bg-[var(--sp-accent)]/10 text-[var(--sp-accent)] text-xs">Completed</span>
                        <span className="px-2 py-1 rounded-full bg-white/5 text-[var(--text-secondary)] text-xs">Policy</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">Documents</h3>
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
                      {isUploadingFile ? 'Uploading...' : 'Upload CV'}
                    </label>
                  </div>
                </div>
                
                  <div className="space-y-3">
                  {documents.length === 0 ? (
                    <div className="text-center py-6 text-[var(--text-secondary)]">No documents uploaded yet.</div>
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
                            className="sp-btn-glass text-sm"
                          >
                            Download
                          </button>
                          <button 
                            onClick={() => handleDeleteFile(doc.name)}
                            className="p-2 text-[var(--text-secondary)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 rounded-lg hover:bg-red-500/10"
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
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { action: 'Applied to project', target: 'County Development Strategy', time: '2 days ago' },
                    { action: 'Connected with', target: 'Sarah Mwangi', time: '5 days ago' },
                    { action: 'Completed project', target: 'NGO Capacity Assessment', time: '1 week ago' },
                    { action: 'Updated profile', target: 'Added new certification', time: '2 weeks ago' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-2 h-2 rounded-full bg-[var(--sp-accent)] mt-2" />
                      <div className="flex-grow">
                        <p className="text-[var(--text-primary)]">
                          <span className="text-[var(--sp-accent)]">{activity.action}</span> {activity.target}
                        </p>
                        <p className="text-[var(--text-secondary)] text-sm">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recommended Opportunities Widget */}
            <div className="glass-card p-6 border border-[var(--sp-accent)]/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--sp-accent)]/10 blur-[50px] rounded-full pointer-events-none" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2 relative z-10">
                <Star size={18} className="text-[var(--sp-accent)] fill-[var(--sp-accent)]" />
                Recommended for You
              </h3>
              
              <div className="space-y-4 relative z-10">
                {(() => {
                  // Mock Opportunities Database
                  const opportunities = [
                    { id: 1, title: 'Digital Transformation Consultant', org: 'Nairobi County Government', location: 'Nairobi', tags: ['Tech', 'Public Sector'], description: 'Lead the digital transformation strategy for county service delivery.' },
                    { id: 2, title: 'AgriTech Value Chain Expert', org: 'Green Innovations NGO', location: 'Nakuru (Hybrid)', tags: ['Agriculture', 'NGO'], description: 'Design and implement supply chain optimizations for local farmers.' },
                    { id: 3, title: 'Venture Builder In-Residence', org: 'Kenya Innovation Hub', location: 'Remote', tags: ['Startups', 'Finance'], description: 'Mentor early-stage startups and help build viable financial models.' },
                    { id: 4, title: 'Public Health Data Analyst', org: 'Ministry of Health Alliance', location: 'Mombasa', tags: ['Healthcare', 'Data Analysis'], description: 'Analyze returning public health data to optimize resource allocation.' },
                  ];

                  // Smart Matching Algorithm: Compare Opp tags/desc against User skills
                  const matches = opportunities.map(opp => {
                    let score = 0;
                    const oppText = (opp.tags.join(' ') + ' ' + opp.description + ' ' + opp.title).toLowerCase();
                    
                    profile.skills.forEach(skill => {
                      if (oppText.includes(skill.toLowerCase())) score += 2;
                      opp.tags.forEach(tag => {
                        if (tag.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(tag.toLowerCase())) score += 3;
                      });
                    });

                    return { ...opp, score };
                  })
                  .filter(opp => opp.score > 0)
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 2);

                  // Fallback if no exact skills match
                  const displayOpps = matches.length > 0 ? matches : opportunities.slice(0, 2);

                  return displayOpps.map(opp => (
                    <div key={opp.id} className="glass-light rounded-xl p-4 hover:bg-[var(--sp-accent)]/5 transition-colors cursor-pointer border border-transparent hover:border-[var(--sp-accent)]/20" onClick={() => navigate('/opportunities')}>
                      <h4 className="text-[var(--text-primary)] font-medium text-sm mb-1">{opp.title}</h4>
                      <p className="text-[var(--text-secondary)] text-xs mb-3">{opp.org}</p>
                      <div className="flex flex-wrap gap-2">
                        {opp.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-[var(--text-inverse)]/5 text-[var(--text-secondary)]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
              <button onClick={() => navigate('/opportunities')} className="mt-4 w-full text-center text-sm text-[var(--sp-accent)] hover:text-[var(--text-primary)] transition-colors font-medium">
                View all matches →
              </button>
            </div>

            {/* Skills */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Award size={18} className="text-[var(--sp-accent)]" />
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1.5 rounded-full bg-[var(--sp-accent)]/10 text-[var(--sp-accent)] text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Award size={18} className="text-[var(--sp-accent)]" />
                Certifications
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
                  { label: 'Sector Match', weight: 25, score: 95 },
                  { label: 'Functional Skill', weight: 25, score: 85 },
                  { label: 'Geo Relevance', weight: 15, score: 90 },
                  { label: 'Experience Prep', weight: 15, score: 70 },
                  { label: 'Intent Overlay', weight: 20, score: 80 }
                ].map((m, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                      <span>{m.label} ({m.weight}%)</span>
                      <span className="text-[var(--sp-accent)]">{m.score}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--sp-accent)] transition-all duration-1000" 
                        style={{ width: `${m.score}%`, opacity: m.weight / 25 }} 
                      />
                    </div>
                  </div>
                ))}
              </div>

              {profile.profileType === 'Standard (MVP)' && (
                <div className="mt-8 p-4 rounded-xl bg-[var(--sp-accent)]/10 border border-[var(--sp-accent)]/20">
                  <p className="text-[10px] text-[var(--sp-accent)] font-bold mb-2 uppercase flex items-center gap-1">
                    <Star size={10} /> Premium Unlock
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    Complete your Premium profile to unlock institutional matching and detailed skill indexing.
                  </p>
                  <button className="w-full sp-btn-primary py-2 text-xs">Upgrade to Premium</button>
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
