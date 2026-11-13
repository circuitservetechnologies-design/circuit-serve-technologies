"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CSTLogo from './CSTLogo';
import ThemeToggle from './ThemeToggle';
import { useAuth } from './AuthContext';
import { 
  Menu, 
  X, 
  ArrowUpRight, 
  ShieldCheck, 
  FolderKanban, 
  User as UserIcon,
  LogOut
} from 'lucide-react';
import { COMPANY_INFO } from '@/lib/constants';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/#about' },
    { name: 'Capabilities', href: '/#capabilities' },
    { name: 'Who We Serve', href: '/#who-we-serve' },
    { name: 'Roadmap', href: '/#roadmap' },
    { name: 'Projects', href: '/projects' },
    { name: 'Collaborate', href: '/client' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-navy-950/90 backdrop-blur-md border-b border-slate-200 dark:border-cyan-900/30 shadow-lg shadow-black/5 dark:shadow-black/40 py-3'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="group transition-transform hover:scale-[1.02]">
            <CSTLogo textClassName="text-slate-900 dark:text-white" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/80 dark:bg-navy-900/60 border border-slate-200 dark:border-slate-800/80 rounded-full px-4 py-1.5 backdrop-blur-md shadow-inner">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-3 py-1.5 text-xs xl:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center space-x-2.5">
            {/* Light / Dark Mode Toggle */}
            <ThemeToggle />

            {/* Client Portal Button */}
            <Link
              href="/client"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-slate-700 dark:text-cyan-300 bg-slate-100 dark:bg-cyan-950/60 border border-slate-300 dark:border-cyan-800/60 rounded-lg hover:border-cyan-500 transition-all"
              title="Client Collaboration Portal - Assign a project with your own login"
            >
              <FolderKanban className="w-3.5 h-3.5 text-cyan-500" />
              <span>{user ? user.name.split(' ')[0] : 'Collaborate'}</span>
            </Link>

            {/* Admin Portal Button */}
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:border-cyan-500 transition-all"
              title="Admin Portal - Manage authority, proposals, and projects"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
              <span>Admin</span>
            </Link>

            {/* Direct Contact Button */}
            <Link
              href="/#contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white dark:text-navy-950 bg-gradient-to-r from-cyan-500 to-sky-500 rounded-lg hover:from-cyan-400 hover:to-sky-400 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <span>Get in Touch</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/client"
              className="p-2 text-cyan-600 dark:text-cyan-400 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-cyan-900/40 rounded-lg"
              title="Collaborate / Client Portal"
            >
              <FolderKanban className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-300 rounded-lg bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-cyan-500" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-navy-950/95 backdrop-blur-xl border-b border-slate-200 dark:border-cyan-900/40 px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-navy-900 rounded-lg transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <Link
              href="/client"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono font-medium text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800 rounded-lg"
            >
              <FolderKanban className="w-4 h-4 text-cyan-500" />
              <span>{user ? `Client Hub (${user.name})` : 'Collaborate / Client Login'}</span>
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-slate-800 rounded-lg"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-500" />
              <span>Admin Authority</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
