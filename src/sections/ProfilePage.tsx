import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, 
  Edit2, Camera, Linkedin, Twitter, Globe, Award, FileText,
  CheckCircle, Clock, Star, Upload, Trash2, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [profile, setProfile] = useState({
    name: 'John Kamau',
    title: 'Policy Analyst & Development Consultant',
    email: 'john.kamau@email.com',
    phone: '+254 712 345 678',
    location: 'Nairobi, Kenya',
    bio: 'Study-abroad returnee with expertise in public policy and international development. Passionate about driving sustainable change in Kenya through evidence-based policy recommendations.',
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
    projects: 12,
    connections: 248,
    rating: 4.9,
    memberSince: 'March 2024',
    tier: 'Professional'
  });

  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully!');
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
      // Note: In production, we would use the authenticated user's ID
      // const { data: { user } } = await supabase.auth.getUser();
      // const filePath = `${user.id}/${Date.now()}_${file.name}`;
      
      const filePath = `demo_user/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (error) throw error;
      
      toast.success('Document uploaded successfully!');
    } catch (error: any) {
      toast.error('Failed to upload document: ' + error.message);
    } finally {
      setIsUploadingFile(false);
      // Reset input
      e.target.value = '';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'activity', label: 'Activity', icon: Clock },
  ];

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
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full profile-avatar flex items-center justify-center overflow-hidden">
                <User size={64} className="text-[var(--sp-accent)]" />
              </div>
              <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[var(--sp-accent)] flex items-center justify-center text-[var(--text-inverse)] hover:bg-[#D4B76E] transition-colors">
                <Camera size={18} />
              </button>
            </div>

            {/* Info Section */}
            <div className="flex-grow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">{profile.name}</h1>
                    <span className="px-3 py-1 rounded-full bg-[var(--sp-accent)]/20 text-[var(--sp-accent)] text-xs font-medium flex items-center gap-1">
                      <CheckCircle size={12} />
                      Verified
                    </span>
                  </div>
                  <p className="text-[var(--sp-accent)] text-lg mb-2">{profile.title}</p>
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
                           <Phone size={14} className="shrink-0" />
                           <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="input-glass py-1 px-2 text-sm w-full lg:w-48" />
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
                          <Phone size={14} />
                          {profile.phone}
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
                  {['CV_2024.pdf', 'Certification_PMP.pdf', 'Portfolio_Summary.pdf'].map((doc, i) => (
                    <div key={i} className="glass-light rounded-xl p-4 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                          <FileText size={18} className="text-red-400" />
                        </div>
                        <div>
                          <p className="text-[var(--text-primary)] font-medium">{doc}</p>
                          <p className="text-[var(--text-secondary)] text-xs">2.4 MB • Uploaded Jan 2024</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="sp-btn-glass text-sm">Download</button>
                        <button className="p-2 text-[var(--text-secondary)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 rounded-lg hover:bg-red-500/10">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
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
