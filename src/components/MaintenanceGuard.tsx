"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import CSTLogo from './CSTLogo';
import ThemeToggle from './ThemeToggle';
import { getMaintenanceStatus } from '@/lib/maintenance';
import { COMPANY_INFO } from '@/lib/constants';
import { 
  Wrench, 
  Cpu, 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  RefreshCw, 
  ShieldAlert, 
  Lock,
  ArrowRight
} from 'lucide-react';

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [checking, setChecking] = useState(true);

  // Admin routes are NEVER blocked by maintenance mode
  const isAdminRoute = pathname?.startsWith('/admin');

  const checkStatus = async () => {
    try {
      const active = await getMaintenanceStatus();
      setIsMaintenance(active);
    } catch (e) {
      console.warn(e);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();

    // Listen to maintenance toggle events in real-time
    const handleToggle = (e: any) => {
      if (typeof e.detail?.enabled === 'boolean') {
        setIsMaintenance(e.detail.enabled);
      } else {
        checkStatus();
      }
    };

    window.addEventListener('cst_maintenance_toggle', handleToggle);
    window.addEventListener('storage', checkStatus);

    return () => {
      window.removeEventListener('cst_maintenance_toggle', handleToggle);
      window.removeEventListener('storage', checkStatus);
    };
  }, []);

  // If on admin page or maintenance is not active, render normal website
  if (isAdminRoute || !isMaintenance) {
    return <>{children}</>;
  }

  // If maintenance is active, render the Maintenance Screen
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-navy-950 relative overflow-hidden">
      {/* Background Circuit Grid Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#082f4915_1px,transparent_1px),linear-gradient(to_bottom,#082f4915_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Top Bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CSTLogo size={36} showText={true} />
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center space-y-8 my-auto">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>SCHEDULED SYSTEM MAINTENANCE IN PROGRESS</span>
        </div>

        {/* Icon & Heading */}
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-950 via-slate-900 to-navy-900 border border-cyan-800/60 flex items-center justify-center shadow-2xl shadow-cyan-500/10">
            <Wrench className="w-10 h-10 text-cyan-400 animate-bounce" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineering Upgrades <br />
            <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">
              In Progress
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Circuit Serve Technologies is currently upgrading our digital collaboration portal and backend engineering systems. We will be back online shortly!
          </p>
        </div>

        {/* Reassurance Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 max-w-lg mx-auto text-left space-y-2 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
            <Cpu className="w-4 h-4" />
            <span>Lab Operations Notice:</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            All active PCB prototyping, embedded firmware development, and hardware fabrication at our <strong>Surampalem facility</strong> continue without interruption.
          </p>
        </div>

        {/* Direct Contact Options */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-mono text-slate-400">Need urgent engineering assistance or project updates?</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`tel:${COMPANY_INFO.contact.rawPhone}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call CST: {COMPANY_INFO.contact.phone}</span>
            </a>

            <a
              href={`https://wa.me/91${COMPANY_INFO.contact.rawPhone}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Us</span>
            </a>

            <a
              href={`mailto:${COMPANY_INFO.contact.email}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition-all border border-slate-700"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{COMPANY_INFO.contact.email}</span>
            </a>
          </div>
        </div>

        {/* Check Status Button */}
        <div>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Check If Maintenance Has Completed</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 text-center border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-600">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-cyan-500/70" />
          <span>Surampalem, Andhra Pradesh, India</span>
        </div>

        <div>
          <span>Circuit Serve Technologies © {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
