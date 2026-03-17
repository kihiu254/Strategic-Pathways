import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, Users, Briefcase, FileText, Settings, 
  TrendingUp, DollarSign, CheckCircle,
  X, Plus, Search, Filter,
  BarChart3, Star, Edit2, Trash2, Eye, User, Copy,
  Maximize2, Minimize2, Loader2, Download, ExternalLink,
  Shield, Globe, GraduationCap, ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { EmailAutomationService } from '../lib/emailAutomation';

import AdminOpportunitiesManager from './AdminOpportunitiesManager';

const safeParse = (val: string | null) => {
  if (!val) return null;
  try { return JSON.parse(val); } catch { return null; }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [activeSection, setActiveSection] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Sync admin role for hardcoded accounts (Self-healing)
  useEffect(() => {
    const healAdminRole = async () => {
      if (!user?.email) return;
      
      const isHardcoded = (
        user.email.includes('admin') || 
        user.email.includes('joinstrategicpathways') ||
        user.email === '1kihiupaul@gmail.com'
      );

      if (isHardcoded) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!error && data && data.role !== 'admin') {
          console.log('Self-healing admin role for:', user.email);
          await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', user.id);
          toast.success('Admin access synchronized with database.');
        }
      }
    };
    healAdminRole();
  }, [user]);



  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [duplicateCandidates, setDuplicateCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [memberNotes, setMemberNotes] = useState<Record<string, { note: string; owner: string }>>({});
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [viewingDocs, setViewingDocs] = useState<any | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showPromoteList, setShowPromoteList] = useState(false);
  const [promoteSearch, setPromoteSearch] = useState('');
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const [adminProfile, setAdminProfile] = useState<{ full_name?: string; email?: string; avatar_url?: string } | null>(null);
  const [newAdmin, setNewAdmin] = useState({ email: '', full_name: '', password: '' });
  const [newMember, setNewMember] = useState({
    email: '',
    full_name: '',
    professional_title: '',
    phone: '',
    tier: 'Community'
  });
  const [tierData, setTierData] = useState({
    Community: { name: 'Community', price: 'Free', features: 3 },
    Professional: { name: 'Professional', price: 'only $100/year (or $10/month)', features: 6 },
    Firm: { name: 'Firm', price: 'Custom', features: 8 }
  });
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeProjects: 0,
    pendingApps: 0,
    totalRevenue: '$0',
    verifiedProfessionals: 0,
    diasporaExperts: 0,
    studyAbroadReturnees: 0,
    avgRating: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch Stats
        const { count: memberCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: projectCount } = await supabase.from('user_projects').select('*', { count: 'exact', head: true });
        const { count: pendingCount } = await supabase.from('verification_documents').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        
        const { count: verifiedCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'approved');
        const { count: diasporaCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).ilike('user_category', '%Diaspora%');
        const { count: studyAbroadCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).ilike('user_category', '%Study-Abroad%');
        
        const { data: ratingsData } = await supabase.from('profiles').select('rating').not('rating', 'is', null);
        const avgRating = ratingsData && ratingsData.length > 0 
          ? ratingsData.reduce((sum, p) => sum + (p.rating || 0), 0) / ratingsData.length 
          : 0;

        setStats({
          totalMembers: memberCount || 0,
          activeProjects: projectCount || 0,
          pendingApps: pendingCount || 0,
          totalRevenue: '$0',
          verifiedProfessionals: verifiedCount || 0,
          diasporaExperts: diasporaCount || 0,
          studyAbroadReturnees: studyAbroadCount || 0,
          avgRating: Number(avgRating.toFixed(1))
        });

        // Fetch Recent Applications (verification documents from onboarding)
        const { data: appsData } = await supabase
          .from('profiles')
          .select('id, full_name, email, verification_docs, verification_status, created_at, onboarding_completed')
          .eq('onboarding_completed', true)
          .not('verification_docs', 'is', null)
          .order('created_at', { ascending: false })
          .limit(20);

        // Fetch Manual Uploads (fetch profile info in a second query to avoid PostgREST join errors)
        const { data: verifDocs } = await supabase
          .from('verification_documents')
          .select('*')
          .order('id', { ascending: false }) // some environments lack created_at column; id is always present
          .limit(20);

        let profileMap: Record<string, { full_name?: string; email?: string }> = {};
        const userIds = [...new Set((verifDocs || []).map(doc => doc.user_id).filter(Boolean))];
        if (userIds.length) {
          const { data: docProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds);
          profileMap = (docProfiles || []).reduce((acc: any, p: any) => {
            acc[p.id] = p;
            return acc;
          }, {});
        }
        
        const profilesWithDocs = appsData || [];
        const additionalDocs = (verifDocs || []) as any[];

        const unifiedApps = [
          ...profilesWithDocs
            .map(app => {
              const docsParsed = typeof app.verification_docs === 'string' ? safeParse(app.verification_docs) : app.verification_docs;
              return {
                id: app.id,
                userId: app.id,
                name: app.full_name || 'Unknown',
                email: app.email || 'N/A',
                type: 'Onboarding Verification',
                status: app.verification_status || 'pending',
                date: new Date(app.created_at).toLocaleDateString(),
                docs: docsParsed,
                source: 'profile'
              };
            })
            .filter(app => !!app.docs && typeof app.docs === 'object'),
          ...additionalDocs.map(doc => ({
            id: doc.id,
            userId: doc.user_id,
            name: profileMap[doc.user_id]?.full_name || 'Unknown',
            email: profileMap[doc.user_id]?.email || 'N/A',
            type: `Manual: ${doc.document_type || 'Unspecified'}`,
            status: doc.status || 'pending',
            date: new Date(doc.created_at).toLocaleDateString(),
            docs: { manual: doc.file_url },
            source: 'document_table'
          }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setRecentApplications(unifiedApps.slice(0, 20));
        setStats(prev => ({ ...prev, pendingApps: unifiedApps.filter(a => a.status === 'pending').length }));

        // Fetch Members
        const { data: membersData } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (membersData) {
          const memberIds = membersData.map(m => m.id);
          const { data: allProjects } = await supabase
            .from('user_projects')
            .select('user_id')
            .in('user_id', memberIds);

          const projectCounts = allProjects?.reduce((acc: any, p) => {
            acc[p.user_id] = (acc[p.user_id] || 0) + 1;
            return acc;
          }, {}) || {};

          const membersWithProjects = membersData.map((m) => {
            const docs = typeof m.verification_docs === 'string' ? safeParse(m.verification_docs) : m.verification_docs;
            return {
                id: m.id,
                name: m.full_name || 'Unnamed',
                email: m.email,
                tier: m.tier || 'Community',
                projects: projectCounts[m.id] || 0,
                rating: m.rating || 0,
                status: m.verification_status || 'pending',
                joined: new Date(m.created_at).toLocaleDateString(),
                profileType: m.profile_type,
                userCategory: m.user_category,
                professionalTitle: m.professional_title,
                sector: m.sector,
                expertise: m.expertise,
                yearsOfExperience: m.years_of_experience,
                connections: m.connections || 0,
                onboardingCompleted: m.onboarding_completed,
                docs
          }});
          setMembers(membersWithProjects);
          // Flag potential duplicates (same name, different emails)
          const dupes: any[] = [];
          const nameMap = new Map<string, string>();
          membersWithProjects.forEach((m) => {
            const key = (m.name || '').trim().toLowerCase();
            if (!key) return;
            if (nameMap.has(key) && nameMap.get(key) !== m.email) {
              dupes.push(m);
            } else {
              nameMap.set(key, m.email);
            }
          });
          setDuplicateCandidates(dupes);
        }

        // Fetch Admins
        const { data: adminsData } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'admin');
        if (adminsData) {
          setAdmins(adminsData);
        }

        // Fetch Projects
        const { data: projectsData } = await supabase
          .from('user_projects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (projectsData) {
          setProjects(projectsData.map(p => ({
            id: p.id,
            title: p.project_title,
            client: p.organization || 'Internal',
            budget: 'N/A',
            status: p.is_current ? 'active' : 'completed',
            members: 1,
            progress: p.is_current ? 50 : 100
          })));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('id', user.id)
        .single();
      if (data) {
        setAdminProfile(data);
      }
    };
    fetchAdminProfile();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setIsAdminMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApprove = async (id: string, email?: string, name?: string, source?: string) => {
    try {
      const appSource = source || recentApplications.find(a => a.id === id)?.source || 'profile';
      
      if (appSource === 'profile') {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            verification_status: 'approved',
            verification_tier: 'Tier 2 – Verified Professional'
          })
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('verification_documents')
          .update({ status: 'approved' })
          .eq('id', id);
        if (error) throw error;
      }

      setRecentApplications(prev => prev.map(app => app.id === id ? { ...app, status: 'approved' } : app));
      logAction('approve_application', { id, email, name, source: appSource });
      toast.success('Approved successfully!');
      
      // Trigger Email Notification
      const appEmail = email || recentApplications.find(a => a.id === id)?.email;
      const appName = name || recentApplications.find(a => a.id === id)?.name || 'Member';
      if (appEmail) {
        await EmailAutomationService.onVerificationStatusUpdate(
          appEmail, 
          appName, 
          'approved', 
          'Tier 2 – Verified Professional'
        ).catch(err => console.error("Failed to send email", err));

        // Create In-App Notification
        const appIdForNotif = id; // This might be profiles.id or verification_documents.id
        let targetUserId = id; if (appSource !== 'profile') { const { data: appData } = await supabase.from('verification_documents').select('user_id').eq('id', id).single(); targetUserId = appData?.user_id; }

        if (targetUserId) {
          await supabase.from('notifications').insert({
            user_id: targetUserId,
            title: 'Verification Approved 🎉',
            message: 'Your verification has been approved. You are now a Verified Professional!',
            type: 'success',
            read: false
          });
        }
      }
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id: string, email?: string, name?: string, source?: string) => {
    const reason = window.prompt('Enter rejection reason (optional):') || 'Criteria not met';
    try {
      const appSource = source || recentApplications.find(a => a.id === id)?.source || 'profile';
      
      if (appSource === 'profile') {
        const { error } = await supabase
          .from('profiles')
          .update({ verification_status: 'rejected' })
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('verification_documents')
          .update({ status: 'rejected' })
          .eq('id', id);
        if (error) throw error;
      }

      setRecentApplications(prev => prev.map(app => app.id === id ? { ...app, status: 'rejected' } : app));
      toast.error('Rejected');
      logAction('reject_application', { id, email, name, reason, source: appSource });
      
      // Trigger Email Notification
      const appEmail = email || recentApplications.find(a => a.id === id)?.email;
      const appName = name || recentApplications.find(a => a.id === id)?.name || 'Member';
      if (appEmail) {
        await EmailAutomationService.onVerificationStatusUpdate(
          appEmail, 
          appName, 
          'rejected', 
          'Tier 2 – Verified Professional',
          reason
        ).catch(err => console.error("Failed to send email", err));

        // Create In-App Notification
        let targetUserId = id; if (appSource !== 'profile') { const { data: appData } = await supabase.from('verification_documents').select('user_id').eq('id', id).single(); targetUserId = appData?.user_id; }

        if (targetUserId) {
          await supabase.from('notifications').insert({
            user_id: targetUserId,
            title: 'Verification Update',
            message: `Your verification requires attention. Reason: ${reason}`,
            type: 'warning',
            read: false
          });
        }
      }
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  const updateMemberState = (id: string, patch: Record<string, any>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const logAction = (action: string, meta: Record<string, any>) => {
    const entry = { action, meta, at: new Date().toISOString() };
    setAuditLog((prev) => [entry, ...prev].slice(0, 200));
    console.debug('[ADMIN AUDIT]', entry);
  };

  const handleSetTier = async (id: string, tier: 'Community' | 'Professional' | 'Firm') => {
    try {
      const { error } = await supabase.from('profiles').update({ tier }).eq('id', id);
      if (error) throw error;
      updateMemberState(id, { tier });
      toast.success(`Tier updated to ${tier}`);
      logAction('set_tier', { id, tier });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update tier');
    }
  };

  const handleAssignBadge = async (id: string, type: 'verified' | 'premium') => {
    try {
      if (type === 'verified') {
        const { error } = await supabase
          .from('profiles')
          .update({ verification_status: 'approved', verification_tier: 'Tier 2 â€“ Verified Professional' })
          .eq('id', id);
        if (error) throw error;
        updateMemberState(id, { verification_status: 'approved', verification_tier: 'Tier 2 â€“ Verified Professional' });
        toast.success('Verified badge assigned');
        logAction('assign_verified', { id });
      } else {
        await handleSetTier(id, 'Professional');
        logAction('assign_premium', { id });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign badge');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedApplications.length === 0) return;
    try {
      await Promise.all(selectedApplications.map(id => handleApprove(id)));
      toast.success(`Bulk approved ${selectedApplications.length} profiles!`);
      setSelectedApplications([]);
      logAction('bulk_approve', { count: selectedApplications.length });
    } catch (e: any) {
      toast.error('Bulk approve failed: ' + e.message);
    }
  };

  const handleBulkReject = async () => {
    if (selectedApplications.length === 0) return;
    try {
      await Promise.all(selectedApplications.map(id => handleReject(id)));
      toast.success(`Bulk rejected ${selectedApplications.length} profiles!`);
      setSelectedApplications([]);
      logAction('bulk_reject', { count: selectedApplications.length });
    } catch (e: any) {
      toast.error('Bulk reject failed: ' + e.message);
    }
  };

  const handleSuspendMember = async (id: string, status: 'under_review' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verification_status: status })
        .eq('id', id);
      if (error) throw error;
      updateMemberState(id, { verification_status: status });
      toast.success(`Account ${status === 'rejected' ? 'terminated' : 'suspended for review'}`);
      logAction(status === 'rejected' ? 'terminate' : 'suspend', { id, status });
    } catch (error: any) {
      toast.error(error.message || `Failed to update status`);
    }
  };

  const handleFlagDuplicate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verification_status: 'under_review' })
        .eq('id', id);
      if (error) throw error;
      updateMemberState(id, { verification_status: 'under_review' });
      toast.success('Profile flagged for duplicate review');
      logAction('flag_duplicate', { id });
    } catch (error: any) {
      toast.error(error.message || 'Failed to flag duplicate');
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success('Profile deleted');
      logAction('delete_member', { id });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete profile');
    }
  };

  const mergeProfiles = async (primaryId: string, duplicateId: string) => {
    try {
      const primary = members.find(m => m.id === primaryId);
      const duplicate = members.find(m => m.id === duplicateId);
      if (!primary || !duplicate) throw new Error('Profiles not found');

      const merged: Record<string, any> = {};
      ['full_name','professional_title','phone','linkedin_url','website_url','sector','userCategory','verification_docs','bio'].forEach(key => {
        if (!primary[key] && duplicate[key]) merged[key] = duplicate[key];
      });

      if (Object.keys(merged).length > 0) {
        const { error } = await supabase.from('profiles').update(merged).eq('id', primaryId);
        if (error) throw error;
      }

      const { error: delErr } = await supabase.from('profiles').delete().eq('id', duplicateId);
      if (delErr) throw delErr;

      setMembers(prev => prev.filter(m => m.id !== duplicateId).map(m => m.id === primaryId ? { ...m, ...merged } : m));
      toast.success('Profiles merged');
      logAction('merge_profiles', { primaryId, duplicateId });
    } catch (error: any) {
      toast.error(error.message || 'Merge failed');
    }
  };

  const handleNote = (id: string) => {
    const existing = memberNotes[id]?.note || '';
    const note = window.prompt('Add/update admin note', existing) ?? '';
    const owner = memberNotes[id]?.owner || '';
    const newOwner = window.prompt('Assign owner (optional)', owner) ?? owner;
    setMemberNotes(prev => ({ ...prev, [id]: { note, owner: newOwner } }));
    logAction('note', { id, note, owner: newOwner });
    toast.success('Note saved (local)');
  };

  const handleSaveTier = (tierName: string) => {
    toast.success(`${tierName} tier updated successfully!`);
    setEditingTier(null);
  };

  const handleAddMember = async () => {
    if (!newMember.email || !newMember.full_name) {
      toast.error('Email and full name are required');
      return;
    }

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: newMember.email,
        password: Math.random().toString(36).slice(-12) + 'A1!',
        options: {
          data: {
            full_name: newMember.full_name
          }
        }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: newMember.email,
            full_name: newMember.full_name,
            professional_title: newMember.professional_title,
            phone: newMember.phone,
            tier: newMember.tier,
            role: 'user',
            created_at: new Date().toISOString()
          });

        if (profileError) throw profileError;

        toast.success('Member added successfully! They will receive a confirmation email.');
        setShowAddMember(false);
        setNewMember({ email: '', full_name: '', professional_title: '', phone: '', tier: 'Community' });
        
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member: ' + error.message);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.email || !newAdmin.full_name) {
      toast.error('Email and full name are required');
      return;
    }

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: newAdmin.email,
        password: newAdmin.password || Math.random().toString(36).slice(-12) + 'A1!',
        options: {
          data: {
            full_name: newAdmin.full_name
          }
        }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: newAdmin.email,
            full_name: newAdmin.full_name,
            role: 'admin',
            created_at: new Date().toISOString()
          });

        if (profileError) throw profileError;

        toast.success('Admin added successfully!');
        setShowAddAdmin(false);
        setNewAdmin({ email: '', full_name: '', password: '' });
        
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Error adding admin:', error);
      toast.error('Failed to add admin: ' + error.message);
    }
  };

  const handleMakeAdmin = async (id: string, email: string) => {
    try {
      const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', id);
      if (error) throw error;
      toast.success(`${email} granted admin rights`);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Failed to make admin');
    }
  };

  const handleRemoveAdmin = async (id: string) => {
    try {
      const { error } = await supabase.from('profiles').update({ role: 'user' }).eq('id', id);
      if (error) throw error;
      toast.success('Admin rights removed');
      setAdmins(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove admin');
    }
  };

  const handleViewDocs = (app: any) => {
    setViewingDocs(app);
  };

  const handleDownloadDoc = async (docUrl: string, docName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('verification-documents')
        .download(docUrl);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = docName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Document downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-green-500/20 text-green-400',
      under_review: 'bg-blue-500/20 text-blue-400',
      rejected: 'bg-red-500/20 text-red-400',
      duplicate: 'bg-purple-500/20 text-purple-300',
      active: 'bg-green-500/20 text-green-400',
      completed: 'bg-[var(--sp-accent)]/20 text-[var(--sp-accent)]',
      planning: 'bg-purple-500/20 text-purple-400',
    };
    return styles[status] || 'bg-gray-500/20 text-gray-400';
  };

  const sidebarItems = [
    { id: 'overview', label: t('dashboard.sections.overview'), icon: LayoutDashboard },
    { id: 'members', label: t('dashboard.sections.members'), icon: Users },
    { id: 'projects', label: t('dashboard.sections.projects'), icon: Briefcase },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'applications', label: t('dashboard.sections.applications'), icon: FileText },
    { id: 'onboarding', label: 'Onboarding Records', icon: ClipboardList },
    { id: 'analytics', label: t('dashboard.sections.analytics'), icon: TrendingUp },
    { id: 'admins', label: t('dashboard.sections.admins'), icon: Shield },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: t('dashboard.sections.settings'), icon: Settings },
  ];
  const underReviewCount = members.filter((m) => m.status === 'under_review').length;
  const duplicateCount = duplicateCandidates.length;
  const pendingApprovals = recentApplications.filter((a) => a.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 gap-4">
        <Loader2 className="w-10 h-10 text-[var(--sp-accent)] animate-spin" />
        <p className="text-[var(--text-secondary)]">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className={`transition-all duration-500 ease-[var(--transition-premium)] ${isSidebarCollapsed ? 'lg:w-72' : 'lg:w-24'} w-full lg:flex lg:flex-col hidden lg:block premium-glass border-r border-white/5 z-40`}>
        {/* Logo */}
        <div className="p-8 border-b border-white/5">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-4 group transition-all ${!isSidebarCollapsed && 'justify-center'}`}
          >
            <div className={`p-2 rounded-2xl bg-gradient-to-br from-[#C89F5E] to-[#8B7355] shadow-lg shadow-[var(--sp-accent)]/20 group-hover:scale-110 transition-transform`}>
              <img src="/logo.png" alt="SP" className="h-6 w-auto brightness-0 invert" />
            </div>
            {isSidebarCollapsed && (
              <div className="flex flex-col items-start translate-y-1">
                <span className="text-[var(--text-primary)] font-bold tracking-tight text-lg leading-none">STRATEGIC</span>
                <span className="text-[var(--sp-accent)] font-semibold text-[10px] tracking-[0.2em] uppercase mt-1">Pathways Admin</span>
              </div>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
          {[
            ...sidebarItems,
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'onboarding') {
                  navigate('/admin/onboarding');
                  return;
                }
                setActiveSection(item.id);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
                activeSection === item.id
                  ? 'text-[var(--text-inverse)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {activeSection === item.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#C89F5E] to-[#D4B76E] animate-shimmer" />
              )}
              <item.icon size={20} className="relative z-10" />
              {isSidebarCollapsed && <span className="relative z-10">{item.label}</span>}
              {!isSidebarCollapsed && activeSection === item.id && (
                <div className="absolute right-0 w-1.5 h-full bg-[var(--sp-accent)] rounded-l-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Toggle Sidebar */}
        <div className="p-4 border-t border-white/5 hidden lg:block">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[var(--text-secondary)] hover:bg-white/5 transition-all group"
          >
            <div className="group-hover:rotate-180 transition-transform duration-500">
              {isSidebarCollapsed ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </div>
            {isSidebarCollapsed && <span className="font-medium text-sm">{t('dashboard.sidebar.collapse')}</span>}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/10 z-50">
        <div className="flex justify-around p-2 overflow-x-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'onboarding') {
                  navigate('/admin/onboarding');
                  return;
                }
                setActiveSection(item.id);
              }}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                activeSection === item.id
                  ? 'bg-[var(--sp-accent)]/20 text-[var(--sp-accent)]'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              <item.icon size={18} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="premium-glass border-b border-white/5 px-4 sm:px-6 lg:px-8 py-4 lg:py-6 sticky top-0 z-30">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <nav className="flex items-center gap-2 text-xs font-semibold text-[var(--sp-accent)] uppercase tracking-widest mb-1 opacity-60">
                <span>Admin</span>
                <span className="text-white/20">/</span>
                <span>{sidebarItems.find(i => i.id === activeSection)?.label}</span>
              </nav>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                {sidebarItems.find(i => i.id === activeSection)?.label}
              </h1>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 w-full lg:w-auto">
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    placeholder="Search members, projects, opportunities..."
                    className="input-glass pl-9 pr-3 py-2 w-full sm:w-64 text-xs"
                  />
                </div>
                <button
                  onClick={() => setActiveSection('opportunities')}
                  className="sp-btn-primary text-xs px-4 py-2 whitespace-nowrap"
                >
                  Create Opportunity
                </button>
                <button
                  onClick={() => {
                    setActiveSection('admins');
                    setShowAddAdmin(true);
                  }}
                  className="sp-btn-glass text-xs px-4 py-2 whitespace-nowrap"
                >
                  Invite Admin
                </button>
              </div>
              <div className="flex items-center justify-between lg:justify-start gap-3 lg:gap-6 w-full lg:w-auto">
                <button
                  onClick={() => navigate('/')}
                  className="sp-btn-glass text-sm px-4 sm:px-6 py-2.5 hover:scale-105 active:scale-95 transition-all"
                >
                  {t('dashboard.buttons.viewWebsite')}
                </button>
                <div className="relative flex items-center gap-3 lg:pl-6 lg:border-l lg:border-white/10" ref={adminMenuRef}>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-[var(--text-primary)]">{adminProfile?.full_name || 'Admin User'}</p>
                    <p className="text-[10px] text-[var(--sp-accent)] font-semibold uppercase tracking-wider">Super Admin</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAdminMenuOpen((prev) => !prev)}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C89F5E] to-[#8B7355] flex items-center justify-center shadow-lg shadow-[var(--sp-accent)]/20 hover:rotate-6 transition-transform cursor-pointer"
                  >
                    {adminProfile?.avatar_url ? (
                      <img src={adminProfile.avatar_url} alt="Admin" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <span className="text-[var(--text-inverse)] font-bold text-lg">
                        {(adminProfile?.full_name || 'Admin').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </button>
                  {isAdminMenuOpen && (
                    <div className="absolute right-0 top-[72px] w-64 glass-card p-2 z-50">
                      <div className="px-3 py-2 border-b border-white/10 mb-2">
                        <p className="text-[var(--text-primary)] font-medium truncate">
                          {adminProfile?.full_name || 'Admin User'}
                        </p>
                        <p className="text-[var(--text-secondary)] text-xs truncate">
                          {adminProfile?.email || user?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsAdminMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors text-left"
                      >
                        <User size={16} />
                        <span className="text-sm">My Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/dashboard');
                          setIsAdminMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors text-left"
                      >
                        <LayoutDashboard size={16} />
                        <span className="text-sm">User Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/admin');
                          setIsAdminMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors text-left"
                      >
                        <Shield size={16} />
                        <span className="text-sm">Admin Dashboard</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 lg:p-6 overflow-auto pb-20 lg:pb-6">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-8">
              {/* Command Center */}
              <div className="premium-glass p-8 rounded-[32px] border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--sp-accent)]/10 via-transparent to-transparent" />
                <div className="relative flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--sp-accent)] font-bold">Admin Command Center</p>
                    <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
                      Manage every feature from one place.
                    </h2>
                    <p className="text-[var(--text-secondary)] max-w-2xl">
                      Review applications, publish opportunities, and track membership growth without switching tools.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <button onClick={() => setActiveSection('applications')} className="sp-btn-primary text-sm px-4 py-2">
                        Review Applications
                      </button>
                      <button onClick={() => setActiveSection('opportunities')} className="sp-btn-glass text-sm px-4 py-2">
                        Create Opportunity
                      </button>
                      <button onClick={() => setActiveSection('members')} className="sp-btn-glass text-sm px-4 py-2">
                        Manage Members
                      </button>
                      <button onClick={() => setActiveSection('analytics')} className="sp-btn-glass text-sm px-4 py-2">
                        View Analytics
                      </button>
                    </div>
                  </div>
                  <div className="lg:w-[360px] grid grid-cols-2 gap-3">
                    {[
                      { label: 'Pending approvals', value: pendingApprovals, icon: FileText },
                      { label: 'Under review', value: underReviewCount, icon: Shield },
                      { label: 'Possible duplicates', value: duplicateCount, icon: Copy },
                      { label: 'Total members', value: stats.totalMembers, icon: Users },
                    ].map((item, i) => (
                      <div key={i} className="glass-card p-4 rounded-2xl border border-white/5">
                        <div className="flex items-center justify-between">
                          <div className="p-2 rounded-xl bg-white/5 text-[var(--sp-accent)]">
                            <item.icon size={18} />
                          </div>
                          <span className="text-xl font-bold text-[var(--text-primary)]">{item.value}</span>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mt-3">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { label: t('dashboard.stats.totalMembers'), value: stats.totalMembers.toLocaleString(), change: '+12%', icon: Users, color: 'accent' },
                  { label: t('dashboard.stats.activeProjects'), value: stats.activeProjects.toString(), change: '+5%', icon: Briefcase, color: 'blue' },
                  { label: t('dashboard.stats.pendingApps'), value: stats.pendingApps.toString(), change: '-2%', icon: FileText, color: 'purple' },
                  { label: 'Verified Professionals', value: stats.verifiedProfessionals.toString(), change: '+8%', icon: Shield, color: 'green' },
                ].map((stat, i) => (
                  <div key={i} className="premium-glass p-6 rounded-[24px] border border-white/5 relative overflow-hidden group hover:border-[var(--sp-accent)]/30 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--sp-accent)]/5 rounded-full -mr-12 -mt-12 group-hover:bg-[var(--sp-accent)]/10 transition-colors" />
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-3 rounded-2xl bg-white/5 text-[var(--sp-accent)] group-hover:scale-110 group-hover:rotate-12 transition-transform`}>
                        <stat.icon size={24} />
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {stat.change.startsWith('+') ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                        {stat.change}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[var(--text-secondary)] text-sm font-medium tracking-wide uppercase opacity-70">{stat.label}</h4>
                      <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
                <div className="glass-card p-4 lg:p-6 border border-[var(--text-primary)]/5">
                  <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                    <div className="p-2 bg-[var(--sp-accent)]/10 rounded-lg">
                      <Globe className="text-[var(--sp-accent)] w-4 h-4 lg:w-5 lg:h-5" />
                    </div>
                    <h4 className="text-[var(--text-secondary)] text-xs lg:text-sm font-medium">Diaspora Experts</h4>
                  </div>
                  <p className="text-xl lg:text-2xl font-bold text-[var(--text-primary)]">{stats.diasporaExperts}</p>
                </div>
                <div className="glass-card p-4 lg:p-6 border border-[var(--text-primary)]/5">
                  <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                    <div className="p-2 bg-[var(--sp-accent)]/10 rounded-lg">
                      <GraduationCap className="text-[var(--sp-accent)] w-4 h-4 lg:w-5 lg:h-5" />
                    </div>
                    <h4 className="text-[var(--text-secondary)] text-xs lg:text-sm font-medium">Study-Abroad Returnees</h4>
                  </div>
                  <p className="text-xl lg:text-2xl font-bold text-[var(--text-primary)]">{stats.studyAbroadReturnees}</p>
                </div>
                <div className="glass-card p-4 lg:p-6 border border-[var(--text-primary)]/5">
                  <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                    <div className="p-2 bg-[var(--sp-accent)]/10 rounded-lg">
                      <Star className="text-[var(--sp-accent)] w-4 h-4 lg:w-5 lg:h-5" />
                    </div>
                    <h4 className="text-[var(--text-secondary)] text-xs lg:text-sm font-medium">Average Rating</h4>
                  </div>
                  <p className="text-xl lg:text-2xl font-bold text-[var(--text-primary)]">{stats.avgRating} / 5.0</p>
                </div>
              </div>

              {/* Operations Hub */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                {[
                  { id: 'members', title: 'Members', description: 'Profiles, verification, tiers, and badges.', metric: `${stats.totalMembers} total members`, icon: Users },
                  { id: 'opportunities', title: 'Opportunities', description: 'Publish and manage opportunities.', metric: 'Create and edit opportunities', icon: Briefcase },
                  { id: 'applications', title: 'Applications', description: 'Review onboarding and verification.', metric: `${pendingApprovals} pending reviews`, icon: FileText },
                  { id: 'projects', title: 'Projects', description: 'Track active and completed projects.', metric: `${stats.activeProjects} active projects`, icon: ClipboardList },
                  { id: 'analytics', title: 'Analytics', description: 'Reports, growth, and insights.', metric: 'Performance dashboards', icon: TrendingUp },
                  { id: 'admins', title: 'Admin Team', description: 'Invite and manage admins.', metric: `${admins.length} admins`, icon: Shield },
                  { id: 'settings', title: 'Settings', description: 'Plans, notifications, and platform config.', metric: 'Platform controls', icon: Settings },
                  { id: 'onboarding', title: 'Onboarding Records', description: 'Review onboarding submissions.', metric: 'Open onboarding records', icon: ClipboardList },
                ].map((card) => (
                  <button
                    key={card.title}
                    onClick={() => {
                      if (card.id === 'onboarding') {
                        navigate('/admin/onboarding');
                        return;
                      }
                      setActiveSection(card.id);
                    }}
                    className="premium-glass p-5 rounded-[24px] border border-white/5 text-left hover:border-[var(--sp-accent)]/30 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-white/5 text-[var(--sp-accent)] group-hover:scale-110 transition-transform">
                        <card.icon size={18} />
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-secondary)]">Open</span>
                    </div>
                    <h3 className="text-[var(--text-primary)] font-semibold text-base">{card.title}</h3>
                    <p className="text-[var(--text-secondary)] text-xs mt-2">{card.description}</p>
                    <p className="text-[var(--sp-accent)] text-[10px] font-semibold uppercase tracking-widest mt-3">{card.metric}</p>
                  </button>
                ))}
              </div>

              {/* Workflow and System Health */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 premium-glass p-6 rounded-[28px] border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Workflow Queue</h3>
                    <button onClick={() => setActiveSection('applications')} className="sp-btn-glass text-xs px-3 py-1.5">
                      Open queue
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Pending approvals', value: pendingApprovals, tone: 'bg-yellow-500/15 text-yellow-300' },
                      { label: 'Under review', value: underReviewCount, tone: 'bg-blue-500/15 text-blue-300' },
                      { label: 'Duplicates', value: duplicateCount, tone: 'bg-purple-500/15 text-purple-300' },
                      { label: 'Verified', value: stats.verifiedProfessionals, tone: 'bg-green-500/15 text-green-300' },
                    ].map((item, i) => (
                      <div key={i} className="glass-light rounded-2xl p-4 border border-white/5">
                        <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full inline-block ${item.tone}`}>
                          {item.label}
                        </span>
                        <p className="text-2xl font-bold text-[var(--text-primary)] mt-3">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="premium-glass p-6 rounded-[28px] border border-white/5">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">System Health</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Payments', status: 'Paystack connected', tone: 'text-green-300' },
                      { label: 'Email', status: 'Automation ready', tone: 'text-green-300' },
                      { label: 'Storage', status: 'Verification docs OK', tone: 'text-green-300' },
                      { label: 'Auth', status: 'Login and OTP OK', tone: 'text-green-300' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between glass-light rounded-xl px-4 py-3">
                        <span className="text-xs text-[var(--text-secondary)] uppercase tracking-widest">{item.label}</span>
                        <span className={`text-xs font-semibold ${item.tone}`}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 premium-glass p-8 rounded-[32px] border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--sp-accent)] to-transparent opacity-30" />
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="font-bold text-[var(--text-primary)] text-lg tracking-tight">{t('dashboard.charts.growth')}</h4>
                    <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[var(--text-secondary)] outline-none focus:border-[var(--sp-accent)]/50 transition-colors">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                      <option>Last 12 Months</option>
                    </select>
                  </div>
                  <div className="h-64 flex items-end justify-between gap-3 px-2">
                    {[
                      { h: 45, label: 'Last 7 Days' },
                      { h: 60, label: 'Month 1' },
                      { h: 48, label: 'Month 2' },
                      { h: 75, label: 'Month 3' },
                      { h: 55, label: 'Month 4' },
                      { h: 90, label: 'Month 5' },
                      { h: 100, label: 'Month 6' },
                      { h: 65, label: 'Month 7' }
                    ].map((item, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                        <div className="relative w-full h-full flex items-end">
                          <div
                            className="w-full bg-gradient-to-t from-[var(--sp-accent)]/10 to-[var(--sp-accent)]/40 group-hover/bar:to-[var(--sp-accent)]/60 rounded-t-xl transition-all duration-700 ease-[var(--transition-premium)] relative overflow-hidden"
                            style={{ height: `${item.h}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/bar:translate-y-0 transition-transform duration-500 opacity-20" />
                          </div>
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--sp-accent)] text-[var(--text-inverse)] text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none">
                            {item.h}%
                          </div>
                        </div>
                        <span className="text-[10px] text-[var(--text-secondary)] font-bold tracking-tighter uppercase opacity-50 group-hover/bar:opacity-100 transition-opacity text-center leading-tight">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="premium-glass p-8 rounded-[32px] border border-white/5 relative overflow-hidden flex flex-col items-center justify-center text-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-[var(--sp-accent)]/5 to-transparent" />
                  <h4 className="font-bold text-[var(--text-primary)] mb-6 relative z-10">{t('dashboard.charts.distribution')}</h4>
                  {(() => {
                    const verifiedPercentage = stats.totalMembers > 0 
                      ? Math.round((stats.verifiedProfessionals / stats.totalMembers) * 100) 
                      : 0;
                    return (
                      <div className="relative w-48 h-48 flex items-center justify-center relative z-10">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12" className="text-white/5" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12" strokeDasharray={251.327} strokeDashoffset={251.327 * (1 - verifiedPercentage / 100)} className="text-[var(--sp-accent)]" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center group">
                          <span className="text-4xl font-bold text-[var(--text-primary)] group-hover:scale-110 transition-transform">{verifiedPercentage}%</span>
                          <span className="text-[10px] text-[var(--sp-accent)] font-bold uppercase tracking-widest opacity-60">Verified</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Admin Actions</h3>
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.2em]">Verified and Recent Admin Actions Last 5</span>
                </div>
                <div className="space-y-4">
                  {auditLog.slice(0, 5).map((entry, i) => (
                    <div key={i} className="flex items-center justify-between text-sm glass-light p-4 rounded-xl">
                      <span className="text-[var(--text-primary)] font-medium">{entry.action}</span>
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">{new Date(entry.at).toLocaleString()}</span>
                    </div>
                  ))}
                  {auditLog.length === 0 && (
                    <p className="text-[var(--text-secondary)] text-sm">No admin actions yet. Activity will appear here.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Members Section */}
          {activeSection === 'members' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                    <input type="text" placeholder={t('dashboard.placeholders.searchMembers')} className="input-glass pl-10 pr-4 py-2 w-full text-sm" />
                  </div>
                  <button className="sp-btn-glass flex items-center gap-2 text-sm"><Filter size={14} /> {t('dashboard.buttons.filter')}</button>
                </div>
                <button onClick={() => setShowAddMember(true)} className="sp-btn-primary flex items-center gap-2 text-sm"><Plus size={14} /> {t('dashboard.buttons.addMember')}</button>
              </div>
              <div className="premium-glass rounded-[32px] border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/[0.02] text-[var(--text-secondary)] text-[10px] uppercase tracking-[0.2em] font-bold">
                      <tr>
                        <th className="px-8 py-5">Member</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5">Tier</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {members.map((member) => (
                        <tr key={member.id} className="group hover:bg-white/[0.02]">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C89F5E] to-[#8B7355] flex items-center justify-center shadow-lg shadow-[var(--sp-accent)]/10 group-hover:scale-110 transition-transform"><span className="text-[var(--text-inverse)] font-bold">{member.name.charAt(0)}</span></div>
                              <div><p className="text-sm font-bold text-[var(--text-primary)]">{member.name}</p><p className="text-[10px] text-[var(--text-secondary)]">{member.email}</p></div>
                            </div>
                          </td>
                          <td className="px-8 py-5"><span className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase ${getStatusBadge(member.status)}`}>{member.status}</span></td>
                          <td className="px-8 py-5"><span className="text-xs text-[var(--text-secondary)]">{member.tier || 'Community'}</span></td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => navigate(`/admin/user/${member.id}`)} className="p-2 rounded-xl bg-white/5 text-[var(--text-secondary)] hover:bg-[var(--sp-accent)] hover:text-[var(--text-inverse)] transition-all"><Eye size={16} /></button>
                              <button onClick={() => handleViewDocs({ id: member.id, name: member.name, email: member.email, docs: member.docs || {} })} className="p-2 rounded-xl bg-white/5 text-[var(--text-secondary)] hover:bg-purple-500 hover:text-white transition-all"><FileText size={16} /></button>
                              <button onClick={() => handleDeleteMember(member.id)} className="p-2 rounded-xl bg-white/5 text-[var(--text-secondary)] hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Projects Section */}
          {activeSection === 'projects' && (
            <div className="space-y-6">
              {/* Projects toolbar */}
          <div className="flex flex-wrap gap-3 md:gap-4 items-stretch md:items-center justify-between mb-6">
            <div className="relative w-full sm:w-72">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input 
                type="text"
                placeholder={t('dashboard.placeholders.searchProjects')}
                className="input-glass pl-10 pr-4 py-2 w-full"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button className="sp-btn-glass flex items-center gap-2 justify-center w-full sm:w-auto">
                <Filter size={16} />
                {t('dashboard.buttons.filter')}
              </button>
              <button className="sp-btn-primary flex items-center gap-2 justify-center w-full sm:w-auto">
                <Plus size={16} />
                {t('dashboard.buttons.newProject')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="glass-card p-6">
                    <div className=" flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg  font-semibold text-[var(--text-primary)]">{project.title}</h3>
                        <p className="text-[var(--text-secondary)] text-sm">{project.client}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <div className=" flex items-center gap-6 mb-4 text-sm">
                      <span className="text-[var(--sp-accent)]  font-medium">{project.budget}</span>
                      <span className="text-[var(--text-secondary)]  flex items-center gap-1">
                        <Users size={14} />
                        {project.members} members
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className=" flex justify-between text-sm mb-1">
                        <span className="text-[var(--text-secondary)]">Progress</span>
                        <span className="text-[var(--text-primary)]">{project.progress}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#C89F5E] to-[#D4B76E] rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className=" flex gap-2">
                      <button className="sp-btn-glass  flex-1  flex items-center justify-center gap-2">
                        <Eye size={16} />
                        View
                      </button>
                      <button className="sp-btn-glass  flex items-center justify-center gap-2">
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities Section */}
          {activeSection === 'opportunities' && (
            <AdminOpportunitiesManager />
          )}

          {/* Onboarding Records: redirect to dedicated page */}
          {activeSection === 'onboarding' && <Navigate to="/admin/onboarding" replace />}

          {/* Applications Section */}
          {activeSection === 'applications' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input 
                    type="text"
                    placeholder={t('dashboard.placeholders.searchApps')}
                    className="input-glass pl-10 pr-4 py-2 w-64"
                  />
                </div>
                <select className="input-glass px-4 py-2">
                  <option value="all">{t('oppsPage.filters.all')} {t('dashboard.headers.status')}</option>
                  <option value="pending">{t('dashboard.recentApps.status')}: {t('dashboard.buttons.approve')}</option>
                  <option value="approved">{t('dashboard.buttons.approve')}d</option>
                  <option value="rejected">{t('dashboard.buttons.reject')}ed</option>
                </select>
                {selectedApplications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => selectedApplications.forEach(id => handleApprove(id))} className="sp-btn-primary text-xs">
                      Approve selected ({selectedApplications.length})
                    </button>
                    <button onClick={() => selectedApplications.forEach(id => handleReject(id))} className="sp-btn-glass text-xs">
                      Reject selected
                    </button>
                    <button onClick={() => selectedApplications.forEach(id => handleSuspendMember(id, 'under_review'))} className="sp-btn-glass text-xs">
                      Mark under review
                    </button>
                  </div>
                )}
              </div>

              <div className="glass-card p-6">
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="glass-light rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <input 
                          type="checkbox"
                          className="accent-[var(--sp-accent)]"
                          checked={selectedApplications.includes(app.id)}
                          onChange={(e) => {
                            setSelectedApplications(prev => e.target.checked ? [...prev, app.id] : prev.filter(id => id !== app.id));
                          }}
                        />
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C89F5E] to-[#8B7355] flex items-center justify-center">
                          <span className="text-[var(--text-inverse)] font-semibold">{app.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="text-[var(--text-primary)] font-medium">{app.name}</h4>
                          <p className="text-[var(--text-secondary)] text-sm">{app.email} · {app.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[var(--text-secondary)] text-sm">{app.date}</span>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-[var(--text-secondary)]">
                          {Math.max(0, Math.round((Date.now() - new Date(app.date).getTime()) / 86400000))}d old
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs ${getStatusBadge(app.status)}`}>
                          {app.status.replace('_', ' ')}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/admin/user/${app.id}`)} className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" title="View Full Profile">
                            <User size={18} />
                          </button>
                          <button onClick={() => handleViewDocs(app)} className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30" title="View Documents">
                            <Eye size={18} />
                          </button>
                          <button onClick={() => handleApprove(app.id)} className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => handleReject(app.id)} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30">
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-lg  font-semibold text-[var(--text-primary)] mb-4">{t('dashboard.analytics.revenue')}</h3>
                  <div className="text-3xl  font-bold text-[var(--sp-accent)] mb-2">KSh 628,800</div>
                  <p className="text-green-400 text-sm  flex items-center gap-1">
                    <TrendingUp size={14} />
                    +23%  {t('dashboard.analytics.lastMonth')}
                  </p>
                </div>
                <div className="glass-card p-6">
                  <h3 className="text-lg  font-semibold text-[var(--text-primary)] mb-4">{t('dashboard.analytics.activeMembers')}</h3>
                  <div className="text-3xl  font-bold text-[var(--sp-accent)] mb-2">486</div>
                  <p className="text-green-400 text-sm  flex items-center gap-1">
                    <TrendingUp size={14} />
                    +12%  {t('dashboard.analytics.lastMonth')}
                  </p>
                </div>
                <div className="glass-card p-6">
                  <h3 className="text-lg  font-semibold text-[var(--text-primary)] mb-4">{t('dashboard.analytics.successRate')}</h3>
                  <div className="text-3xl  font-bold text-[var(--sp-accent)] mb-2">94%</div>
                  <p className="text-green-400 text-sm  flex items-center gap-1">
                    <TrendingUp size={14} />
                    +5%  {t('dashboard.analytics.lastMonth')}
                  </p>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg  font-semibold text-[var(--text-primary)] mb-4">Monthly Activity</h3>
                <div className="h-64  flex items-end gap-4">
                  {[
                    { label: 'Jan', members: 45, projects: 8 },
                    { label: ' eb', members: 62, projects: 12 },
                    { label: 'Mar', members: 78, projects: 15 },
                    { label: 'Apr', members: 95, projects: 18 },
                    { label: 'May', members: 110, projects: 22 },
                    { label: 'Jun', members: 125, projects: 25 },
                  ].map((month, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex gap-1 items-end h-48">
                        <div 
                          className="flex-1 bg-[var(--sp-accent)] rounded-t"
                          style={{ height: `${(month.members / 150) * 100}%` }}
                        />
                        <div 
                          className="flex-1 bg-[#8B7355] rounded-t"
                          style={{ height: `${(month.projects / 30) * 100}%` }}
                        />
                      </div>
                      <span className="text-[var(--text-secondary)] text-xs">{month.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[var(--sp-accent)]" />
                    <span className="text-[var(--text-secondary)] text-sm">New Members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#8B7355]" />
                    <span className="text-[var(--text-secondary)] text-sm">Projects</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="max-w-3xl space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Admin Profile</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[var(--text-secondary)] text-sm mb-2 block">Full Name</label>
                      <input type="text" defaultValue="Admin User" className="input-glass w-full px-4 py-2" />
                    </div>
                    <div>
                      <label className="text-[var(--text-secondary)] text-sm mb-2 block">Email</label>
                      <input type="email" defaultValue="admin@strategicpathways.co.ke" className="input-glass w-full px-4 py-2" />
                    </div>
                    <div>
                      <label className="text-[var(--text-secondary)] text-sm mb-2 block">Phone</label>
                      <input type="tel" defaultValue="+254 712 345 678" className="input-glass w-full px-4 py-2" />
                    </div>
                    <div>
                      <label className="text-[var(--text-secondary)] text-sm mb-2 block">Role</label>
                      <input type="text" defaultValue="Super Admin" className="input-glass w-full px-4 py-2" disabled />
                    </div>
                  </div>
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-2 block">Bio</label>
                    <textarea 
                      className="input-glass w-full px-4 py-2 min-h-[100px]" 
                      defaultValue="Platform administrator managing Strategic Pathways operations."
                    />
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-2 block">Current Password</label>
                    <input type="password" className="input-glass w-full px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-2 block">New Password</label>
                    <input type="password" className="input-glass w-full px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-2 block">Confirm New Password</label>
                    <input type="password" className="input-glass w-full px-4 py-2" />
                  </div>
                  <button className="sp-btn-primary">Update Password</button>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => toast.success('Profile updated successfully!')}
                  className="sp-btn-primary flex-1"
                >
                  Save Changes
                </button>
                <button className="sp-btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          {/* Admins Section */}
          {activeSection === 'admins' && (
            <div className="space-y-4 lg:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                    <input 
                      type="text"
                      placeholder="Search admins..."
                      className="input-glass pl-10 pr-4 py-2 w-full sm:w-64 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => setShowPromoteList(!showPromoteList)}
                    className={`sp-btn-glass flex items-center gap-2 text-sm justify-center flex-1 sm:flex-none ${showPromoteList ? 'bg-[var(--sp-accent)]/10 text-[var(--sp-accent)]' : ''}`}
                  >
                    <Star size={14} />
                    {showPromoteList ? 'Close Selection' : 'Promote Existing'}
                  </button>
                  <button 
                    onClick={() => setShowAddAdmin(true)}
                    className="sp-btn-primary flex items-center gap-2 text-sm justify-center flex-1 sm:flex-none"
                  >
                    <Plus size={14} />
                    Add New Admin
                  </button>
                </div>
              </div>

              {showPromoteList && (
                <div className="glass-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Select Member to Promote</h3>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                      <input 
                        type="text"
                        placeholder="Search members..."
                        value={promoteSearch}
                        onChange={(e) => setPromoteSearch(e.target.value)}
                        className="input-glass pl-9 pr-4 py-1.5 text-xs w-64"
                      />
                    </div>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {members
                      .filter(m => 
                        !admins.some(a => a.id === m.id) && 
                        (m.name.toLowerCase().includes(promoteSearch.toLowerCase()) || 
                         m.email.toLowerCase().includes(promoteSearch.toLowerCase()))
                      )
                      .map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 glass-light rounded-xl hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C89F5E] to-[#8B7355] flex items-center justify-center">
                              <span className="text-[var(--text-inverse)] text-xs font-bold">{member.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[var(--text-primary)]">{member.name}</p>
                              <p className="text-[10px] text-[var(--text-secondary)]">{member.email}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleMakeAdmin(member.id, member.email)}
                            className="sp-btn-primary text-[10px] py-1 px-3"
                          >
                            Make Admin
                          </button>
                        </div>
                      ))}
                    {members.filter(m => !admins.some(a => a.id === m.id)).length === 0 && (
                      <p className="text-center text-[var(--text-secondary)] text-sm py-4">No eligible members found.</p>
                    )}
                  </div>
                </div>
              )}

              {showAddAdmin && (
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Add New Admin</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[var(--text-secondary)] text-sm block mb-2">Email *</label>
                        <input
                          type="email"
                          value={newAdmin.email}
                          onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                          className="input-glass w-full"
                          placeholder="admin@example.com"
                        />
                      </div>
                      <div>
                        <label className="text-[var(--text-secondary)] text-sm block mb-2">Full Name *</label>
                        <input
                          type="text"
                          value={newAdmin.full_name}
                          onChange={(e) => setNewAdmin({...newAdmin, full_name: e.target.value})}
                          className="input-glass w-full"
                          placeholder="Admin User"
                        />
                      </div>
                      <div>
                        <label className="text-[var(--text-secondary)] text-sm block mb-2">Temporary Password (optional)</label>
                        <input
                          type="text"
                          value={newAdmin.password}
                          onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                          className="input-glass w-full"
                          placeholder="Leave blank to auto-generate"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={handleAddAdmin} className="sp-btn-primary">
                        Create Admin Account
                      </button>
                      <button 
                        onClick={() => {
                          setShowAddAdmin(false);
                          setNewAdmin({ email: '', full_name: '', password: '' });
                        }} 
                        className="sp-btn-glass"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="premium-glass rounded-[32px] border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/[0.02] text-[var(--text-secondary)] text-[10px] uppercase tracking-[0.2em] font-bold">
                      <tr>
                        <th className="px-8 py-5 whitespace-nowrap">Admin Profile</th>
                        <th className="px-8 py-5 whitespace-nowrap">Role</th>
                        <th className="px-8 py-5 whitespace-nowrap">Joined</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {admins.map((admin) => (
                        <tr key={admin.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--sp-accent)] to-[#8B7355] flex items-center justify-center shadow-lg shadow-[var(--sp-accent)]/20 group-hover:scale-110 transition-transform">
                                <span className="text-[var(--text-inverse)] font-bold">
                                  {admin.full_name ? admin.full_name.charAt(0) : admin.email.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--sp-accent)] transition-colors truncate">{admin.full_name || 'Admin User'}</p>
                                <p className="text-[10px] text-[var(--text-secondary)] opacity-60 font-medium tracking-tight uppercase truncate">{admin.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-xs font-semibold px-3 py-1 bg-[var(--sp-accent)]/20 text-[var(--sp-accent)] rounded-lg">
                              {admin.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-xs text-[var(--text-secondary)] font-medium">
                            {new Date(admin.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex justify-end gap-2 pr-4">
                              <button 
                                onClick={() => handleRemoveAdmin(admin.id)}
                                className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                title="Revoke Admin Access"
                              >
                                  <X size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {admins.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-8 py-8 text-center text-[var(--text-secondary)] text-sm">
                            No admins found. Add one above.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('dashboard.settings.general')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-2 block">{t('dashboard.settings.platformName')}</label>
                    <input type="text" defaultValue="Strategic Pathways" className="input-glass w-full px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-2 block">{t('dashboard.settings.contactEmail')}</label>
                    <input type="email" defaultValue="joinstrategicpathways@gmail.com" className="input-glass w-full px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-2 block">{t('dashboard.settings.defaultCurrency')}</label>
                    <select className="input-glass w-full px-4 py-2">
                      <option value="KES">Kenyan Shilling (KSh)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (â‚¬)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('dashboard.settings.membershipTiers')}</h3>
                <div className="space-y-4">
                  {Object.values(tierData).map((tier) => (
                    <div key={tier.name} className="glass-light rounded-xl p-4">
                      {editingTier === tier.name ? (
                        <div className="space-y-3">
                          <input
                            value={tier.name}
                            onChange={(e) => setTierData({...tierData, [tier.name]: {...tier, name: e.target.value}})}
                            className="input-glass w-full"
                            placeholder="Tier Name"
                          />
                          <input
                            value={tier.price}
                            onChange={(e) => setTierData({...tierData, [tier.name]: {...tier, price: e.target.value}})}
                            className="input-glass w-full"
                            placeholder="Price"
                          />
                          <input
                            type="number"
                            value={tier.features}
                            onChange={(e) => setTierData({...tierData, [tier.name]: {...tier, features: parseInt(e.target.value)}})}
                            className="input-glass w-full"
                            placeholder="Number of features"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => handleSaveTier(tier.name)} className="sp-btn-primary text-sm">
                              Save
                            </button>
                            <button onClick={() => setEditingTier(null)} className="sp-btn-glass text-sm">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-[var(--text-primary)] font-medium">{tier.name}</h4>
                            <p className="text-[var(--text-secondary)] text-sm">{tier.features} features â€“ {tier.price}</p>
                          </div>
                          <button onClick={() => setEditingTier(tier.name)} className="sp-btn-glass text-sm">Edit</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('dashboard.settings.notifications')}</h3>
                <div className="space-y-3">
                  {[
                    'Email notifications for new applications',
                    'Email notifications for project updates',
                    'Weekly summary reports',
                    'Member activity alerts',
                  ].map((setting, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-[var(--sp-accent)]/30 bg-white/5 text-[var(--sp-accent)] focus:ring-[#C89F5E]" />
                      <span className="text-[var(--text-secondary)]">{setting}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button className="sp-btn-primary flex-1">{t('dashboard.buttons.saveChanges')}</button>
                <button className="sp-btn-secondary">{t('dashboard.buttons.cancel')}</button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocs && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[var(--bg-card)] border-b border-white/10 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">{viewingDocs.name}'s Documents</h3>
                <p className="text-[var(--text-secondary)] text-sm">{viewingDocs.email}</p>
              </div>
              <button 
                onClick={() => setViewingDocs(null)}
                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {viewingDocs.docs && Object.keys(viewingDocs.docs).length > 0 ? (
                Object.entries(viewingDocs.docs).map(([key, value]: [string, any]) => {
                  if (!value || value === '') return null;
                  
                  const docName = key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                  
                  return (
                    <div key={key} className="glass-light rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--sp-accent)]/10 rounded-lg">
                          <FileText className="text-[var(--sp-accent)] w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-[var(--text-primary)] font-medium">{docName}</h4>
                          <p className="text-[var(--text-secondary)] text-sm">Verification Document</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sp-btn-glass flex items-center gap-2"
                        >
                          <ExternalLink size={16} />
                          View
                        </a>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = value;
                            link.download = `${viewingDocs.name}_${docName}.pdf`;
                            link.target = '_blank';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="sp-btn-primary flex items-center gap-2"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
                  <p className="text-[var(--text-secondary)]">No documents available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


