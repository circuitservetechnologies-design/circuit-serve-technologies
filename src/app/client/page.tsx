"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';
import { submitClientProject, getClientProjects } from '@/lib/projectsStore';
import { ClientProject } from '@/types';
import { COMPANY_INFO } from '@/lib/constants';
import { 
  Cpu, 
  Plus, 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  FileText, 
  ExternalLink, 
  ArrowRight, 
  Building2, 
  Phone, 
  Mail, 
  Lock, 
  User as UserIcon,
  Sparkles,
  LogOut,
  FolderKanban
} from 'lucide-react';

export default function ClientPortalPage() {
  const { user, login, register, logout, loading: authLoading } = useAuth();
  
  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Projects State
  const [clientProjects, setClientProjects] = useState<ClientProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // New Project Form State
  const [projectForm, setProjectForm] = useState({
    title: '',
    category: 'PCB Design & Layout',
    description: '',
    specifications: '',
    target_timeline: '',
    estimated_budget: '',
    reference_file_url: '',
  });
  const [projectSubmitting, setProjectSubmitting] = useState(false);
  const [projectSuccess, setProjectSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    setLoadingProjects(true);
    const data = await getClientProjects(user.id);
    setClientProjects(data);
    setLoadingProjects(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);

    try {
      if (authMode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setAuthError(res.error || 'Login failed. Please check your credentials.');
        }
      } else {
        if (!name || !email) {
          setAuthError('Name and Email are required.');
          setAuthSubmitting(false);
          return;
        }
        const res = await register({
          name,
          email,
          organization,
          phone,
          password,
        });
        if (!res.success) {
          setAuthError(res.error || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!projectForm.title || !projectForm.description) {
      alert('Please provide project title and description.');
      return;
    }

    setProjectSubmitting(true);
    try {
      await submitClientProject({
        user_id: user.id,
        user_name: user.name,
        user_email: user.email,
        user_organization: user.organization || organization,
        user_phone: user.phone || phone,
        title: projectForm.title,
        category: projectForm.category,
        description: projectForm.description,
        specifications: projectForm.specifications,
        target_timeline: projectForm.target_timeline,
        estimated_budget: projectForm.estimated_budget,
        reference_file_url: projectForm.reference_file_url,
      });

      setProjectSuccess(true);
      setProjectForm({
        title: '',
        category: 'PCB Design & Layout',
        description: '',
        specifications: '',
        target_timeline: '',
        estimated_budget: '',
        reference_file_url: '',
      });
      await loadProjects();
      setTimeout(() => {
        setProjectSuccess(false);
        setShowNewProjectModal(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Error submitting project.');
    } finally {
      setProjectSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* If NOT logged in, show Client Login / Register Portal */}
          {!user ? (
            <div className="max-w-md mx-auto my-8">
              <div className="bg-white dark:bg-navy-900/90 border border-slate-200 dark:border-cyan-800/60 rounded-2xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center mx-auto border border-cyan-300 dark:border-cyan-800 shadow-inner">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Client Collaboration Hub
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Assign and collaborate on hardware projects directly with Circuit Serve Technologies engineering team.
                  </p>
                </div>

                {/* Tab switch */}
                <div className="flex bg-slate-100 dark:bg-navy-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setAuthError(null); }}
                    className={`flex-1 py-2 text-xs font-mono font-medium rounded-lg transition-all ${
                      authMode === 'login'
                        ? 'bg-white dark:bg-cyan-950 text-cyan-600 dark:text-cyan-300 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setAuthError(null); }}
                    className={`flex-1 py-2 text-xs font-mono font-medium rounded-lg transition-all ${
                      authMode === 'register'
                        ? 'bg-white dark:bg-cyan-950 text-cyan-600 dark:text-cyan-300 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {authError && (
                  <div className="p-3 bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs font-sans">
                  {authMode === 'register' && (
                    <>
                      <div>
                        <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">
                            Organization / University
                          </label>
                          <input
                            type="text"
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            placeholder="e.g. Aditya Univ / Tech Startup"
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">
                            Mobile Phone
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765..."
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@company.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={authMode === 'login' ? 'Enter your account password' : 'Create a secure password'}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-sky-500 text-white dark:text-navy-950 font-bold text-xs font-mono rounded-lg hover:from-cyan-400 hover:to-sky-400 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
                  >
                    {authSubmitting
                      ? 'Processing...'
                      : authMode === 'login'
                      ? 'Sign In to Dashboard'
                      : 'Create My Account & Enter Hub'}
                  </button>

                  {/* Forgot Password — only shown on Login tab */}
                  {authMode === 'login' && (
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setAuthError(
                            '🔐 To reset your password, email us at circuitservetechnologies@gmail.com or WhatsApp +91 8985043496 with your registered email address.'
                          )
                        }
                        className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-mono"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </form>

                <div className="pt-2 text-center text-xs text-slate-500">
                  <span>Need instant engineering help? Call CST directly: </span>
                  <a href={`tel:${COMPANY_INFO.contact.rawPhone}`} className="text-cyan-600 dark:text-cyan-400 font-mono font-medium hover:underline">
                    {COMPANY_INFO.contact.phone}
                  </a>
                </div>

              </div>
            </div>
          ) : (
            
            /* If LOGGED IN, show Client Dashboard */
            <div className="space-y-8">
              {/* User Header Bar */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-mono rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                      {user.role === 'admin' ? 'CST Administrator' : 'Client Collaborator'}
                    </span>
                    {user.organization && (
                      <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {user.organization}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Welcome, {user.name}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Logged in as <code className="font-mono text-cyan-600 dark:text-cyan-400">{user.email}</code>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowNewProjectModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold text-white dark:text-navy-950 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Assign / Request New Project</span>
                  </button>

                  <button
                    onClick={logout}
                    className="p-2.5 text-slate-500 hover:text-red-500 bg-slate-100 dark:bg-navy-950 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status / Instructions Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-50 dark:from-navy-900/80 to-sky-50 dark:to-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 flex items-start gap-3.5">
                <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    How CST Hardware Collaboration Works:
                  </p>
                  <p>
                    1. Click <strong>"Assign / Request New Project"</strong> to describe your board design, embedded firmware, or IoT requirement.<br/>
                    2. Our engineering team at Surampalem will evaluate your specs, generate a technical feasibility quote, and initiate design milestones.<br/>
                    3. Track development stages directly below in real time. Upon project completion, your project can be featured in our verified public showcase!
                  </p>
                </div>
              </div>

              {/* Client Projects List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Your Assigned Projects & Requests ({clientProjects.length})
                  </h3>
                  <button
                    onClick={loadProjects}
                    className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    Refresh Status
                  </button>
                </div>

                {loadingProjects ? (
                  <div className="py-12 text-center text-xs font-mono text-slate-500">
                    Loading your projects...
                  </div>
                ) : clientProjects.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <Layers className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
                    <h4 className="font-bold text-slate-800 dark:text-white">No Projects Assigned Yet</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      Ready to build your custom hardware? Submit your project specs, schematic inquiries, or prototyping requirements to collaborate with us.
                    </p>
                    <button
                      onClick={() => setShowNewProjectModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Submit Your First Hardware Project</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clientProjects.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                              {p.category}
                            </span>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                              {p.title}
                            </h4>
                          </div>

                          <span
                            className={`px-2.5 py-1 text-[11px] font-mono rounded font-semibold uppercase shrink-0 ${
                              p.status === 'Completed'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                                : p.status === 'In Development' || p.status === 'Testing & Validation'
                                ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-800'
                                : p.status === 'Approved'
                                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                          {p.description}
                        </p>

                        {/* Specs & Timeline Grid */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800/80 text-[11px] font-mono space-y-1">
                          {p.target_timeline && (
                            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                              <span>Target Timeline:</span>
                              <span className="text-slate-800 dark:text-slate-200 font-semibold">{p.target_timeline}</span>
                            </div>
                          )}
                          {p.estimated_budget && (
                            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                              <span>Estimated Budget:</span>
                              <span className="text-slate-800 dark:text-slate-200 font-semibold">{p.estimated_budget}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span>Project Reference ID:</span>
                            <span className="text-cyan-600 dark:text-cyan-400 truncate max-w-[150px]">{p.id}</span>
                          </div>
                        </div>

                        {p.admin_notes && (
                          <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 rounded-xl text-xs space-y-1">
                            <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300 block">
                              CST Engineering Team Update:
                            </span>
                            <p className="text-slate-700 dark:text-slate-300">{p.admin_notes}</p>
                          </div>
                        )}

                        {p.is_published_to_portfolio && (
                          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Featured on CST Public Website Portfolio</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* NEW PROJECT ASSIGNMENT MODAL */}
      {showNewProjectModal && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-cyan-800/60 rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Assign New Hardware Project to CST
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Submit your engineering specs for high-speed PCB, embedded systems, or IoT development.
                </p>
              </div>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm font-mono"
              >
                ✕
              </button>
            </div>

            {projectSuccess ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Project Request Submitted Successfully!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Our engineering team at Surampalem has received your project details and will review the specifications immediately.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateProject} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    placeholder="e.g. 4-Layer High-Frequency LoRa Edge Gateway"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">
                      Engineering Domain *
                    </label>
                    <select
                      value={projectForm.category}
                      onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="PCB Design & Layout">PCB Design & Layout</option>
                      <option value="Embedded Systems">Embedded Systems & Firmware</option>
                      <option value="IoT Product Development">IoT Product Development</option>
                      <option value="Rapid Hardware Prototyping">Rapid Hardware Prototyping</option>
                      <option value="Testing & Validation">Testing & Validation</option>
                      <option value="Manufacturing Support">Manufacturing Support</option>
                      <option value="FPGA & ASIC Design">FPGA & ASIC Logic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">
                      Target Timeline
                    </label>
                    <input
                      type="text"
                      value={projectForm.target_timeline}
                      onChange={(e) => setProjectForm({ ...projectForm, target_timeline: e.target.value })}
                      placeholder="e.g. 4 Weeks / Q1 2026"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">
                    Project Description & Goals *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    placeholder="Describe what this hardware should do, its target environment, operating conditions, etc..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">
                    Technical Specifications / Constraints (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={projectForm.specifications}
                    onChange={(e) => setProjectForm({ ...projectForm, specifications: e.target.value })}
                    placeholder="e.g. Dimensions: 50x50mm, Input Voltage: 5V USB-C, Preferred MCU: STM32 or ESP32, Battery life: > 1 year"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">
                      Estimated Budget Range
                    </label>
                    <input
                      type="text"
                      value={projectForm.estimated_budget}
                      onChange={(e) => setProjectForm({ ...projectForm, estimated_budget: e.target.value })}
                      placeholder="e.g. ₹25,000 - ₹50,000 or Prototype"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-slate-700 dark:text-slate-300 mb-1">
                      Reference / Schematic Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={projectForm.reference_file_url}
                      onChange={(e) => setProjectForm({ ...projectForm, reference_file_url: e.target.value })}
                      placeholder="Google Drive, Dropbox, or GitHub link"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewProjectModal(false)}
                    className="px-4 py-2 text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={projectSubmitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-500 text-white dark:text-navy-950 font-bold text-xs font-mono rounded-lg hover:from-cyan-400 hover:to-sky-400 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{projectSubmitting ? 'Submitting...' : 'Submit Project to CST'}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
