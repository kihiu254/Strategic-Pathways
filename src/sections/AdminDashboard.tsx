import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, Users, Briefcase, FileText, Settings, 
  TrendingUp, DollarSign, CheckCircle,
  X, Plus, Search, Filter,
  BarChart3, Star, Edit2, Trash2, Eye,
  Maximize2, Minimize2, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);



  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeProjects: 0,
    pendingApps: 0,
    totalRevenue: '$0'
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch Stats
        const { count: memberCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: projectCount } = await supabase.from('user_projects').select('*', { count: 'exact', head: true });
        const { count: pendingCount } = await supabase.from('verification_documents').select('*', { count: 'exact', head: true }).eq('status', 'pending');

        setStats({
          totalMembers: memberCount || 0,
          activeProjects: projectCount || 0,
          pendingApps: pendingCount || 0,
          totalRevenue: '$0'
        });

        // Fetch Recent Applications
        const { data: appsData } = await supabase
          .from('verification_documents')
          .select('*, profiles(full_name, email)')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (appsData) {
          setRecentApplications(appsData.map(app => ({
            id: app.id,
            name: app.profiles?.full_name || 'Unknown',
            email: app.profiles?.email || 'N/A',
            type: app.document_category,
            status: app.status,
            date: new Date(app.created_at).toLocaleDateString()
          })));
        }

        // Fetch Members
        const { data: membersData } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (membersData) {
          setMembers(membersData.map(m => ({
            id: m.id,
            name: m.full_name || 'Unnamed',
            email: m.email,
            tier: m.tier || 'Community',
            projects: 0,
            rating: 0,
            status: 'active',
            joined: new Date(m.created_at).toLocaleDateString()
          })));
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

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('verification_documents')
        .update({ status: 'approved' })
        .eq('id', id);
      if (error) throw error;
      setRecentApplications(prev => prev.map(app => app.id === id ? { ...app, status: 'approved' } : app));
      toast.success('Application approved successfully!');
    } catch (error) {
      toast.error('Failed to approve application');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('verification_documents')
        .update({ status: 'rejected' })
        .eq('id', id);
      if (error) throw error;
      setRecentApplications(prev => prev.map(app => app.id === id ? { ...app, status: 'rejected' } : app));
      toast.error('Application rejected');
    } catch (error) {
      toast.error('Failed to reject application');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-green-500/20 text-green-400',
      under_review: 'bg-blue-500/20 text-blue-400',
      rejected: 'bg-red-500/20 text-red-400',
      active: 'bg-green-500/20 text-green-400',
      completed: 'bg-[var(--sp-accent)]/20 text-[var(--sp-accent)]',
      planning: 'bg-purple-500/20 text-purple-400',
    };
    return styles[status] || 'bg-gray-500/20 text-gray-400';
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 gap-4">
        <Loader2 className="w-10 h-10 text-[var(--sp-accent)] animate-spin" />
        <p className="text-[var(--text-secondary)]">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]  flex">
      {/* Sidebar */}
      <div className={`dashboard-sidebar transition-all duration-300 ${isSidebarCollapsed ? 'w-64' : 'w-20'}  flex  flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <button
            onClick={() => navigate('/')}
            className={` flex items-center gap-3 ${!isSidebarCollapsed && 'justify-center'}`}
          >
            <img src="/logo.png" alt="SP" className="h-10 w-auto" />
            {isSidebarCollapsed && <span className="text-[var(--text-primary)]  font-semibold">Admin</span>}
          </button>
        </div>

        {/* Navigation */}
        <nav className=" flex-1 p-4 space-y-2">
          {[
            { id: 'overview', icon: LayoutDashboard, label: t('dashboard.sections.overview') },
            { id: 'members', icon: Users, label: t('dashboard.sections.members') },
            { id: 'projects', icon: Briefcase, label: t('dashboard.sections.projects') },
            { id: 'applications', icon: FileText, label: t('dashboard.sections.applications') },
            { id: 'analytics', icon: BarChart3, label: t('dashboard.sections.analytics') },
            { id: 'settings', icon: Settings, label: t('dashboard.sections.settings') },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-[var(--sp-accent)] text-white shadow-lg shadow-[var(--sp-accent)]/20'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)]/10 hover:text-[var(--text-primary)]'
              }`}
            >
              <item.icon size={20} />
              {isSidebarCollapsed && <span className=" font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Toggle Sidebar */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-card)]/10 hover:text-[var(--text-primary)] transition-all"
          >
            {isSidebarCollapsed ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            {isSidebarCollapsed && <span className="font-medium">{t('dashboard.sidebar.collapse')}</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className=" flex-1  flex  flex-col">
        {/* Header */}
        <header className="glass border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                {sidebarItems.find(i => i.id === activeSection)?.label}
              </h1>
              <p className="text-[var(--text-secondary)] text-sm">{t('dashboard.welcome')}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="sp-btn-glass"
              >
                {t('dashboard.buttons.viewWebsite')}
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C89F5E] to-[#8B7355] flex items-center justify-center">
                <span className="text-[var(--text-inverse)] font-semibold">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className=" flex-1 p-6 overflow-auto">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { label: t('dashboard.stats.totalMembers'), value: stats.totalMembers.toLocaleString(), change: '+0%', icon: Users },
                  { label: t('dashboard.stats.activeProjects'), value: stats.activeProjects.toString(), change: '+0%', icon: Briefcase },
                  { label: t('dashboard.stats.pendingApps'), value: stats.pendingApps.toString(), change: '+0%', icon: FileText },
                  { label: t('dashboard.stats.totalRevenue'), value: stats.totalRevenue, change: '+0%', icon: DollarSign },
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-6 border border-[var(--text-primary)]/5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-[var(--sp-accent)]/10 rounded-lg">
                        <stat.icon className="text-[var(--sp-accent)] w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {stat.change}
                      </span>
                    </div>
                    <h4 className="text-[var(--text-secondary)] text-sm font-medium mb-1">{stat.label}</h4>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 glass-card p-6">
                  <h4 className="font-bold text-[var(--text-primary)] mb-6">{t('dashboard.charts.growth')}</h4>
                  <div className="h-64 flex items-end justify-between gap-2 px-4">
                    {[45, 60, 48, 75, 55, 90, 100].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div
                          className="w-full bg-[var(--sp-accent)]/20 group-hover:bg-[var(--sp-accent)]/40 rounded-t-lg transition-all duration-500"
                          style={{ height: `${h}%` }}
                        ></div>
                        <span className="text-[10px] text-[var(--text-secondary)] font-medium">Month {i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h4 className="font-bold text-[var(--text-primary)] mb-6">{t('dashboard.charts.distribution')}</h4>
                  <div className="relative h-64 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full border-[12px] border-[var(--sp-accent)] border-r-transparent border-b-transparent -rotate-45"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-[var(--text-primary)]">65%</span>
                      <span className="text-xs text-[var(--text-secondary)]">{t('dashboard.charts.total')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-[var(--text-primary)]/5 flex justify-between items-center">
                  <h4 className="font-bold text-[var(--text-primary)]">{t('dashboard.recentApps.title')}</h4>
                  <button className="text-[var(--sp-accent)] text-sm font-medium hover:underline">{t('dashboard.recentApps.viewAll')}</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[var(--bg-card)]/5 text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 font-semibold">{t('dashboard.recentApps.name')}</th>
                        <th className="px-6 py-4 font-semibold">{t('dashboard.recentApps.email')}</th>
                        <th className="px-6 py-4 font-semibold">{t('dashboard.recentApps.type')}</th>
                        <th className="px-6 py-4 font-semibold">{t('dashboard.recentApps.date')}</th>
                        <th className="px-6 py-4 font-semibold">{t('dashboard.recentApps.status')}</th>
                        <th className="px-6 py-4 font-semibold text-right">{t('dashboard.recentApps.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApplications.map((app) => (
                        <tr key={app.id} className="border-b border-white/5">
                          <td className="py-3 text-[var(--text-primary)]">{app.name}</td>
                          <td className="py-3 text-[var(--text-secondary)]">{app.email}</td>
                          <td className="py-3 text-[var(--text-secondary)]">{app.type}</td>
                          <td className="py-3 text-[var(--text-secondary)]">{app.date}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(app.status)}`}>
                              {app.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className=" flex gap-2">
                              <button 
                                onClick={() => handleApprove(app.id)}
                                className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button 
                                onClick={() => handleReject(app.id)}
                                className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                              >
                                <X size={16} />
                              </button>
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

          {/* Members Section */}
          {activeSection === 'members' && (
            <div className="space-y-6">
              <div className=" flex items-center justify-between">
                <div className=" flex items-center gap-4">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                    <input 
                      type="text"
                      placeholder={t('dashboard.placeholders.searchMembers')}
                      className="input-glass pl-10 pr-4 py-2 w-64"
                    />
                  </div>
                  <button className="sp-btn-glass flex items-center gap-2">
                    <Filter size={16} />
                    {t('dashboard.buttons.filter')}
                  </button>
                </div>
                <button className="sp-btn-primary flex items-center gap-2">
                  <Plus size={16} />
                  {t('dashboard.buttons.addMember')}
                </button>
              </div>

              <div className="glass-card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr className="text-left text-[var(--text-secondary)] text-sm">
                      <th className="p-4">{t('dashboard.headers.member')}</th>
                      <th className="p-4">{t('dashboard.headers.tier')}</th>
                      <th className="p-4">{t('dashboard.headers.projects')}</th>
                      <th className="p-4">{t('dashboard.headers.rating')}</th>
                      <th className="p-4">{t('dashboard.headers.status')}</th>
                      <th className="p-4">{t('dashboard.headers.joined')}</th>
                      <th className="p-4">{t('dashboard.recentApps.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C89F5E] to-[#8B7355] flex items-center justify-center">
                              <span className="text-[var(--text-inverse)] font-semibold">{member.name.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="text-[var(--text-primary)] font-medium">{member.name}</div>
                              <div className="text-[var(--text-secondary)] text-sm">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-full bg-[var(--sp-accent)]/10 text-[var(--sp-accent)] text-xs">
                            {member.tier}
                          </span>
                        </td>
                        <td className="p-4 text-[var(--text-secondary)]">{member.projects}</td>
                        <td className="p-4">
                          <div className=" flex items-center gap-1 text-[var(--sp-accent)]">
                            <Star size={14} className="fill-[#C89F5E]" />
                            {member.rating}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(member.status)}`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="p-4 text-[var(--text-secondary)]">{member.joined}</td>
                        <td className="p-4">
                          <div className=" flex gap-2">
                            <button className="p-1.5 rounded-lg bg-white/5 text-[var(--text-secondary)] hover:bg-white/10">
                              <Eye size={16} />
                            </button>
                            <button className="p-1.5 rounded-lg bg-white/5 text-[var(--text-secondary)] hover:bg-white/10">
                              <Edit2 size={16} />
                            </button>
                            <button className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Projects Section */}
          {activeSection === 'projects' && (
            <div className="space-y-6">
              <div className=" flex items-center justify-between">
                <div className=" flex items-center gap-4">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                    <input 
                      type="text"
                      placeholder={t('dashboard.placeholders.searchProjects')}
                      className="input-glass pl-10 pr-4 py-2 w-64"
                    />
                  </div>
                  <button className="sp-btn-glass flex items-center gap-2">
                    <Filter size={16} />
                    {t('dashboard.buttons.filter')}
                  </button>
                </div>
                <button className="sp-btn-primary flex items-center gap-2">
                  <Plus size={16} />
                  {t('dashboard.buttons.newProject')}
                </button>
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

          {/* Applications Section */}
          {activeSection === 'applications' && (
            <div className="space-y-6">
              <div className=" flex items-center gap-4">
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
              </div>

              <div className="glass-card p-6">
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="glass-light rounded-xl p-4  flex items-center justify-between">
                      <div className=" flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C89F5E] to-[#8B7355] flex items-center justify-center">
                          <span className="text-[var(--text-inverse)] font-semibold">{app.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="text-[var(--text-primary)]  font-medium">{app.name}</h4>
                          <p className="text-[var(--text-secondary)] text-sm">{app.email}  �  {app.type}</p>
                        </div>
                      </div>
                      <div className=" flex items-center gap-4">
                        <span className="text-[var(--text-secondary)] text-sm">{app.date}</span>
                        <span className={`px-3 py-1 rounded-full text-xs ${getStatusBadge(app.status)}`}>
                          {app.status.replace('_', ' ')}
                        </span>
                        <div className=" flex gap-2">
                          <button 
                            onClick={() => handleApprove(app.id)}
                            className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => handleReject(app.id)}
                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          >
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
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('dashboard.settings.membershipTiers')}</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Community', price: 'Free', features: 3 },
                    { name: 'Professional', price: 'only $100/year (or $10/month)', features: 6 },
                    { name: 'Firm', price: 'Custom', features: 8 },
                  ].map((tier, i) => (
                    <div key={i} className="glass-light rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-[var(--text-primary)] font-medium">{tier.name}</h4>
                        <p className="text-[var(--text-secondary)] text-sm">{tier.features} features – {tier.price}</p>
                      </div>
                      <button className="sp-btn-glass text-sm">Edit</button>
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
    </div>
  );
};

export default AdminDashboard;
