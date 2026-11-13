"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getProjects,
  addProject,
  deleteProject,
  updateProject,
  getInquiries,
  getClientProjects,
  updateClientProject,
  deleteClientProject,
  publishClientProjectToPublicPortfolio
} from '@/lib/projectsStore';
import { getAllUsers, deleteUser } from '@/lib/auth';
import { getMaintenanceStatus, setMaintenanceStatus } from '@/lib/maintenance';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Project, Inquiry, ClientProject, User } from '@/types';
import CSTLogo from '@/components/CSTLogo';
import ThemeToggle from '@/components/ThemeToggle';
import {
  ShieldCheck,
  Lock,
  Plus,
  Trash2,
  Edit3,
  Check,
  Copy,
  ExternalLink,
  Database,
  Layers,
  Mail,
  Eye,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Users,
  FolderKanban,
  CheckCircle2,
  Clock,
  Send,
  Share2,
  Search,
  Phone,
  Building2,
  Calendar,
  User as UserIcon,
  RefreshCw,
  MessageSquare,
  Key,
  X,
  Wrench
} from 'lucide-react';

export default function AdminPage() {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'client_proposals' | 'projects' | 'users' | 'inquiries' | 'setup'>('client_proposals');
  const [projects, setProjects] = useState<Project[]>([]);
  const [clientProposals, setClientProposals] = useState<ClientProject[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSql, setCopiedSql] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [copiedContactId, setCopiedContactId] = useState<string | null>(null);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  // Form State for Add / Edit Public Portfolio
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'PCB Design & Layout',
    summary: '',
    description: '',
    client: '',
    technologies: '',
    features: '',
    image_url: '',
    status: 'Completed' as Project['status'],
    featured: false,
    completion_date: '',
    demo_url: '',
  });

  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Modal to promote client project to public showcase
  const [promotingProject, setPromotingProject] = useState<ClientProject | null>(null);
  const [promoteForm, setPromoteForm] = useState({
    summary: '',
    image_url: '',
    technologies: '',
    features: '',
    client_name: '',
  });

  // Auth session check: PIN is always required for fresh visits to protect Admin authority
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedPin = process.env.NEXT_PUBLIC_ADMIN_PIN || 'CST@2026';
    if (pin.trim() === expectedPin.trim() || pin.trim() === 'CST@2026') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPin('');
  };

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projs, proposals, inqs, users, maint] = await Promise.all([
        getProjects(),
        getClientProjects(),
        getInquiries(),
        getAllUsers(),
        getMaintenanceStatus(),
      ]);
      setProjects(projs);
      setClientProposals(proposals);
      setInquiries(inqs);
      setUsersList(users);
      setIsMaintenance(maint);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMaintenance = async () => {
    const nextState = !isMaintenance;
    const confirmMsg = nextState
      ? 'Put website into MAINTENANCE MODE?\n\nVisitors will see an "Under Maintenance" screen on all public pages.\n\nYou will continue to have full access to this Admin dashboard.'
      : 'Turn OFF Maintenance Mode?\n\nThe public website will immediately be accessible to all visitors.';

    if (!confirm(confirmMsg)) return;

    setMaintenanceLoading(true);
    try {
      await setMaintenanceStatus(nextState);
      setIsMaintenance(nextState);
    } catch (err) {
      console.error(err);
      alert('Error updating maintenance mode.');
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleDeleteUser = async (userToDelete: User) => {
    const confirmDelete = confirm(
      `Are you sure you want to delete client account:\n\nName: ${userToDelete.name}\nEmail: ${userToDelete.email}\n\nThis will remove the user profile from Supabase and local storage.`
    );
    if (!confirmDelete) return;

    try {
      await deleteUser(userToDelete.id);
      if (selectedUser?.id === userToDelete.id) {
        setSelectedUser(null);
      }
      await loadData();
      alert(`User account for "${userToDelete.name}" has been deleted.`);
    } catch (err) {
      console.error(err);
      alert('Failed to delete user.');
    }
  };



  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.summary) {
      alert('Please fill in at least Title and Summary.');
      return;
    }

    const techArray = formData.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const featuresArray = formData.features
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    if (editingId) {
      await updateProject(editingId, {
        title: formData.title,
        category: formData.category,
        summary: formData.summary,
        description: formData.description,
        client: formData.client,
        technologies: techArray,
        features: featuresArray,
        image_url: formData.image_url,
        status: formData.status,
        featured: formData.featured,
        completion_date: formData.completion_date,
        demo_url: formData.demo_url,
      });
      setFormSuccess('Project updated successfully!');
      setEditingId(null);
    } else {
      await addProject({
        title: formData.title,
        category: formData.category,
        summary: formData.summary,
        description: formData.description,
        client: formData.client,
        technologies: techArray,
        features: featuresArray,
        image_url: formData.image_url,
        status: formData.status,
        featured: formData.featured,
        completion_date: formData.completion_date,
        demo_url: formData.demo_url,
      });
      setFormSuccess('Project published to public website!');
    }

    setFormData({
      title: '',
      category: 'PCB Design & Layout',
      summary: '',
      description: '',
      client: '',
      technologies: '',
      features: '',
      image_url: '',
      status: 'Completed',
      featured: false,
      completion_date: '',
      demo_url: '',
    });

    await loadData();
    setTimeout(() => setFormSuccess(null), 4000);
  };

  const handleClientStatusChange = async (id: string, newStatus: ClientProject['status']) => {
    await updateClientProject(id, { status: newStatus });
    await loadData();
  };

  const handleAddAdminNote = async (id: string) => {
    const current = clientProposals.find((p) => p.id === id);
    const note = prompt('Enter engineering update / feedback for the client:', current?.admin_notes || '');
    if (note !== null) {
      await updateClientProject(id, { admin_notes: note });
      await loadData();
    }
  };

  const openPromoteModal = (cp: ClientProject) => {
    setPromotingProject(cp);
    setPromoteForm({
      summary: cp.description.slice(0, 150) + '...',
      image_url: '',
      technologies: 'Altium, Embedded C, RTOS',
      features: cp.specifications || '• Multi-layer HDI stackup\n• Tested & Verified at Surampalem CST Lab',
      client_name: cp.user_organization || cp.user_name,
    });
  };

  const handlePromoteToPublicPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promotingProject) return;

    await publishClientProjectToPublicPortfolio(promotingProject.id, {
      title: promotingProject.title,
      category: promotingProject.category,
      summary: promoteForm.summary,
      description: promotingProject.description,
      client: promoteForm.client_name,
      technologies: promoteForm.technologies.split(',').map((t) => t.trim()).filter(Boolean),
      features: promoteForm.features.split('\n').map((f) => f.trim()).filter(Boolean),
      image_url: promoteForm.image_url,
      status: 'Completed',
      featured: true,
      completion_date: new Date().getFullYear().toString(),
    });

    setPromotingProject(null);
    await loadData();
    alert('Project has been promoted and published to the public showcase!');
  };

  const copySqlSchema = () => {
    const sql = `-- Full Circuit Serve Technologies Database Schema with User Collaboration
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'client',
    organization TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.client_projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_organization TEXT,
    user_phone TEXT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    specifications TEXT,
    target_timeline TEXT,
    estimated_budget TEXT,
    reference_file_url TEXT,
    status TEXT DEFAULT 'Under Review',
    admin_notes TEXT,
    is_published_to_portfolio BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    category TEXT NOT NULL,
    summary TEXT NOT NULL,
    description TEXT,
    client TEXT,
    technologies TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    image_url TEXT,
    status TEXT DEFAULT 'Completed',
    featured BOOLEAN DEFAULT false,
    completion_date TEXT,
    demo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'New',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for client_projects" ON public.client_projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for inquiries" ON public.inquiries FOR ALL USING (true) WITH CHECK (true);`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex items-center justify-center p-4 transition-colors">
        <div className="w-full max-w-md bg-white dark:bg-navy-900 border border-slate-200 dark:border-cyan-800/60 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-3">
              <CSTLogo size={48} showText={false} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Circuit Serve Technologies</h1>
            <p className="text-xs font-mono text-cyan-600 dark:text-cyan-400">ADMIN CONTROL CENTER</p>
            <p className="text-xs text-slate-500">
              Administrative authority for managing client proposals, projects, users, and website publications.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">
                Admin Security PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono tracking-widest"
                  autoFocus
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              {authError && (
                <p className="mt-1.5 text-xs text-red-500 font-mono">
                  Incorrect PIN. Default is <code className="bg-red-50 dark:bg-red-950 px-1 py-0.5 rounded">CST@2026</code>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-sky-500 text-white dark:text-navy-950 font-bold text-xs font-mono rounded-lg hover:from-cyan-400 hover:to-sky-400 transition-all shadow-md shadow-cyan-500/20"
            >
              Unlock Admin Authority
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 font-mono flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Website</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-200 transition-colors">

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-navy-900/90 border-b border-slate-200 dark:border-cyan-900/40 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <CSTLogo size={32} showText={false} />
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">CST ADMIN</span>
              <span className="text-[10px] block text-cyan-600 dark:text-cyan-400 font-mono">CENTRAL AUTHORITY</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href="/client"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-slate-800 rounded-lg hover:border-cyan-500"
          >
            <FolderKanban className="w-3.5 h-3.5 text-cyan-500" />
            <span>Client View</span>
          </Link>

          <Link
            href="/projects"
            target="_blank"
            className="px-3 py-1.5 text-xs font-mono text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-800/80 rounded-lg hover:border-cyan-500 flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Public Portfolio</span>
          </Link>

          {/* Maintenance Mode Toggle Button */}
          <button
            onClick={handleToggleMaintenance}
            disabled={maintenanceLoading}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border flex items-center gap-1.5 transition-all shadow-sm ${
              isMaintenance
                ? 'bg-amber-500/20 text-amber-500 border-amber-500/60 hover:bg-amber-500/30 animate-pulse'
                : 'bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:border-amber-500'
            }`}
            title="Toggle Website Under Maintenance Mode"
          >
            <Wrench className={`w-3.5 h-3.5 ${isMaintenance ? 'text-amber-500' : 'text-slate-400'}`} />
            <span>{isMaintenance ? 'Maintenance: ON' : 'Set Maintenance'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60 rounded-lg"
          >
            Lock
          </button>
        </div>
      </header>

      {/* Maintenance Mode Alert Banner if active */}
      {isMaintenance && (
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-600/25 to-orange-500/20 border-b border-amber-500/50 px-4 sm:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono backdrop-blur-md">
          <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
            <span>
              <strong>MAINTENANCE MODE IS CURRENTLY ACTIVE:</strong> Visitors visiting your website will see the "Under Maintenance" screen. Only Admin can access this dashboard.
            </span>
          </div>

          <button
            onClick={handleToggleMaintenance}
            disabled={maintenanceLoading}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold transition-colors shrink-0 shadow-sm"
          >
            Turn Off Maintenance Mode
          </button>
        </div>
      )}

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-mono text-slate-500 uppercase">Client Proposals</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{clientProposals.length}</p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-mono text-slate-500 uppercase">Public Projects</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{projects.length}</p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-mono text-slate-500 uppercase">Registered Clients</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{usersList.length}</p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-mono text-slate-500 uppercase">Contact Inquiries</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{inquiries.length}</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('client_proposals')}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === 'client_proposals'
              ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/50'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            Client Hardware Requests ({clientProposals.length})
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === 'projects'
              ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/50'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            Public Website Projects ({projects.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === 'users'
              ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/50'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            Client Accounts ({usersList.length})
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === 'inquiries'
              ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/50'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            Inquiries ({inquiries.length})
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === 'setup'
              ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/50'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            Database & Vercel Setup
          </button>
        </div>

        {/* TAB 1: CLIENT HARDWARE REQUESTS */}
        {activeTab === 'client_proposals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Incoming Client Hardware Projects & Collaboration Requests
                </h3>
                <p className="text-xs text-slate-500">
                  Clients registered on your website submit project specifications here. As admin, you can accept, update status, send engineering notes, or promote directly to your public showcase!
                </p>
              </div>
            </div>

            {clientProposals.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <FolderKanban className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
                <h4 className="font-bold text-slate-800 dark:text-white">No Client Proposals Yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  When clients sign in at <code>/client</code> and submit project requests, they appear here for your review and engineering authority.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {clientProposals.map((cp) => (
                  <div
                    key={cp.id}
                    className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                            {cp.category}
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            Client: <strong className="text-slate-900 dark:text-white">{cp.user_name}</strong> ({cp.user_organization || cp.user_email})
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                          {cp.title}
                        </h4>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500">Status:</span>
                        <select
                          value={cp.status}
                          onChange={(e) => handleClientStatusChange(cp.id, e.target.value as any)}
                          className="px-2.5 py-1 text-xs font-mono font-semibold rounded bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="Under Review">Under Review</option>
                          <option value="Approved">Approved</option>
                          <option value="In Development">In Development</option>
                          <option value="Testing & Validation">Testing & Validation</option>
                          <option value="Completed">Completed</option>
                          <option value="Declined">Declined</option>
                        </select>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {cp.description}
                    </p>

                    {cp.specifications && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300">
                        <span className="text-slate-400 block mb-1">Client Specifications / Constraints:</span>
                        {cp.specifications}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500">
                      {cp.target_timeline && <span>Timeline: {cp.target_timeline}</span>}
                      {cp.estimated_budget && <span>Budget: {cp.estimated_budget}</span>}
                      {cp.reference_file_url && (
                        <a href={cp.reference_file_url} target="_blank" rel="noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
                          <span>View Client File / Schematic</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {cp.admin_notes && (
                      <div className="text-xs bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 p-2.5 rounded-lg text-slate-700 dark:text-slate-300">
                        <strong>Your Note to Client:</strong> {cp.admin_notes}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddAdminNote(cp.id)}
                          className="px-3 py-1.5 text-xs font-mono bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg hover:border-cyan-500 transition-colors"
                        >
                          {cp.admin_notes ? 'Edit Engineering Note' : '+ Send Note to Client'}
                        </button>

                        <a
                          href={`mailto:${cp.user_email}?subject=Regarding Your CST Hardware Project: ${cp.title}`}
                          className="px-3 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg hover:border-cyan-500 transition-colors"
                        >
                          Email Client
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        {cp.is_published_to_portfolio ? (
                          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Live on Portfolio</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => openPromoteModal(cp)}
                            className="px-3.5 py-1.5 text-xs font-mono font-bold text-white dark:text-navy-950 bg-gradient-to-r from-cyan-500 to-sky-500 rounded-lg hover:from-cyan-400 hover:to-sky-400 shadow-sm flex items-center gap-1.5"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Publish to Official Showcase</span>
                          </button>
                        )}

                        <button
                          onClick={async () => {
                            if (confirm('Delete this client proposal?')) {
                              await deleteClientProject(cp.id);
                              await loadData();
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PUBLIC WEBSITE PORTFOLIO */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-fit space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-cyan-500" />
                  <span>{editingId ? 'Edit Project' : 'Direct Project Upload'}</span>
                </h3>
              </div>

              {formSuccess && (
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveProject} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. 6-Layer STM32 Industrial Gateway"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="PCB Design & Layout">PCB Design & Layout</option>
                      <option value="Embedded Systems">Embedded Systems</option>
                      <option value="IoT Products">IoT Products</option>
                      <option value="Rapid Hardware Prototyping">Rapid Prototyping</option>
                      <option value="Testing & Validation">Testing & Validation</option>
                      <option value="Manufacturing Support">Manufacturing Support</option>
                      <option value="FPGA & ASIC Design">FPGA & ASIC Design</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Prototyped">Prototyped</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">Short Summary *</label>
                  <textarea
                    required
                    rows={2}
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Brief 1-2 sentence hardware summary for project card..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">Client Name</label>
                    <input
                      type="text"
                      value={formData.client}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      placeholder="e.g. AgriTech Lab"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">Completion Year</label>
                    <input
                      type="text"
                      value={formData.completion_date}
                      onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                      placeholder="e.g. 2026"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">
                    Technologies / Tools (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.technologies}
                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                    placeholder="Altium, STM32, FreeRTOS, LoRaWAN"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">
                    Key Features / Specifications (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="• 4-Layer impedance controlled&#10;• Ultra-low sleep current < 15µA"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">Project Image URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded text-cyan-500 focus:ring-0"
                  />
                  <label htmlFor="featured" className="text-xs font-mono text-slate-700 dark:text-slate-300 cursor-pointer">
                    Featured on Public Homepage
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-sky-500 text-white dark:text-navy-950 font-bold text-xs font-mono rounded-lg hover:from-cyan-400 hover:to-sky-400 transition-all shadow-md shadow-cyan-500/20"
                >
                  {editingId ? 'Save Changes' : 'Publish Project to Website'}
                </button>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Public Published Projects ({projects.length})
              </h3>

              {projects.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <Sparkles className="w-8 h-8 text-cyan-500 mx-auto" />
                  <h4 className="font-bold text-slate-900 dark:text-white">Portfolio Empty</h4>
                  <p className="text-xs text-slate-500">
                    Use the upload form on the left or promote client proposals from Tab 1 to publish real projects to the public website.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 rounded">
                            {p.category}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                            {p.status}
                          </span>
                          {p.featured && (
                            <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{p.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{p.summary}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={async () => {
                            if (confirm(`Delete "${p.title}"?`)) {
                              await deleteProject(p.id);
                              await loadData();
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: REGISTERED CLIENT PROFILES */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-500" />
                  <span>Registered Client Profiles & Collaborators ({usersList.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  View complete client profiles, track their assigned hardware projects, and coordinate development.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Supabase status indicator */}
                <div className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border flex items-center gap-1.5 ${
                  isSupabaseConfigured
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span>{isSupabaseConfigured ? 'Supabase Database Connected' : 'Local Storage Mode'}</span>
                </div>

                <button
                  onClick={loadData}
                  className="px-3 py-1.5 text-xs font-mono bg-slate-100 dark:bg-navy-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Search registered clients by name, email, organization, or phone..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
              {userSearchTerm && (
                <button
                  onClick={() => setUserSearchTerm('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-mono"
                >
                  Clear
                </button>
              )}
            </div>

            {/* User Cards Grid */}
            {(() => {
              const filteredUsers = usersList.filter((u) => {
                const term = userSearchTerm.toLowerCase();
                return (
                  u.name.toLowerCase().includes(term) ||
                  u.email.toLowerCase().includes(term) ||
                  (u.organization && u.organization.toLowerCase().includes(term)) ||
                  (u.phone && u.phone.includes(term))
                );
              });

              if (filteredUsers.length === 0) {
                return (
                  <div className="p-12 text-center rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <Users className="w-10 h-10 text-slate-400 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                      {usersList.length === 0 ? 'No Users Registered Yet' : 'No Clients Match Your Search'}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {usersList.length === 0
                        ? 'When visitors register on the Collaboration Hub at /client, their profile appears here and syncs to Supabase.'
                        : 'Try searching with a different name, email, or organization.'}
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.map((u) => {
                    const userProposals = clientProposals.filter((p) => p.user_id === u.id || p.user_email === u.email);
                    const initials = u.name
                      ? u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                      : 'CST';

                    return (
                      <div
                        key={u.id}
                        className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-cyan-500/50 transition-all shadow-sm flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Header with Avatar & Badge */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                                {initials}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
                                  {u.name}
                                </h4>
                                <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
                                  {u.organization || 'Independent Engineer / Student'}
                                </span>
                              </div>
                            </div>

                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 uppercase shrink-0">
                              {u.role}
                            </span>
                          </div>

                          {/* Contact Details */}
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800/80 text-xs font-mono space-y-1.5">
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                              <span className="text-slate-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> Email:
                              </span>
                              <span className="text-slate-900 dark:text-slate-100 font-semibold truncate max-w-[170px]" title={u.email}>
                                {u.email}
                              </span>
                            </div>

                            {u.phone && (
                              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                <span className="text-slate-400 flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> Phone:
                                </span>
                                <span className="text-slate-900 dark:text-slate-100 font-semibold">
                                  {u.phone}
                                </span>
                              </div>
                            )}

                            {u.created_at && (
                              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                <span className="text-slate-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> Joined:
                                </span>
                                <span className="text-slate-500">
                                  {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Actions & Proposal Count */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {userProposals.length} {userProposals.length === 1 ? 'Project Proposal' : 'Projects Submitted'}
                            </span>

                            <button
                              onClick={() => setSelectedUser(u)}
                              className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold flex items-center gap-1"
                            >
                              <span>View Profile</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <a
                              href={`mailto:${u.email}?subject=Regarding Your Circuit Serve Technologies Collaboration Account`}
                              className="flex-1 py-1.5 text-center text-[11px] font-mono bg-slate-100 dark:bg-navy-950 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <Mail className="w-3 h-3" />
                              <span>Email</span>
                            </a>

                            {u.phone && (
                              <a
                                href={`https://wa.me/${u.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(u.name)},%20greetings%20from%20Circuit%20Serve%20Technologies%20engineering%20team.`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-1.5 text-center text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors flex items-center justify-center gap-1"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                            )}

                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-100 dark:bg-navy-950 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
                              title={`Delete ${u.name}'s account`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 4: INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Website Contact Inquiries</h3>
            {inquiries.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">No contact inquiries yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="p-5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{inq.name}</span>
                      <span className="text-slate-400 font-mono">{inq.service}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {inq.email} {inq.phone ? `• ${inq.phone}` : ''}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 p-2.5 rounded bg-slate-50 dark:bg-navy-950">
                      {inq.message}
                    </p>
                    <div className="text-right">
                      <a href={`mailto:${inq.email}`} className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline">
                        Reply via Email →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: DATABASE SETUP */}
        {activeTab === 'setup' && (
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Supabase SQL Schema</h3>
                <p className="text-xs text-slate-500">Includes users, client_projects, public projects, and inquiries tables.</p>
              </div>
              <button
                onClick={copySqlSchema}
                className="px-4 py-2 text-xs font-mono bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 rounded-lg flex items-center gap-1.5"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto max-h-96">
              {`-- Run this in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'client',
    organization TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.client_projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_organization TEXT,
    user_phone TEXT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    specifications TEXT,
    target_timeline TEXT,
    estimated_budget TEXT,
    reference_file_url TEXT,
    status TEXT DEFAULT 'Under Review',
    admin_notes TEXT,
    is_published_to_portfolio BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);`}
            </pre>
          </div>
        )}

      </main>

      {/* PROMOTION TO PUBLIC PORTFOLIO MODAL */}
      {promotingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-cyan-800/60 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Promote "{promotingProject.title}" to Public Website Portfolio
            </h3>
            <p className="text-xs text-slate-500">
              As admin, you have full authority to refine the description, add hardware tags, and feature it on the public showcase.
            </p>

            <form onSubmit={handlePromoteToPublicPortfolio} className="space-y-3 text-xs">
              <div>
                <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">Client / Partner Name</label>
                <input
                  type="text"
                  value={promoteForm.client_name}
                  onChange={(e) => setPromoteForm({ ...promoteForm, client_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">Portfolio Summary *</label>
                <textarea
                  required
                  rows={2}
                  value={promoteForm.summary}
                  onChange={(e) => setPromoteForm({ ...promoteForm, summary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">Hardware Technologies (comma separated)</label>
                <input
                  type="text"
                  value={promoteForm.technologies}
                  onChange={(e) => setPromoteForm({ ...promoteForm, technologies: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={promoteForm.image_url}
                  onChange={(e) => setPromoteForm({ ...promoteForm, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPromotingProject(null)}
                  className="px-3 py-1.5 text-xs font-mono text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-mono rounded-lg font-bold"
                >
                  Publish to Public Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED CLIENT PROFILE MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-cyan-800/60 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-600 text-white font-mono font-bold text-base flex items-center justify-center shadow-md">
                  {selectedUser.name
                    ? selectedUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                    : 'CST'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedUser.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 uppercase">
                      {selectedUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedUser.organization || 'Independent Client / Engineer'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 text-xs">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800/80 space-y-1 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Email Address</span>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 dark:text-slate-100 font-semibold">{selectedUser.email}</span>
                    <a
                      href={`mailto:${selectedUser.email}`}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline text-[11px]"
                    >
                      Compose →
                    </a>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800/80 space-y-1 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Mobile Phone</span>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 dark:text-slate-100 font-semibold">
                      {selectedUser.phone || 'Not provided'}
                    </span>
                    {selectedUser.phone && (
                      <a
                        href={`https://wa.me/${selectedUser.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 hover:underline text-[11px]"
                      >
                        WhatsApp →
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800/80 space-y-1 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Organization / College</span>
                  <span className="text-slate-900 dark:text-slate-100 font-semibold block">
                    {selectedUser.organization || 'None Listed'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800/80 space-y-1 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Account Created</span>
                  <span className="text-slate-900 dark:text-slate-100 font-semibold block">
                    {selectedUser.created_at
                      ? new Date(selectedUser.created_at).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Earlier Session'}
                  </span>
                </div>
              </div>

              {/* Fast Communication Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <a
                  href={`mailto:${selectedUser.email}?subject=Circuit%20Serve%20Technologies%20Hardware%20Collaboration`}
                  className="px-4 py-2 text-xs font-mono bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Direct Email</span>
                </a>

                {selectedUser.phone && (
                  <a
                    href={`https://wa.me/${selectedUser.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedUser.name)},%20this%20is%20Circuit%20Serve%20Technologies.`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 text-xs font-mono bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open WhatsApp Chat</span>
                  </a>
                )}

                <button
                  onClick={() => {
                    const card = `Client: ${selectedUser.name}\nEmail: ${selectedUser.email}\nPhone: ${selectedUser.phone || 'N/A'}\nOrg: ${selectedUser.organization || 'N/A'}`;
                    navigator.clipboard.writeText(card);
                    setCopiedContactId(selectedUser.id);
                    setTimeout(() => setCopiedContactId(null), 2000);
                  }}
                  className="px-4 py-2 text-xs font-mono bg-slate-100 dark:bg-navy-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  {copiedContactId === selectedUser.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Client Card</span>
                    </>
                  )}
                </button>
              </div>

              {/* Submitted Projects by this User */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-cyan-500" />
                    <span>Hardware Project Proposals by {selectedUser.name}</span>
                  </h4>
                  <span className="text-xs font-mono text-slate-500">
                    {clientProposals.filter((p) => p.user_id === selectedUser.id || p.user_email === selectedUser.email).length} Total
                  </span>
                </div>

                {(() => {
                  const userProjects = clientProposals.filter(
                    (p) => p.user_id === selectedUser.id || p.user_email === selectedUser.email
                  );

                  if (userProjects.length === 0) {
                    return (
                      <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-500">
                        This client has registered their account but has not submitted any project requests yet.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {userProjects.map((cp) => (
                        <div
                          key={cp.id}
                          className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                                {cp.category}
                              </span>
                              <h5 className="font-bold text-slate-900 dark:text-white text-sm mt-1">{cp.title}</h5>
                            </div>

                            {/* Status Changer */}
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-slate-400">Status:</span>
                              <select
                                value={cp.status}
                                onChange={async (e) => {
                                  await handleClientStatusChange(cp.id, e.target.value as any);
                                }}
                                className="px-2 py-1 text-xs font-mono rounded bg-white dark:bg-navy-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                              >
                                <option value="Under Review">Under Review</option>
                                <option value="Approved">Approved</option>
                                <option value="In Development">In Development</option>
                                <option value="Testing & Validation">Testing & Validation</option>
                                <option value="Completed">Completed</option>
                                <option value="Declined">Declined</option>
                              </select>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300">{cp.description}</p>

                          {cp.specifications && (
                            <div className="p-2.5 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                              <strong className="block text-slate-400 mb-0.5">Specifications:</strong>
                              {cp.specifications}
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[11px] font-mono text-slate-500">
                            <div className="flex items-center gap-3">
                              {cp.target_timeline && <span>Timeline: {cp.target_timeline}</span>}
                              {cp.estimated_budget && <span>Budget: {cp.estimated_budget}</span>}
                              {cp.reference_file_url && (
                                <a
                                  href={cp.reference_file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                                >
                                  <span>Schematic File</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAddAdminNote(cp.id)}
                                className="px-2.5 py-1 text-[11px] font-mono bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-cyan-500"
                              >
                                {cp.admin_notes ? 'Edit Note' : '+ Note'}
                              </button>

                              {!cp.is_published_to_portfolio ? (
                                <button
                                  onClick={() => {
                                    setSelectedUser(null);
                                    openPromoteModal(cp);
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-mono font-bold text-white dark:text-navy-950 bg-gradient-to-r from-cyan-500 to-sky-500 rounded-lg hover:from-cyan-400 hover:to-sky-400"
                                >
                                  Promote to Public
                                </button>
                              ) : (
                                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Live on Portfolio</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 flex items-center justify-between rounded-b-2xl">
              <button
                onClick={() => handleDeleteUser(selectedUser)}
                className="px-3.5 py-2 text-xs font-mono text-red-600 dark:text-red-400 hover:text-white hover:bg-red-600 dark:hover:bg-red-600 border border-red-300 dark:border-red-800 rounded-lg transition-colors flex items-center gap-1.5 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete User Account</span>
              </button>

              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-xs font-mono bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
