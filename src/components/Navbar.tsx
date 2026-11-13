"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CSTLogo from './CSTLogo';
import { Menu, X, ArrowUpRight, ShieldCheck, Phone } from 'lucide-react';
import { COMPANY_INFO } from '@/lib/constants';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-navy-950/90 backdrop-blur-md border-b border-cyan-900/30 shadow-lg shadow-black/40 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="group transition-transform hover:scale-[1.02]">
            <CSTLogo />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 bg-navy-900/60 border border-slate-800/80 rounded-full px-4 py-1.5 backdrop-blur-md shadow-inner">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-3 py-1.5 text-xs xl:text-sm font-medium text-slate-300 hover:text-cyan-400 rounded-full transition-colors hover:bg-white/5"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 rounded-lg hover:bg-cyan-900/50 hover:border-cyan-500 transition-all shadow-sm"
              title="Admin CMS - Upload and manage projects"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Admin Portal</span>
            </Link>

            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-navy-950 bg-gradient-to-r from-cyan-400 to-sky-400 rounded-lg hover:from-cyan-300 hover:to-sky-300 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <span>Get in Touch</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <Link
              href="/admin"
              className="p-2 text-cyan-400 bg-navy-900/80 border border-cyan-900/40 rounded-lg"
              title="Admin Portal"
            >
              <ShieldCheck className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-lg bg-navy-900/80 border border-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-cyan-400" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-navy-950/95 backdrop-blur-xl border-b border-cyan-900/40 px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-slate-200 hover:text-cyan-400 hover:bg-navy-900 rounded-lg transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2.5">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono font-medium text-cyan-300 bg-cyan-950/80 border border-cyan-800/80 rounded-lg"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Admin Portal (Manage Projects)</span>
            </Link>
            <Link
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-navy-950 bg-gradient-to-r from-cyan-400 to-sky-400 rounded-lg font-sans"
            >
              <span>Get in Touch</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <a
              href={`tel:${COMPANY_INFO.contact.rawPhone}`}
              className="flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-cyan-400 pt-1"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{COMPANY_INFO.contact.phone}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
