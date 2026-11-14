"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CSTLogo from '@/components/CSTLogo';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles, 
  RefreshCw,
  KeyRound,
  ShieldCheck,
  Mail
} from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const e = params.get('email');
      const o = params.get('otp');
      if (e) setEmail(e);
      if (o) setOtp(o);
    }
  }, []);

  const generateStrong = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let res = '';
    for (let i = 0; i < 12; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(res);
    setConfirmPassword(res);
    setShowPassword(true);
  };

  const handleResendOtp = async () => {
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter your email address to receive an OTP.');
      return;
    }
    setResending(true);
    setResendNotice(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendNotice(`A new 6-digit OTP code has been dispatched to ${email}. Check your inbox.`);
        setTimeout(() => setResendNotice(null), 5000);
      } else {
        setErrorMessage(data.error || 'Failed to resend code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error connecting to server.');
    } finally {
      setResending(false);
    }
  };

  // Password Strength Criteria
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const score = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter your valid registered email address.');
      return;
    }

    if (!otp || otp.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Also update local storage if user exists locally
        if (typeof window !== 'undefined' && data.newHash) {
          try {
            const raw = localStorage.getItem('cst_users_v1');
            if (raw) {
              const users = JSON.parse(raw);
              const idx = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
              if (idx !== -1) {
                users[idx].password_hash = data.newHash;
                localStorage.setItem('cst_users_v1', JSON.stringify(users));
              }
            }
          } catch (err) {
            console.warn(err);
          }
        }

        setSuccessMessage('Verification successful! Password updated. Redirecting to login...');
        setTimeout(() => {
          router.push('/client');
        }, 2000);
      } else {
        setErrorMessage(data.error || 'Invalid or expired verification code. Please check your email.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error verifying code.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between py-2">
        <Link href="/">
          <CSTLogo size={36} showText={true} />
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Card */}
      <main className="max-w-md w-full mx-auto my-auto bg-white dark:bg-navy-900 border border-slate-200 dark:border-cyan-800/60 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/10">
            <ShieldCheck className="w-7 h-7 text-cyan-500" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">OTP Security Verification</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter the 6-digit OTP code sent to your registered email address to set your new password.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-mono text-red-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {resendNotice && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-mono text-emerald-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{resendNotice}</span>
          </div>
        )}

        {successMessage ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Password Reset Complete!</h3>
            <p className="text-xs text-slate-500 font-mono">Redirecting you to the Client Hub login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:border-cyan-500 focus:outline-none font-mono"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* 6-Digit OTP */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                  6-Digit Email OTP
                </label>
                <button
                  type="button"
                  disabled={resending}
                  onClick={handleResendOtp}
                  className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                  <span>Resend Code</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-xl text-lg font-mono tracking-[0.5em] font-bold focus:border-cyan-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                Check your inbox and spam folder for the verification code (valid for 10 minutes).
              </p>
            </div>

            {/* New Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                  New Password
                </label>
                <button
                  type="button"
                  onClick={generateStrong}
                  className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate Strong</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:border-cyan-500 focus:outline-none font-mono"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:border-cyan-500 focus:outline-none font-mono"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Live Strength Checklist */}
            {newPassword.length > 0 && (
              <div className="p-3 bg-slate-50 dark:bg-navy-950/70 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-[11px] font-mono">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Password Security:</span>
                  <span className={score >= 4 ? 'text-emerald-500 font-bold' : score >= 2 ? 'text-amber-500' : 'text-red-500'}>
                    {score >= 4 ? 'Strong' : score >= 2 ? 'Moderate' : 'Weak'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-slate-600 dark:text-slate-400 pt-1">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-500' : ''}`}>
                    <Check className={`w-3 h-3 ${hasMinLength ? 'opacity-100' : 'opacity-30'}`} />
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-500' : ''}`}>
                    <Check className={`w-3 h-3 ${hasUpper ? 'opacity-100' : 'opacity-30'}`} />
                    <span>Uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-500' : ''}`}>
                    <Check className={`w-3 h-3 ${hasLower ? 'opacity-100' : 'opacity-30'}`} />
                    <span>Lowercase (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-500' : ''}`}>
                    <Check className={`w-3 h-3 ${hasNumber ? 'opacity-100' : 'opacity-30'}`} />
                    <span>Number (0-9)</span>
                  </div>
                </div>

                {confirmPassword.length > 0 && (
                  <div className={`pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-500' : 'text-red-500'}`}>
                    <Check className={`w-3 h-3 ${passwordsMatch ? 'opacity-100' : 'opacity-30'}`} />
                    <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || (confirmPassword.length > 0 && !passwordsMatch) || otp.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-sky-500 text-white dark:text-navy-950 font-bold text-xs font-mono rounded-xl hover:from-cyan-400 hover:to-sky-400 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying OTP & Saving...</span>
                </>
              ) : (
                <span>Verify OTP & Set New Password</span>
              )}
            </button>
          </form>
        )}

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <Link
            href="/client"
            className="text-xs text-slate-500 hover:text-cyan-500 font-mono flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Client Sign In</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs font-mono text-slate-500 py-4">
        Circuit Serve Technologies • Surampalem, Andhra Pradesh, India
      </footer>
    </div>
  );
}
