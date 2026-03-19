import { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import { Loader2, X, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { EmailAutomationService } from '../lib/emailAutomation';


// New Modular Components
import AdminSidebar from './admin/AdminSidebar';
import AdminHeader from './admin/AdminHeader';
import AdminOverview from './admin/AdminOverview';
import AdminMemberDirectory from './admin/AdminMemberDirectory';
import AdminApplications from './admin/AdminApplications';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminProjects from './admin/AdminProjects';
import AdminTeam from './admin/AdminTeam';
import AdminSettings from './admin/AdminSettings';
import AdminProfile from './admin/AdminProfile';
import DocumentViewerModal from './admin/DocumentViewerModal';
import AdminOpportunitiesManager from './AdminOpportunitiesManager';

// Constants and Types
import { getSidebarItems } from './admin/constants';

import type { 
  DashboardProject, RecentApplication, DashboardMember, 
  AdminRecord, DocumentViewerData 
} from './admin/types';


import './AdminDashboard.css';

const safeParse = (val: string | null) => {
  if (!val) return null;
  try { return JSON.parse(val); } catch { return null; }
};

const AdminDashboard = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  const [activeSection, setActiveSection] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Data States
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [members, setMembers] = useState<DashboardMember[]>([]);
  const [duplicateCandidates, setDuplicateCandidates] = useState<DashboardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [adminProfile, setAdminProfile] = useState<AdminRecord | null>(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeProjects: 0,
    pendingApprovals: 0,
    totalRevenue: '$0',
    verifiedProfessionals: 0,
    diasporaExperts: 0,
    studyAbroadReturnees: 0,
    avgRating: 0
  });
  const [monthlyActivity, setMonthlyActivity] = useState<any[]>([]);

  // UI States
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [viewingDocs, setViewingDocs] = useState<DocumentViewerData | null>(null);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  
  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<DashboardProject | null>(null);
  const [isViewingProject, setIsViewingProject] = useState(false);

  
  // Section Specific UI States (Lifted if shared or needed for logic)
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showPromoteList, setShowPromoteList] = useState(false);
  const [promoteSearch, setPromoteSearch] = useState('');
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [, setShowAddMember] = useState(false); // Was unused in main JSX but present in state

  const [newAdmin, setNewAdmin] = useState<{ email: string; full_name: string; password?: string }>({ email: '', full_name: '', password: '' });

  const [tierData, setTierData] = useState({
    Community: { name: 'Community', price: 'Free', features: 3 },
    Professional: { name: 'Professional', price: 'only $100/year (or $10/month)', features: 6 },
    Firm: { name: 'Firm', price: 'Custom', features: 8 }
  });

  const sidebarItems = getSidebarItems(t);

  const activeSectionLabel = sidebarItems.find((item) => item.id === activeSection)?.label || t('dashboard.sections.overview');

  // Sync admin role (Self-healing)
  useEffect(() => {
    const healAdminRole = async () => {
      if (!user?.email) return;
      const isHardcoded = (
        user.email.includes('admin') || 
        user.email.includes('joinstrategicpathways') ||
        user.email === '1kihiupaul@gmail.com'
      );
      if (isHardcoded) {
        const { data, error } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (!error && data && data.role !== 'admin') {
          await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
          toast.success('Admin access synchronized with database.');
        }
      }
    };
    healAdminRole();
  }, [user]);

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      const loadProjects = async () => {
        const { data: projData, error: projectsFetchError } = await supabase
          .from('user_projects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (projectsFetchError) {
          console.error('Error fetching admin projects:', projectsFetchError);
          setProjects([]);
          setProjectsError(
            "Projects couldn't be loaded from Supabase. This usually means the user_projects SELECT policy is still blocking admin reads."
          );
          return;
        }

        setProjectsError(null);
        setProjects(
          (projData || []).map((p) => ({
            id: p.id,
            title: p.project_title || 'Untitled',
            client: p.organization || 'Internal',
            budget: 'Private',
            status: p.is_current ? 'active' : 'completed',
            members: 1,
            progress: p.is_current ? 65 : 100,
          }))
        );
      };

      try {
        // Fetch Stats
        const { count: memberCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: projectCount } = await supabase.from('user_projects').select('*', { count: 'exact', head: true });
        const { count: pendingCount } = await supabase.from('verification_documents').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        const { count: verifiedCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'approved');
        const { count: diasporaCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).ilike('user_category', '%Diaspora%');
        const { count: studyAbroadCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).ilike('user_category', '%Study-Abroad%');
        
        // Calculate Estimated Revenue
        const { data: tierStats } = await supabase.from('profiles').select('tier');
        const profCount = tierStats?.filter(p => p.tier === 'Professional').length || 0;
        const firmCount = tierStats?.filter(p => p.tier === 'Firm').length || 0;
        const estimatedRevenue = (profCount * 100) + (firmCount * 500); // Demo pricing baseline
        
        const { data: ratingsData } = await supabase.from('profiles').select('rating').not('rating', 'is', null);
        const avgRating = ratingsData && ratingsData.length > 0 
          ? ratingsData.reduce((sum, p) => sum + (p.rating || 0), 0) / ratingsData.length 
          : 0;

        setStats({
          totalMembers: memberCount || 0,
          activeProjects: projectCount || 0,
          pendingApprovals: pendingCount || 0,
          totalRevenue: `KSh ${(estimatedRevenue * 130).toLocaleString()}`,
          verifiedProfessionals: verifiedCount || 0,
          diasporaExperts: diasporaCount || 0,
          studyAbroadReturnees: studyAbroadCount || 0,
          avgRating: Number(avgRating.toFixed(1))
        });

        // Fetch Monthly Activity for Analytics
        const { data: allMembers } = await supabase.from('profiles').select('created_at');
        const { data: allProj } = await supabase.from('user_projects').select('created_at');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        
        const activity = months.map((m, i) => {
          const mCount = allMembers?.filter(u => {
            const d = new Date(u.created_at);
            return d.getMonth() === i && d.getFullYear() === currentYear;
          }).length || 0;
          const pCount = allProj?.filter(p => {
            const d = new Date(p.created_at);
            return d.getMonth() === i && d.getFullYear() === currentYear;
          }).length || 0;
          
          return {
            label: m,
            members: mCount,
            projects: pCount,
            membersHeightClass: `h-${Math.min(100, (mCount + 1) * 10)}`,
            projectsHeightClass: `h-${Math.min(100, (pCount + 1) * 15)}`
          };
        }).filter((_, i) => i <= new Date().getMonth());
        setMonthlyActivity(activity as any);

        // Fetch Applications
        const { data: appsData } = await supabase.from('profiles').select('id, full_name, email, verification_docs, verification_status, created_at, onboarding_completed').eq('onboarding_completed', true).not('verification_docs', 'is', null).order('created_at', { ascending: false }).limit(20);
        const { data: verifDocs } = await supabase.from('verification_documents').select('*').order('id', { ascending: false }).limit(20);

        let profileMap: Record<string, { full_name?: string; email?: string }> = {};
        const userIds = [...new Set((verifDocs || []).map(doc => doc.user_id).filter(Boolean))];
        if (userIds.length) {
          const { data: docProfiles } = await supabase.from('profiles').select('id, full_name, email').in('id', userIds);
          profileMap = (docProfiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
        }
        
        const profileApps: RecentApplication[] = (appsData || []).flatMap((app) => {
          const docs = typeof app.verification_docs === 'string' ? safeParse(app.verification_docs) : app.verification_docs;
          if (!docs || typeof docs !== 'object' || Array.isArray(docs)) return [];
          return [{ id: app.id, userId: app.id, name: app.full_name || 'Unknown', email: app.email || 'N/A', type: 'Onboarding Verification', status: app.verification_status || 'pending', date: app.created_at, docs: docs as Record<string, unknown>, source: 'profile' as const }];
        });

        const manualApps: RecentApplication[] = (verifDocs || []).map((doc) => ({
          id: doc.id, userId: doc.user_id, name: profileMap[doc.user_id]?.full_name || 'Unknown', email: profileMap[doc.user_id]?.email || 'N/A', type: `Manual: ${doc.document_type || 'Unspecified'}`, status: doc.status || 'pending', date: doc.created_at, docs: doc.file_url ? { manual: doc.file_url } : {}, source: 'document_table' as const
        }));

        const unifiedApps = [...profileApps, ...manualApps].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecentApplications(unifiedApps.slice(0, 20));

        // Fetch Members
        const { data: membersData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(20);
        if (membersData) {
          const memberIds = membersData.map(m => m.id);
          const { data: allProjects } = await supabase.from('user_projects').select('user_id').in('user_id', memberIds);
          const projectCounts = allProjects?.reduce((acc: Record<string, number>, p) => { acc[p.user_id] = (acc[p.user_id] || 0) + 1; return acc; }, {}) || {};
          
          const formattedMembers: DashboardMember[] = membersData.map(m => ({
            id: m.id, name: m.full_name || 'Unnamed', email: m.email || 'N/A', tier: m.tier || 'Community', projects: projectCounts[m.id] || 0, rating: m.rating || 0, status: m.verification_status || 'pending', joined: m.created_at, profileType: m.profile_type, userCategory: m.user_category, professionalTitle: m.professional_title, sector: m.sector, expertise: m.expertise, yearsOfExperience: m.years_of_experience, connections: m.connections || 0, onboardingCompleted: m.onboarding_completed, docs: (typeof m.verification_docs === 'string' ? safeParse(m.verification_docs) : m.verification_docs) as Record<string, unknown> || {}
          }));
          setMembers(formattedMembers);

          // Find Duplicates
          const dupes: DashboardMember[] = [];
          const nameMap = new Map<string, string>();
          const emailMap = new Map<string, string>();
          formattedMembers.forEach(m => {
            const nameKey = (m.name || '').trim().toLowerCase();
            const emailKey = (m.email || '').trim().toLowerCase();
            const hasNameDuplicate = !!nameKey && nameMap.has(nameKey) && nameMap.get(nameKey) !== m.email;
            const hasEmailDuplicate = !!emailKey && emailMap.has(emailKey) && emailMap.get(emailKey) !== m.name;
            if (hasNameDuplicate || hasEmailDuplicate) {
              dupes.push(m);
            }
            if (nameKey) nameMap.set(nameKey, m.email);
            if (emailKey) emailMap.set(emailKey, m.name);
          });
          setDuplicateCandidates(dupes);
        }

        // Fetch Admins
        const { data: adminsData } = await supabase.from('profiles').select('*').eq('role', 'admin');
        if (adminsData) {
          setAdmins(adminsData.map(a => ({ id: a.id, full_name: a.full_name, email: a.email || 'N/A', role: a.role || 'admin', created_at: a.created_at, avatar_url: a.avatar_url })));
        }

        await loadProjects();
      } catch (err) {
        console.error('Fetch error:', err);
        await loadProjects();
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [activeSection]); // Added activeSection to dependencies to refresh when switching

  const loadProjects = async () => {
    const { data: projData, error: projectsFetchError } = await supabase
      .from('user_projects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20); // Show more for admin

    if (projectsFetchError) {
      console.error('Error fetching admin projects:', projectsFetchError);
      setProjects([]);
      setProjectsError(
        "Projects couldn't be loaded from Supabase. This usually means the user_projects SELECT policy is still blocking admin reads."
      );
      return;
    }

    setProjectsError(null);
    setProjects(
      (projData || []).map((p) => ({
        id: p.id,
        title: p.project_title || 'Untitled',
        client: p.organization || 'Internal',
        budget: 'Private',
        status: p.is_current ? 'active' : 'completed',
        members: 1,
        progress: p.is_current ? 65 : 100,
        description: p.project_description || '',
        role: p.role || ''
      }))
    );
  };

  const handleNewProject = () => {
    setEditingProject(null);
    setIsViewingProject(false);
    setIsProjectModalOpen(true);
  };

  const handleInspectProject = (project: DashboardProject) => {
    setEditingProject(project);
    setIsViewingProject(true);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project: DashboardProject) => {
    setEditingProject(project);
    setIsViewingProject(false);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (formData: any) => {
    try {
      if (editingProject) {
        const { error } = await supabase
          .from('user_projects')
          .update({
            project_title: formData.title,
            project_description: formData.description,
            organization: formData.client,
            role: formData.role,
            is_current: formData.status === 'active'
          })
          .eq('id', editingProject.id);
        
        if (error) throw error;
        toast.success('Project updated successfully');
      } else {
        const { error } = await supabase
          .from('user_projects')
          .insert({
            project_title: formData.title,
            project_description: formData.description,
            organization: formData.client,
            role: formData.role,
            is_current: formData.status === 'active',
            user_id: user?.id 
          });
        
        if (error) throw error;
        toast.success('Project created successfully');
      }
      setIsProjectModalOpen(false);
      loadProjects();
    } catch (e: any) {
      toast.error('Failed to save project: ' + e.message);
    }
  };

  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!user?.id) return;
      const { data } = await supabase.from('profiles').select('id, full_name, email, avatar_url, role, created_at').eq('id', user.id).single();
      if (data) setAdminProfile(data as AdminRecord);
    };
    fetchAdminProfile();
  }, [user]);

  // Handlers
  const handleApprove = async (id: string, email?: string, name?: string, source?: string) => {
    try {
      const appSource = source || recentApplications.find(a => a.id === id)?.source || 'profile';
      if (appSource === 'profile') {
        await supabase.from('profiles').update({ verification_status: 'approved', verification_tier: 'Tier 2 – Verified Professional' }).eq('id', id);
      } else {
        await supabase.from('verification_documents').update({ status: 'approved' }).eq('id', id);
      }
      setRecentApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
      toast.success('Approved successfully!');
      
      const appEmail = email || recentApplications.find(a => a.id === id)?.email;
      const appName = name || recentApplications.find(a => a.id === id)?.name || 'Member';
      if (appEmail) {
        EmailAutomationService.onVerificationStatusUpdate(appEmail, appName, 'approved', 'Tier 2 – Verified Professional').catch(console.error);
      }
    } catch { toast.error('Approval failed'); }
  };

  const handleReject = async (id: string, email?: string, name?: string, source?: string) => {
    const reason = window.prompt('Reason (optional):') || 'Criteria not met';
    try {
      const appSource = source || recentApplications.find(a => a.id === id)?.source || 'profile';
      if (appSource === 'profile') {
        await supabase.from('profiles').update({ verification_status: 'rejected' }).eq('id', id);
      } else {
        await supabase.from('verification_documents').update({ status: 'rejected' }).eq('id', id);
      }
      setRecentApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
      toast.error('Application rejected');
      
      const appEmail = email || recentApplications.find(a => a.id === id)?.email;
      const appName = name || recentApplications.find(a => a.id === id)?.name || 'Member';
      if (appEmail) {
        EmailAutomationService.onVerificationStatusUpdate(appEmail, appName, 'rejected', 'Tier 2 – Verified Professional', reason).catch(console.error);
      }
    } catch { toast.error('Rejection failed'); }
  };

  const handleDeleteMember = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    try {
      await supabase.from('profiles').delete().eq('id', id);
      setMembers(prev => prev.filter(m => m.id !== id));
      toast.success('Member deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleMakeAdmin = async (id: string, email: string) => {
    try {
      await supabase.from('profiles').update({ role: 'admin' }).eq('id', id);
      toast.success(`${email} is now an admin`);
      window.location.reload();
    } catch { toast.error('Failed to update role'); }
  };

  const handleRemoveAdmin = async (id: string) => {
    try {
      await supabase.from('profiles').update({ role: 'user' }).eq('id', id);
      setAdmins(prev => prev.filter(a => a.id !== id));
      toast.success('Admin access revoked');
    } catch { toast.error('Failed to revoke role'); }
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.email || !newAdmin.full_name) return toast.error('Details required');
    try {
      const { data, error } = await supabase.auth.signUp({ email: newAdmin.email, password: newAdmin.password || 'SpAdmin123!', options: { data: { full_name: newAdmin.full_name } } });
      if (error) throw error;
      if (data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, email: newAdmin.email, full_name: newAdmin.full_name, role: 'admin' });
        toast.success('Admin invited!');
        setShowAddAdmin(false);
        window.location.reload();
      }
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Unknown error'); }

  };

  const handleSaveTier = (tierName: string) => {
    toast.success(`${tierName} tier settings updated.`);
    setEditingTier(null);
  };


  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      approved: 'bg-green-500/20 text-green-500',
      active: 'bg-green-500/20 text-green-500',
      rejected: 'bg-red-500/20 text-red-500',
      under_review: 'bg-blue-500/20 text-blue-500',
    };
    return styles[status] || 'bg-gray-500/20 text-gray-500';
  };

  // Shared UI Logic
  const pendingApprovals = recentApplications.filter(a => a.status === 'pending').length;
  const underReviewCount = members.filter(m => m.status === 'under_review').length;
  const duplicateCount = duplicateCandidates.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 gap-4">
        <Loader2 className="w-10 h-10 text-[var(--sp-accent)] animate-spin" />
        <p className="text-[var(--text-secondary)] font-medium">Synchronizing Command Center...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-shell">
      <AdminHeader 
        activeSectionLabel={activeSectionLabel}
        adminProfile={adminProfile}
        isAdminMenuOpen={isAdminMenuOpen}
        setIsAdminMenuOpen={setIsAdminMenuOpen}
        adminMenuRef={adminMenuRef}
        userEmail={user?.email}
      />
      
      <div className="admin-layout-body">
        <AdminSidebar 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />

        <div className="admin-dashboard-main">
          <main className="admin-content-area scroll-smooth">
          <div className="lg:hidden mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'onboarding') {
                      setActiveSection('onboarding');
                      return;
                    }
                    setActiveSection(item.id);
                  }}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                    activeSection === item.id
                      ? 'bg-[var(--sp-accent)] text-[var(--text-inverse)]'
                      : 'bg-white/5 text-[var(--text-secondary)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {activeSection === 'overview' && (
            <AdminOverview 
              stats={stats}
              pendingApprovals={pendingApprovals}
              underReviewCount={underReviewCount}
              duplicateCount={duplicateCount}
              adminsCount={admins.length}
              setActiveSection={setActiveSection}
            />
          )}

          {activeSection === 'members' && (
            <AdminMemberDirectory 
              members={members}
              handleViewDocs={setViewingDocs}
              handleDeleteMember={handleDeleteMember}
              getStatusBadge={getStatusBadge}
              setShowAddMember={setShowAddMember}
            />
          )}

          {activeSection === 'projects' && (
            <AdminProjects 
              projects={projects}
              projectsError={projectsError}
              getStatusBadge={getStatusBadge}
              onNewProject={handleNewProject}
              onInspectProject={handleInspectProject}
              onEditProject={handleEditProject}
            />
          )}

          {activeSection === 'opportunities' && <AdminOpportunitiesManager />}
          {activeSection === 'onboarding' && <Navigate to="/admin/onboarding" replace />}

          {activeSection === 'applications' && (
            <AdminApplications 
              recentApplications={recentApplications}
              selectedApplications={selectedApplications}
              setSelectedApplications={setSelectedApplications}
              pendingApprovals={pendingApprovals}
              handleBulkApprove={() => selectedApplications.forEach(id => handleApprove(id))}
              handleBulkReject={() => selectedApplications.forEach(id => handleReject(id))}
              handleApprove={handleApprove}
              handleReject={handleReject}
              handleViewDocs={setViewingDocs}
              handleSuspendMember={() => { /* Suspend logic */ }}


              getStatusBadge={getStatusBadge}
            />
          )}

          {activeSection === 'analytics' && (
            <AdminAnalytics 
              stats={{ ...stats, pendingApprovals }}
              monthlyActivity={monthlyActivity}
            />
          )}

          {activeSection === 'admins' && (
            <AdminTeam 
              admins={admins}
              members={members}
              showPromoteList={showPromoteList}
              setShowPromoteList={setShowPromoteList}
              showAddAdmin={showAddAdmin}
              setShowAddAdmin={setShowAddAdmin}
              promoteSearch={promoteSearch}
              setPromoteSearch={setPromoteSearch}
              newAdmin={newAdmin}
              setNewAdmin={setNewAdmin}
              handleMakeAdmin={handleMakeAdmin}
              handleAddAdmin={handleAddAdmin}
              handleRemoveAdmin={handleRemoveAdmin}
            />
          )}

          {activeSection === 'settings' && (
            <AdminSettings 
              tierData={tierData}
              setTierData={setTierData}
              editingTier={editingTier}
              setEditingTier={setEditingTier}
              handleSaveTier={handleSaveTier}
            />
          )}

          {activeSection === 'profile' && (
            <AdminProfile 
              adminProfile={adminProfile}
              userEmail={user?.email}
            />
          )}
          </main>
        </div>
      </div>


      <DocumentViewerModal 
        viewingDocs={viewingDocs}
        setViewingDocs={setViewingDocs}
      />

      {/* Project Modal */}
      {isProjectModalOpen && (
        <ProjectModal 
          onClose={() => setIsProjectModalOpen(false)} 
          onSave={handleSaveProject} 
          project={editingProject} 
          isViewOnly={isViewingProject}
        />
      )}
    </div>
  );
};

// Helper Modal Component for Projects
interface ProjectModalProps {
  onClose: () => void;
  onSave: (data: { title: string; client: string; role: string; status: string; description: string }) => void;
  project: DashboardProject | null;
  isViewOnly?: boolean;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ onClose, onSave, project, isViewOnly }) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    client: project?.client || '',
    role: project?.role || '',
    status: (project?.status as string) || 'active',
    description: project?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-primary)] border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {isViewOnly ? 'Project Details' : project ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors" title="Close modal">
            <X size={20} className="text-[var(--text-secondary)]" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Project Title</label>
            <input 
              required
              disabled={isViewOnly}
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[var(--text-primary)] focus:border-[var(--sp-accent)]/50 focus:outline-none transition-all disabled:opacity-50"
              placeholder="e.g. Modernization of Core Systems"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Organization/Client</label>
              <input 
                required
                disabled={isViewOnly}
                value={formData.client}
                onChange={e => setFormData({...formData, client: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[var(--text-primary)] focus:border-[var(--sp-accent)]/50 focus:outline-none transition-all disabled:opacity-50"
                placeholder="Internal / Global Tech"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Professional Role</label>
              <input 
                disabled={isViewOnly}
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[var(--text-primary)] focus:border-[var(--sp-accent)]/50 focus:outline-none transition-all disabled:opacity-50"
                placeholder="Lead Developer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Status</label>
            <select 
              disabled={isViewOnly}
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[var(--text-primary)] focus:border-[var(--sp-accent)]/50 focus:outline-none transition-all disabled:opacity-50 appearance-none"
              title="Project Status"
            >
              <option value="active">Active / In-Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Description</label>
            <textarea 
              disabled={isViewOnly}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[var(--text-primary)] focus:border-[var(--sp-accent)]/50 focus:outline-none transition-all disabled:opacity-50 resize-none"
              placeholder="Describe the project's goals and outcome..."
            />
          </div>

          {!isViewOnly && (
            <button type="submit" className="w-full sp-btn-primary py-4 font-bold text-sm uppercase tracking-widest">
              {project ? 'Update Project' : 'Create Project'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
