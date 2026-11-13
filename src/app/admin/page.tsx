"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getProjects, 
  addProject, 
  deleteProject, 
  updateProject, 
  getInquiries 
} from '@/lib/projectsStore';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Project, Inquiry } from '@/types';
import CSTLogo from '@/components/CSTLogo';
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
  AlertCircle
} from 'lucide-react';

export default function AdminPage() {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'projects' | 'inquiries' | 'setup'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSql, setCopiedSql] = useState(false);

  // Form State for Add / Edit
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

  // Check auth session
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('cst_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projs, inqs] = await Promise.all([getProjects(), getInquiries()]);
      setProjects(projs);
      setInquiries(inqs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedPin = process.env.NEXT_PUBLIC_ADMIN_PIN || 'CST@2026';
    if (pin.trim() === expectedPin.trim()) {
      setIsAuthenticated(true);
      sessionStorage.setItem('cst_admin_auth', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('cst_admin_auth');
    setPin('');
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
      // Update existing
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
      // Add new
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
      setFormSuccess('Project added and published successfully!');
    }

    // Reset Form
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

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      title: project.title,
      category: project.category,
      summary: project.summary,
      description: project.description || '',
      client: project.client || '',
      technologies: (project.technologies || []).join(', '),
      features: (project.features || []).join('\n'),
      image_url: project.image_url || '',
      status: project.status,
      featured: project.featured || false,
      completion_date: project.completion_date || '',
      demo_url: project.demo_url || '',
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteProject(id);
      await loadData();
    }
  };

  const copySqlSchema = () => {
    const sql = `-- Run this in Supabase SQL Editor:
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

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Enable all access for projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can submit inquiry" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read and manage for inquiries" ON public.inquiries FOR ALL USING (true) WITH CHECK (true);`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // If not authenticated, show PIN Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Circuit background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-navy-900/90 border border-cyan-800/60 rounded-2xl p-8 backdrop-blur-xl shadow-2xl space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-3">
              <CSTLogo size={48} showText={false} />
            </div>
            <h1 className="text-xl font-bold text-white">Circuit Serve Technologies</h1>
            <p className="text-xs font-mono text-cyan-400">ADMIN CONTROL CENTER</p>
            <p className="text-xs text-slate-400">
              Enter your admin access code to manage projects and review client inquiries.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Admin Security PIN / Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN (Default: CST@2026)"
                  className="w-full pl-10 pr-4 py-2.5 bg-navy-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono tracking-widest placeholder-slate-600"
                  autoFocus
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
              {authError && (
                <p className="mt-1.5 text-xs text-red-400 font-mono">
                  Incorrect PIN. The default code is <code className="bg-red-950 px-1 py-0.5 rounded">CST@2026</code>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-sky-400 text-navy-950 font-semibold text-sm rounded-lg hover:from-cyan-300 hover:to-sky-300 transition-all shadow-md shadow-cyan-500/20"
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-cyan-400 font-mono flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-navy-900/90 border-b border-cyan-900/40 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <CSTLogo size={32} showText={false} />
            <div>
              <span className="font-bold text-sm text-white font-mono">CST ADMIN</span>
              <span className="text-[10px] block text-cyan-400 font-mono">PROJECT & INQUIRY BACKEND</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 text-xs font-mono rounded-full bg-navy-950 border border-slate-800">
            <div className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-slate-400">
              Storage: {isSupabaseConfigured ? 'Supabase Live' : 'Browser Store (Ready for Supabase)'}
            </span>
          </div>

          <Link
            href="/projects"
            target="_blank"
            className="px-3 py-1.5 text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 rounded-lg hover:bg-cyan-900/60 transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live Projects</span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-white bg-slate-800/60 rounded-lg transition-colors"
          >
            Lock
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner if Supabase not yet plugged */}
        {!isSupabaseConfigured && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-300">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
              <span>
                <strong>Local Fallback Active:</strong> You can add and test projects immediately in this browser. To sync live across devices, add your Supabase URL & Key in <code>.env.local</code> or Vercel.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('setup')}
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-600/40 rounded font-mono shrink-0"
            >
              View Supabase SQL Guide
            </button>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-navy-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Published Projects</span>
              <p className="text-2xl font-bold text-white mt-1 font-mono">{projects.length}</p>
            </div>
            <Layers className="w-8 h-8 text-cyan-400/50" />
          </div>

          <div className="p-5 rounded-xl bg-navy-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Contact Inquiries</span>
              <p className="text-2xl font-bold text-white mt-1 font-mono">{inquiries.length}</p>
            </div>
            <Mail className="w-8 h-8 text-sky-400/50" />
          </div>

          <div className="p-5 rounded-xl bg-navy-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Database Status</span>
              <p className="text-sm font-semibold text-emerald-400 mt-1 font-mono">
                {isSupabaseConfigured ? 'Supabase Connected' : 'Local Fallback Online'}
              </p>
            </div>
            <Database className="w-8 h-8 text-emerald-400/50" />
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all ${
              activeTab === 'projects'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Project Management ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all ${
              activeTab === 'inquiries'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Client Inquiries ({inquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all ${
              activeTab === 'setup'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Supabase & Vercel Setup Guide
          </button>
        </div>

        {/* TAB 1: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Column: Add / Edit (5 cols) */}
            <div className="lg:col-span-5 bg-navy-900 border border-slate-800 rounded-2xl p-6 h-fit space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span>{editingId ? 'Edit Project' : 'Upload New Project'}</span>
                </h3>
                {editingId && (
                  <button
                    onClick={() => {
                      setEditingId(null);
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
                    }}
                    className="text-xs font-mono text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {formSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
                <div>
                  <label className="block font-mono text-slate-300 mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. 6-Layer STM32 Industrial Gateway"
                    className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-slate-300 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
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
                    <label className="block font-mono text-slate-300 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Prototyped">Prototyped</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-slate-300 mb-1">Short Summary *</label>
                  <textarea
                    required
                    rows={2}
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Brief 1-2 sentence hardware summary for the project card..."
                    className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-slate-300 mb-1">Client / Partner</label>
                    <input
                      type="text"
                      value={formData.client}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      placeholder="e.g. AgriTech Lab / Internal R&D"
                      className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-slate-300 mb-1">Timeline / Date</label>
                    <input
                      type="text"
                      value={formData.completion_date}
                      onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                      placeholder="e.g. Q3 2026"
                      className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-slate-300 mb-1">
                    Technologies / Tools (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.technologies}
                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                    placeholder="e.g. Altium, STM32, FreeRTOS, LoRaWAN, RS485"
                    className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block font-mono text-slate-300 mb-1">
                    Key Features / Specifications (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="• 4-Layer controlled impedance stackup&#10;• Ultra-low sleep current < 15µA&#10;• Wide 9-36V DC input protection"
                    className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-mono text-slate-300 mb-1">Detailed Description (Optional)</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed explanation of the engineering architecture, challenges solved, and testing protocols applied..."
                    className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block font-mono text-slate-300 mb-1">Project Image URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  />
                  {formData.image_url && (
                    <div className="mt-2 w-full h-24 rounded bg-navy-950 border border-slate-800 overflow-hidden">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-mono text-slate-300 mb-1">Reference / Schematic URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.demo_url}
                    onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                    placeholder="https://github.com/... or cloud doc link"
                    className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded bg-navy-950 border-slate-700 text-cyan-400 focus:ring-0"
                  />
                  <label htmlFor="featured" className="text-xs font-mono text-slate-300 cursor-pointer">
                    Mark as Featured Project on Homepage
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-sky-400 text-navy-950 font-bold text-xs font-mono rounded-lg hover:from-cyan-300 hover:to-sky-300 transition-all shadow-md shadow-cyan-500/20"
                >
                  {editingId ? 'Save Changes' : 'Publish Project to Website'}
                </button>
              </form>
            </div>

            {/* List Column: Existing Projects (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">
                  Current Projects ({projects.length})
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {projects.length === 0 ? 'Portfolio Empty' : 'Live on Website'}
                </span>
              </div>

              {projects.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-navy-900 border border-slate-800 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-800">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">No Projects Uploaded Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    As requested, no demo projects are published. Fill out the form on the left to publish your first real Circuit Serve Technologies project!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-4 rounded-xl bg-navy-900 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
                    >
                      <div className="space-y-1 max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/80 rounded">
                            {proj.category}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                            {proj.status}
                          </span>
                          {proj.featured && (
                            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
                              Featured
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-white text-sm">{proj.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1">{proj.summary}</p>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.technologies.map((t, idx) => (
                              <span key={idx} className="text-[10px] font-mono text-slate-400 bg-navy-950 px-1.5 py-0.2 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => startEdit(proj)}
                          className="p-2 text-slate-400 hover:text-cyan-300 bg-navy-950 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
                          title="Edit Project"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(proj.id, proj.title)}
                          className="p-2 text-slate-400 hover:text-red-400 bg-navy-950 hover:bg-red-950/40 rounded-lg border border-slate-800 transition-colors"
                          title="Delete Project"
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

        {/* TAB 2: INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            <h3 className="font-bold text-white text-base">Client Messages & Inquiries</h3>

            {inquiries.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-navy-900 border border-slate-800 space-y-2">
                <Mail className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Inquiries Yet</h4>
                <p className="text-xs text-slate-400">
                  When visitors submit inquiries through the contact section, they will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="p-5 rounded-xl bg-navy-900 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{inq.name}</span>
                      <span className="text-slate-500 font-mono">
                        {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <div className="text-xs font-mono space-y-1 text-slate-300">
                      <div>Email: <a href={`mailto:${inq.email}`} className="text-cyan-400 hover:underline">{inq.email}</a></div>
                      {inq.phone && <div>Phone: <a href={`tel:${inq.phone}`} className="text-cyan-400 hover:underline">{inq.phone}</a></div>}
                      {inq.service && <div className="text-sky-300">Service: {inq.service}</div>}
                    </div>

                    <div className="p-3 rounded-lg bg-navy-950 border border-slate-800/80 text-xs text-slate-300 whitespace-pre-wrap">
                      {inq.message}
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                        Status: {inq.status || 'New'}
                      </span>
                      <a
                        href={`mailto:${inq.email}?subject=Regarding your CST Inquiry on ${inq.service || 'Hardware Solutions'}`}
                        className="text-xs font-mono text-cyan-400 hover:underline"
                      >
                        Reply via Email →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SETUP GUIDE */}
        {activeTab === 'setup' && (
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Supabase & Vercel Deployment Instructions</h3>
              <p className="text-xs text-slate-400 mt-1">
                Follow these three simple steps to connect Supabase and deploy live on Vercel.
              </p>
            </div>

            {/* Step 1 */}
            <div className="p-5 rounded-xl bg-navy-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-900 text-cyan-300 flex items-center justify-center text-xs">1</span>
                  Create Supabase Database & Tables
                </h4>
                <button
                  onClick={copySqlSchema}
                  className="px-3 py-1.5 text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-lg hover:bg-cyan-900 transition-colors flex items-center gap-1.5"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-300">
                1. Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">supabase.com</a> and create a free project named <code>circuit-serve-technologies</code>.<br/>
                2. In the Supabase dashboard sidebar, click <strong>SQL Editor</strong> &gt; <strong>New Query</strong>.<br/>
                3. Click <strong>Copy SQL Schema</strong> above, paste it in the editor, and click <strong>Run</strong>.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-xl bg-navy-950 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-900 text-cyan-300 flex items-center justify-center text-xs">2</span>
                Retrieve Your Supabase API Keys
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                In your Supabase project, go to <strong>Project Settings</strong> &gt; <strong>API</strong>.<br/>
                Copy the <strong>Project URL</strong> and the <strong>anon public API key</strong>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-xl bg-navy-950 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-900 text-cyan-300 flex items-center justify-center text-xs">3</span>
                Deploy on Vercel
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                1. Push your repository to GitHub (or import directly from Vercel CLI / Dashboard).<br/>
                2. Go to <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">vercel.com</a> &gt; <strong>Add New Project</strong>.<br/>
                3. Under <strong>Environment Variables</strong>, add:
              </p>

              <div className="p-3 bg-black/60 rounded-lg font-mono text-xs text-slate-300 space-y-1">
                <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh......</div>
                <div>NEXT_PUBLIC_ADMIN_PIN=CST@2026 (or your custom secret code)</div>
              </div>

              <p className="text-xs text-slate-400">
                Click <strong>Deploy</strong> and your official startup website will be live worldwide on Vercel in seconds!
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
