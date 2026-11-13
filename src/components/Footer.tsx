import React from 'react';
import Link from 'next/link';
import CSTLogo from './CSTLogo';
import { COMPANY_INFO } from '@/lib/constants';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  FileText, 
  ArrowUpRight, 
  FolderKanban,
  Cpu
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-900 dark:bg-navy-950 border-t border-slate-800 text-slate-400 overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Column 1 */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <CSTLogo size={42} textClassName="text-white" />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {COMPANY_INFO.aboutSummary}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-mono rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">
                <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>{COMPANY_INFO.missionHeading}</span>
              </span>
            </div>
          </div>

          {/* Column 2 */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-semibold">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link></li>
              <li><Link href="/#about" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
              <li><Link href="/#capabilities" className="hover:text-cyan-400 transition-colors">Capabilities</Link></li>
              <li><Link href="/#who-we-serve" className="hover:text-cyan-400 transition-colors">Who We Serve</Link></li>
              <li><Link href="/#roadmap" className="hover:text-cyan-400 transition-colors">Roadmap</Link></li>
              <li><Link href="/projects" className="hover:text-cyan-400 transition-colors">Projects</Link></li>
              <li>
                <Link href="/client" className="hover:text-cyan-400 transition-colors flex items-center gap-1 text-cyan-300">
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span>Client Hub</span>
                </Link>
              </li>
              <li><Link href="/#contact" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-semibold">
              Hardware Solutions
            </h4>
            <ul className="space-y-2 text-sm">
              {COMPANY_INFO.capabilities.map((c) => (
                <li key={c.id}>
                  <Link href="/#capabilities" className="hover:text-cyan-400 transition-colors block truncate">
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-semibold">
              Contact CST
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">{COMPANY_INFO.contact.location}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <a
                  href={`tel:${COMPANY_INFO.contact.rawPhone}`}
                  className="hover:text-cyan-400 text-slate-300 transition-colors"
                >
                  {COMPANY_INFO.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <a
                  href={`mailto:${COMPANY_INFO.contact.email}`}
                  className="hover:text-cyan-400 text-slate-300 transition-colors truncate"
                >
                  {COMPANY_INFO.contact.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                <a
                  href={COMPANY_INFO.contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 text-slate-300 transition-colors flex items-center gap-1"
                >
                  <span>@{COMPANY_INFO.contact.instagramHandle}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href="/circuit-serve-brochure.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-all w-full justify-center"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>View Official Brochure</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Zero visible admin block */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <p>
            © {currentYear} {COMPANY_INFO.name}. Surampalem, Andhra Pradesh
            {/* Hidden subtle doorway for the startup owner only - no visible text */}
            <Link href="/admin" className="opacity-0 hover:opacity-10 text-slate-700 cursor-default select-none" tabIndex={-1}>
              .
            </Link>
          </p>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/client" 
              className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Client Collaboration Portal</span>
            </Link>
            <span>•</span>
            <Link 
              href="/#contact" 
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Contact Engineering
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
