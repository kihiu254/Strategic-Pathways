import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, FileText, Settings, 
  TrendingUp, DollarSign, UserCheck, CheckCircle,
  X, Plus, Search, Filter,
  BarChart3, PieChart, Star, Edit2, Trash2, Eye
} from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Demo data
  const stats = {
    totalMembers: 524,
    activeProjects: 18,
    pendingApplications: 47,
    totalRevenue: 'KSh 628,800',
    newMembersThisMonth: 86,
    completedProjects: 156
  };

  const recentApplications = [
    { id: 1, name: 'Sarah Mwangi', email: 'sarah.m@email.com', type: 'Professional', status: 'pending', date: '2024-02-20' },
    { id: 2, name: 'James Ochieng', email: 'james.o@email.com', type: 'Community', status: 'approved', date: '2024-02-19' },
    { id: 3, name: 'Grace Wanjiku', email: 'grace.w@email.com', type: 'Professional', status: 'pending', date: '2024-02-19' },
    { id: 4, name: 'Peter Kimani', email: 'peter.k@email.com', type: 'Firm', status: 'under_review', date: '2024-02-18' },
    { id: 5, name: 'Mary Atieno', email: 'mary.a@email.com', type: 'Community', status: 'approved', date: '2024-02-18' },
  ];

  const projects = [
    { id: 1, title: 'County Development Strategy', client: 'Nairobi County', budget: 'KSh 2.5M', status: 'active', members: 5, progress: 65 },
    { id: 2, title: 'NGO Capacity Assessment', client: 'World Vision Kenya', budget: 'KSh 1.8M', status: 'completed', members: 3, progress: 100 },
    { id: 3, title: 'Youth Employment Program', client: 'Ministry of Youth', budget: 'KSh 4.2M', status: 'active', members: 8, progress: 40 },
    { id: 4, title: 'Digital Transformation', client: 'KRA', budget: 'KSh 8.5M', status: 'planning', members: 12, progress: 15 },
  ];

  const members = [
    { id: 1, name: 'John Kamau', email: 'john.k@email.com', tier: 'Professional', projects: 12, rating: 4.9, status: 'active', joined: '2024-01-15' },
    { id: 2, name: 'Sarah Mwangi', email: 'sarah.m@email.com', tier: 'Professional', projects: 8, rating: 4.7, status: 'active', joined: '2024-01-20' },
    { id: 3, name: 'James Ochieng', email: 'james.o@email.com', tier: 'Community', projects: 3, rating: 4.5, status: 'active', joined: '2024-02-01' },
    { id: 4, name: 'Grace Wanjiku', email: 'grace.w@email.com', tier: 'Professional', projects: 15, rating: 5.0, status: 'active', joined: '2023-12-10' },
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleApprove = (_id: number) => {
    toast.success('Application approved successfully!');
  };

  const handleReject = (_id: number) => {
    toast.error('Application rejected');
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

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* Sidebar */}
      <div className={`dashboard-sidebar transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <button 
            onClick={() => navigate('/')}
            className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}
          >
            <img src="/logo.png" alt="SP" className="h-10 w-auto" />
            {sidebarOpen && <span className="text-[var(--text-primary)] font-semibold">Admin</span>}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === item.id
                  ? 'bg-[var(--sp-accent)]/20 text-[var(--sp-accent)]'
                  : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Toggle Sidebar */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-[var(--text-secondary)] hover:bg-white/5"
          >
            {sidebarOpen ? '← Collapse' : '→'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="glass border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                {sidebarItems.find(i => i.id === activeSection)?.label}
              </h1>
              <p className="text-[var(--text-secondary)] text-sm">Welcome back, Admin</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/')}
                className="sp-btn-glass"
              >
                View Website
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C89F5E] to-[#8B7355] flex items-center justify-center">
                <span className="text-[var(--text-inverse)] font-semibold">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                  { label: 'Total Members', value: stats.totalMembers, icon: Users, change: '+12%' },
                  { label: 'Active Projects', value: stats.activeProjects, icon: Briefcase, change: '+5%' },
                  { label: 'Pending Apps', value: stats.pendingApplications, icon: FileText, change: '+8' },
                  { label: 'Total Revenue', value: stats.totalRevenue, icon: DollarSign, change: '+23%' },
                  { label: 'New This Month', value: stats.newMembersThisMonth, icon: UserCheck, change: '+18%' },
                  { label: 'Completed', value: stats.completedProjects, icon: CheckCircle, change: '+9%' },
                ].map((stat, i) => (
                  <div key={i} className="stat-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon size={20} className="text-[var(--sp-accent)]" />
                      <span className="text-green-400 text-xs">{stat.change}</span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</div>
                    <div className="text-[var(--text-secondary)] text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <BarChart3 size={18} className="text-[var(--sp-accent)]" />
                    Member Growth
                  </h3>
                  <div className="h-48 flex items-end gap-2">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div 
                          className="w-full bg-gradient-to-t from-[#C89F5E] to-[#C89F5E]/50 rounded-t"
                          style={{ height: `${h}%` }}
                        />
                        <span className="text-[var(--text-secondary)] text-xs">{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <PieChart size={18} className="text-[var(--sp-accent)]" />
                    Membership Distribution
                  </h3>
                  <div className="flex items-center justify-center h-48">
                    <div className="relative w-40 h-40">
                      <svg viewBox="0 0 100 100" className="transform -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#C89F5E" strokeWidth="20" strokeDasharray="188 251" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#8B7355" strokeWidth="20" strokeDasharray="44 251" strokeDashoffset="-188" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#4A5568" strokeWidth="20" strokeDasharray="19 251" strokeDashoffset="-232" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[var(--text-primary)]">524</div>
                          <div className="text-[var(--text-secondary)] text-xs">Total</div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[var(--sp-accent)]" />
                        <span className="text-[var(--text-secondary)] text-sm">Professional (75%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#8B7355]" />
                        <span className="text-[var(--text-secondary)] text-sm">Community (18%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#4A5568]" />
                        <span className="text-[var(--text-secondary)] text-sm">Firm (7%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Recent Applications</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-[var(--text-secondary)] text-sm border-b border-white/10">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Actions</th>
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
                            <div className="flex gap-2">
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                    <input 
                      type="text"
                      placeholder="Search members..."
                      className="input-glass pl-10 pr-4 py-2 w-64"
                    />
                  </div>
                  <button className="sp-btn-glass flex items-center gap-2">
                    <Filter size={16} />
                    Filter
                  </button>
                </div>
                <button className="sp-btn-primary flex items-center gap-2">
                  <Plus size={16} />
                  Add Member
                </button>
              </div>

              <div className="glass-card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr className="text-left text-[var(--text-secondary)] text-sm">
                      <th className="p-4">Member</th>
                      <th className="p-4">Tier</th>
                      <th className="p-4">Projects</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Joined</th>
                      <th className="p-4">Actions</th>
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
                          <div className="flex items-center gap-1 text-[var(--sp-accent)]">
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
                          <div className="flex gap-2">
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                    <input 
                      type="text"
                      placeholder="Search projects..."
                      className="input-glass pl-10 pr-4 py-2 w-64"
                    />
                  </div>
                  <button className="sp-btn-glass flex items-center gap-2">
                    <Filter size={16} />
                    Filter
                  </button>
                </div>
                <button className="sp-btn-primary flex items-center gap-2">
                  <Plus size={16} />
                  New Project
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="glass-card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{project.title}</h3>
                        <p className="text-[var(--text-secondary)] text-sm">{project.client}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6 mb-4 text-sm">
                      <span className="text-[var(--sp-accent)] font-medium">{project.budget}</span>
                      <span className="text-[var(--text-secondary)] flex items-center gap-1">
                        <Users size={14} />
                        {project.members} members
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
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

                    <div className="flex gap-2">
                      <button className="sp-btn-glass flex-1 flex items-center justify-center gap-2">
                        <Eye size={16} />
                        View
                      </button>
                      <button className="sp-btn-glass flex items-center justify-center gap-2">
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
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input 
                    type="text"
                    placeholder="Search applications..."
                    className="input-glass pl-10 pr-4 py-2 w-64"
                  />
                </div>
                <select className="input-glass px-4 py-2">
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="glass-card p-6">
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="glass-light rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C89F5E] to-[#8B7355] flex items-center justify-center">
                          <span className="text-[var(--text-inverse)] font-semibold">{app.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="text-[var(--text-primary)] font-medium">{app.name}</h4>
                          <p className="text-[var(--text-secondary)] text-sm">{app.email} • {app.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[var(--text-secondary)] text-sm">{app.date}</span>
                        <span className={`px-3 py-1 rounded-full text-xs ${getStatusBadge(app.status)}`}>
                          {app.status.replace('_', ' ')}
                        </span>
                        <div className="flex gap-2">
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
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Revenue Overview</h3>
                  <div className="text-3xl font-bold text-[var(--sp-accent)] mb-2">KSh 628,800</div>
                  <p className="text-green-400 text-sm flex items-center gap-1">
                    <TrendingUp size={14} />
                    +23% from last month
                  </p>
                </div>
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Active Members</h3>
                  <div className="text-3xl font-bold text-[var(--sp-accent)] mb-2">486</div>
                  <p className="text-green-400 text-sm flex items-center gap-1">
                    <TrendingUp size={14} />
                    +12% from last month
                  </p>
                </div>
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Project Success Rate</h3>
                  <div className="text-3xl font-bold text-[var(--sp-accent)] mb-2">94%</div>
                  <p className="text-green-400 text-sm flex items-center gap-1">
                    <TrendingUp size={14} />
                    +5% from last month
                  </p>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Monthly Activity</h3>
                <div className="h-64 flex items-end gap-4">
                  {[
                    { label: 'Jan', members: 45, projects: 8 },
                    { label: 'Feb', members: 62, projects: 12 },
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
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-2 block">Platform Name</label>
                    <input type="text" defaultValue="Strategic Pathways" className="input-glass w-full px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-2 block">Contact Email</label>
                    <input type="email" defaultValue="hello@joinstrategicpathways.com" className="input-glass w-full px-4 py-2" />
                  </div>
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-2 block">Default Currency</label>
                    <select className="input-glass w-full px-4 py-2">
                      <option value="KES">Kenyan Shilling (KSh)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Membership Tiers</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Community', price: 'Free', features: 3 },
                    { name: 'Professional', price: 'KSh 1,200/year', features: 6 },
                    { name: 'Firm', price: 'Custom', features: 8 },
                  ].map((tier, i) => (
                    <div key={i} className="glass-light rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-[var(--text-primary)] font-medium">{tier.name}</h4>
                        <p className="text-[var(--text-secondary)] text-sm">{tier.features} features • {tier.price}</p>
                      </div>
                      <button className="sp-btn-glass text-sm">Edit</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Notifications</h3>
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
                <button className="sp-btn-primary flex-1">Save Changes</button>
                <button className="sp-btn-secondary">Cancel</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
