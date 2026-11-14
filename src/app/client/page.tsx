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
  FolderKanban,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Key
} from 'lucide-react';

/** Generate a strong random password */
function generateStrongPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '@#$!%&*';

  const u1 = upper[Math.floor(Math.random() * upper.length)];
  const l1 = lower[Math.floor(Math.random() * lower.length)];
  const d1 = digits[Math.floor(Math.random() * digits.length)];
  const s1 = symbols[Math.floor(Math.random() * symbols.length)];
  const u2 = upper[Math.floor(Math.random() * upper.length)];
  const l2 = lower[Math.floor(Math.random() * lower.length)];
  const d2 = digits[Math.floor(Math.random() * digits.length)];
  const s2 = symbols[Math.floor(Math.random() * symbols.length)];
  const d3 = digits[Math.floor(Math.random() * digits.length)];
  const l3 = lower[Math.floor(Math.random() * lower.length)];

  const pool = [u1, l1, d1, s1, u2, l2, d2, s2, d3, l3];
  return pool.sort(() => Math.random() - 0.5).join('');
}

/** Evaluate password strength */
function getPasswordStrength(pwd: string): {
  score: number;
  label: string;
  color: string;
  hasLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
} {
  const hasLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

  let score = 0;
  if (pwd.length >= 6) score++;
  if (hasLength) score++;
  if (hasUpper && hasLower) score++;
  if (hasNumber && hasSpecial) score++;

  let label = 'Too Short';
  let color = 'bg-red-500';

  if (score === 1) {
    label = 'Weak (Min. 6 chars)';
    color = 'bg-red-500';
  } else if (score === 2) {
    label = 'Moderate';
    color = 'bg-amber-500';
  } else if (score === 3) {
    label = 'Good';
    color = 'bg-cyan-500';
  } else if (score >= 4) {
    label = 'Strong & Secure';
    color = 'bg-emerald-500';
  }

  return { score, label, color, hasLength, hasUpper, hasLower, hasNumber, hasSpecial };
}

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
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Forgot Password Modal State
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request_otp' | 'verify_otp'>('request_otp');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [forgotShowPass, setForgotShowPass] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) return;

    setForgotLoading(true);
    setForgotError(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setForgotStep('verify_otp');
      } else {
        setForgotError(data.error || 'Failed to dispatch verification code.');
      }
    } catch (err: any) {
      setForgotError(err.message || 'Network error requesting OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      setForgotError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    if (!forgotNewPass || forgotNewPass.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }

    if (forgotNewPass !== forgotConfirmPass) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: forgotOtp.trim(),
          newPassword: forgotNewPass.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (typeof window !== 'undefined' && data.newHash) {
          try {
            const raw = localStorage.getItem('cst_users_v1');
            if (raw) {
              const users = JSON.parse(raw);
              const idx = users.findIndex((u: any) => u.email.toLowerCase() === forgotEmail.toLowerCase());
              if (idx !== -1) {
                users[idx].password_hash = data.newHash;
                localStorage.setItem('cst_users_v1', JSON.stringify(users));
              }
            }
          } catch (err) {
            console.warn(err);
          }
        }

        setForgotSuccess('Security verification passed! Password successfully updated.');
        setTimeout(() => {
          setShowForgotPasswordModal(false);
          setForgotStep('request_otp');
          setForgotOtp('');
          setForgotNewPass('');
          setForgotConfirmPass('');
          setForgotSuccess(null);
          setEmail(forgotEmail);
          setAuthMode('login');
        }, 2200);
      } else {
        setForgotError(data.error || 'Invalid or expired verification code.');
      }
    } catch (err: any) {
      setForgotError(err.message || 'Network error verifying OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSwitchMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthError(null);
    if (mode === 'register') {
      // By default prefill a strong random password so user has a secure default
      const strong = generateStrongPassword();
      setPassword(strong);
      setShowPassword(true);
    } else {
      setPassword('');
      setShowPassword(false);
    }
  };

  const handleGenerateNewPassword = () => {
    const strong = generateStrongPassword();
    setPassword(strong);
    setShowPassword(true);
  };

  const handleCopyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

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
        // Validate all required fields before calling register
        if (!name.trim()) {
          setAuthError('Full name is required.');
          setAuthSubmitting(false);
          return;
        }
        if (!email.trim()) {
          setAuthError('Email address is required.');
          setAuthSubmitting(false);
          return;
        }
        if (!password || password.trim().length < 6) {
          setAuthError('Password must be at least 6 characters long.');
          setAuthSubmitting(false);
          return;
        }
        const res = await register({
          name: name.trim(),
          email: email.trim(),
          organization: organization.trim(),
          phone: phone.trim(),
          password: password.trim(),
        });
        if (!res.success) {
          setAuthError(res.error || 'Registration failed. Please try again.');
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
                    onClick={() => handleSwitchMode('login')}
                    className={`flex-1 py-2 text-xs font-mono font-medium rounded-lg transition-all ${authMode === 'login'
                      ? 'bg-white dark:bg-cyan-950 text-cyan-600 dark:text-cyan-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('register')}
                    className={`flex-1 py-2 text-xs font-mono font-medium rounded-lg transition-all ${authMode === 'register'
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
                          placeholder="Enter Your name"
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
                            placeholder="Enter Organization or College Name"
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
                            placeholder="Enter Your Mobile Number"
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
                      placeholder="Enter Your Register Email"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block font-mono text-slate-700 dark:text-slate-300">
                        Password *
                      </label>
                      {authMode === 'register' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleGenerateNewPassword}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors"
                            title="Generate a new strong password"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>New Strong</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCopyPassword}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
                            title="Copy password to clipboard"
                          >
                            {copiedPassword ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-500 font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={authMode === 'login' ? 'Enter your account password' : 'Enter or use suggested strong password'}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono tracking-wide"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {authMode === 'register' && (
                      <div className="space-y-2 pt-1">
                        {/* Suggested strong password callout */}
                        <div className="p-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 flex items-start gap-2 text-[11px]">
                          <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                          <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            <span className="font-semibold text-cyan-700 dark:text-cyan-300">Strong Password Suggested:</span> We pre-filled a secure default password. You can keep it, click <strong>Copy</strong> to save it, or type your own.
                          </div>
                        </div>

                        {/* Live strength meter */}
                        {(() => {
                          const strength = getPasswordStrength(password);
                          return (
                            <div className="space-y-1.5 p-2 rounded-lg bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <span className="text-slate-500">Password Strength:</span>
                                <span className={`font-bold ${
                                  strength.score >= 4 ? 'text-emerald-500' :
                                  strength.score === 3 ? 'text-cyan-500' :
                                  strength.score === 2 ? 'text-amber-500' : 'text-red-500'
                                }`}>
                                  {strength.label}
                                </span>
                              </div>
                              {/* Progress bar */}
                              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${strength.color}`}
                                  style={{ width: `${Math.min(100, Math.max(15, (strength.score / 4) * 100))}%` }}
                                />
                              </div>
                              {/* Suggestions / Checklist */}
                              <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-500 pt-1">
                                <span className={strength.hasLength ? 'text-emerald-500 font-semibold' : ''}>
                                  {strength.hasLength ? '✓' : '○'} 8+ characters
                                </span>
                                <span className={strength.hasNumber ? 'text-emerald-500 font-semibold' : ''}>
                                  {strength.hasNumber ? '✓' : '○'} Number (0-9)
                                </span>
                                <span className={strength.hasUpper && strength.hasLower ? 'text-emerald-500 font-semibold' : ''}>
                                  {strength.hasUpper && strength.hasLower ? '✓' : '○'} Uppercase & Lowercase
                                </span>
                                <span className={strength.hasSpecial ? 'text-emerald-500 font-semibold' : ''}>
                                  {strength.hasSpecial ? '✓' : '○'} Symbol (@#$!)
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
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
                        onClick={() => {
                          setForgotEmail(email || '');
                          setForgotStep('request_otp');
                          setForgotError(null);
                          setForgotSuccess(null);
                          setForgotOtp('');
                          setShowForgotPasswordModal(true);
                        }}
                        className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-mono inline-flex items-center gap-1"
                      >
                        <Key className="w-3 h-3" />
                        <span>Forgot Password?</span>
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
                    1. Click <strong>"Assign / Request New Project"</strong> to describe your board design, embedded firmware, or IoT requirement.<br />
                    2. Our engineering team at Surampalem will evaluate your specs, generate a technical feasibility quote, and initiate design milestones.<br />
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
                            className={`px-2.5 py-1 text-[11px] font-mono rounded font-semibold uppercase shrink-0 ${p.status === 'Completed'
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

      {/* Forgot Password Modal (High Security 2-Step OTP) */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-navy-900 border border-slate-200 dark:border-cyan-800/60 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                  {forgotStep === 'request_otp' ? 'Password Reset • Security Verification' : 'Verify Email OTP Code'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowForgotPasswordModal(false);
                  setForgotError(null);
                  setForgotSuccess(null);
                }}
                className="text-xs font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            {forgotError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-mono text-red-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-emerald-600 dark:text-emerald-400">Password Reset Complete!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {forgotSuccess}
                </p>
              </div>
            ) : forgotStep === 'request_otp' ? (
              /* STEP 1: Enter Email to Receive OTP */
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-mono">
                  To protect your account against unauthorized changes, a <strong>6-digit security code (OTP)</strong> will be dispatched to your registered email address.
                </p>

                <div>
                  <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">
                    Registered Client Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="client@company.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:border-cyan-500 focus:outline-none font-mono"
                      autoFocus
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="px-3.5 py-2 text-xs font-mono text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotEmail}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-500 text-white dark:text-navy-950 font-bold text-xs font-mono rounded-xl hover:from-cyan-400 hover:to-sky-400 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Dispatching OTP...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send 6-Digit Code</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* STEP 2: Enter OTP Code & Set New Password */
              <form onSubmit={handleVerifyOtpAndReset} className="space-y-4">
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs font-mono text-cyan-600 dark:text-cyan-400 flex items-start gap-2">
                  <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    A 6-digit OTP code has been dispatched to <strong>{forgotEmail}</strong>. Check your inbox (and spam folder). Valid for 10 minutes.
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                      6-Digit Security OTP
                    </label>
                    <button
                      type="button"
                      disabled={forgotLoading}
                      onClick={handleRequestOtp}
                      className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${forgotLoading ? 'animate-spin' : ''}`} />
                      <span>Resend Code</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full text-center py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-xl text-lg font-mono tracking-[0.5em] font-bold focus:border-cyan-500 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono text-slate-700 dark:text-slate-300">
                      New Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const strong = generateStrongPassword();
                        setForgotNewPass(strong);
                        setForgotConfirmPass(strong);
                        setForgotShowPass(true);
                      }}
                      className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generate Strong</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={forgotShowPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={forgotNewPass}
                      onChange={(e) => setForgotNewPass(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:border-cyan-500 focus:outline-none font-mono"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setForgotShowPass(!forgotShowPass)}
                      className="absolute right-3 top-2.5 text-slate-400"
                    >
                      {forgotShowPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={forgotShowPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={forgotConfirmPass}
                      onChange={(e) => setForgotConfirmPass(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:border-cyan-500 focus:outline-none font-mono"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep('request_otp');
                      setForgotOtp('');
                      setForgotError(null);
                    }}
                    className="text-xs font-mono text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    ← Change Email
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || forgotOtp.length !== 6 || !forgotNewPass}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-500 text-white dark:text-navy-950 font-bold text-xs font-mono rounded-xl hover:from-cyan-400 hover:to-sky-400 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying OTP...</span>
                      </>
                    ) : (
                      <span>Verify Code & Set Password</span>
                    )}
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
