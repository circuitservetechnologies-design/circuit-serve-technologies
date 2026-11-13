"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';
import CSTLogo from '@/components/CSTLogo';
import { COMPANY_INFO } from '@/lib/constants';
import { getProjects } from '@/lib/projectsStore';
import { Project } from '@/types';
import { 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Layers, 
  FileText, 
  Boxes, 
  Binary, 
  ShieldCheck, 
  GraduationCap, 
  Rocket, 
  Globe, 
  Sparkles, 
  ExternalLink,
  FolderKanban
} from 'lucide-react';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getProjects();
      setProjects(data);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 selection:bg-cyan-500 selection:text-white dark:selection:text-navy-950 flex flex-col overflow-x-hidden transition-colors duration-300">
      <Navbar />

      <main className="flex-1">
        {/* ====================================================================
            1. HERO SECTION
        ==================================================================== */}
        <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-circuit-pattern opacity-10 dark:opacity-25 pointer-events-none" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100/80 dark:bg-cyan-950/90 border border-cyan-300 dark:border-cyan-800/80 text-cyan-800 dark:text-cyan-300 text-xs font-mono backdrop-blur-md shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="tracking-wide">{COMPANY_INFO.conceptToHardware}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Circuit Serve <br />
                <span className="bg-gradient-to-r from-cyan-600 via-sky-500 to-teal-500 dark:from-cyan-400 dark:via-sky-300 dark:to-teal-300 bg-clip-text text-transparent">
                  Technologies
                </span>
              </h1>

              <p className="text-lg sm:text-2xl text-slate-700 dark:text-slate-300 font-medium tracking-tight">
                Engineering the Future of Hardware — <span className="text-cyan-600 dark:text-cyan-400 font-mono">From Concept to Silicon</span>
              </p>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Transforming complex electronics ideas into reliable, market-ready hardware. We bridge high-speed PCB design, embedded firmware, IoT prototyping, and semiconductor-ready digital architectures.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-4 w-full sm:w-auto">
                <Link
                  href="/client"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white dark:text-navy-950 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
                >
                  <FolderKanban className="w-4 h-4" />
                  <span>Assign Project / Collaborate</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/projects"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-300 dark:border-slate-700 transition-all shadow-sm active:scale-95"
                >
                  <Cpu className="w-4 h-4 text-cyan-500" />
                  <span>View Projects Portfolio</span>
                </Link>

                <a
                  href="/circuit-serve-brochure.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-xs font-mono text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-300 dark:border-cyan-800/80 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Official Brochure</span>
                </a>
              </div>

              <div className="pt-6 flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-xs font-mono text-slate-600 dark:text-slate-400">
                <span className="px-3 py-1 rounded-md bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">PCB Design</span>
                <span className="text-cyan-500">•</span>
                <span className="px-3 py-1 rounded-md bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">Embedded Systems</span>
                <span className="text-cyan-500">•</span>
                <span className="px-3 py-1 rounded-md bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">IoT Products</span>
                <span className="text-cyan-500">•</span>
                <span className="px-3 py-1 rounded-md bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">Prototyping</span>
                <span className="text-cyan-500">•</span>
                <span className="px-3 py-1 rounded-md bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">Manufacturing Support</span>
                <span className="text-cyan-500">•</span>
                <span className="px-3 py-1 rounded-md bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-cyan-600 dark:text-cyan-300 shadow-sm">Future ASIC Design</span>
              </div>

            </div>
          </div>
        </section>

        {/* ====================================================================
            2. ABOUT US SECTION
        ==================================================================== */}
        <section id="about" className="py-20 bg-slate-100/60 dark:bg-navy-900/40 border-y border-slate-200 dark:border-slate-800/80 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800/60 text-cyan-800 dark:text-cyan-300 text-xs font-mono">
                  <Cpu className="w-3.5 h-3.5 text-cyan-500" />
                  <span>ABOUT CIRCUIT SERVE TECHNOLOGIES</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                  End-to-End Electronics Product Development Solutions
                </h2>

                <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
                  {COMPANY_INFO.aboutSummary}
                </p>

                <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-navy-900 dark:to-cyan-950/60 border border-slate-200 dark:border-cyan-800/50 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 shrink-0">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-semibold">
                        Our Mission: {COMPANY_INFO.missionHeading}
                      </h4>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200 font-medium">
                        "{COMPANY_INFO.missionStatement}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 dark:text-slate-400 pt-2">
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-cyan-500" />
                    <span>Surampalem, Andhra Pradesh, India</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-cyan-500" />
                    <span>+91 8985043496</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-white dark:bg-navy-900/90 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                  <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase">Focus 01</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">High-Speed PCB & HDI</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Strict signal & power integrity for multi-layer micro-architectures.</p>
                </div>

                <div className="p-5 rounded-xl bg-white dark:bg-navy-900/90 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                  <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase">Focus 02</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Embedded Firmware</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Mission-critical RTOS, bare-metal C/C++, ARM Cortex & RISC-V.</p>
                </div>

                <div className="p-5 rounded-xl bg-white dark:bg-navy-900/90 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                  <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase">Focus 03</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Turnkey IoT</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">BLE, Wi-Fi, LoRaWAN, Cellular edge sensors with cloud integration.</p>
                </div>

                <div className="p-5 rounded-xl bg-cyan-50 dark:bg-navy-900/90 border border-cyan-300 dark:border-cyan-800/60 space-y-2 shadow-sm">
                  <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase">Vision</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">RTL-to-GDSII ASIC</h4>
                  <p className="text-xs text-cyan-800 dark:text-cyan-300">Advancing from board-level mastery to complete semiconductor design.</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ====================================================================
            3. CORE CAPABILITIES (The 6 Pillars)
        ==================================================================== */}
        <section id="capabilities" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800/60 text-cyan-800 dark:text-cyan-300 text-xs font-mono">
                <Boxes className="w-3.5 h-3.5 text-cyan-500" />
                <span>HARDWARE ENGINEERING STACK</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Core Capabilities
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                From initial schematic capture and firmware architecture to bench validation and production transfer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {COMPANY_INFO.capabilities.map((cap) => (
                <div
                  key={cap.id}
                  className="group relative rounded-2xl bg-white dark:bg-navy-900/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/60 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 font-mono font-bold text-sm flex items-center justify-center border border-cyan-300 dark:border-cyan-800/80">
                        {cap.number}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-950 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-cyan-900">
                        {cap.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                      {cap.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {cap.summary}
                    </p>

                    <ul className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      {cap.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                    <Link
                      href="/client"
                      className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1.5"
                    >
                      <span>Assign {cap.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ====================================================================
            4. CLIENT COLLABORATION BANNER
        ==================================================================== */}
        <section className="py-16 bg-gradient-to-r from-cyan-600 to-sky-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-200 font-semibold">
                  Partner with Circuit Serve Technologies
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold">
                  Have a hardware idea or need custom electronics?
                </h3>
                <p className="text-sm text-cyan-100 max-w-xl">
                  Sign in or create your collaborator account to submit project specifications, track design iterations in real time, and scale from prototype to mass manufacturing.
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <Link
                  href="/client"
                  className="px-6 py-3.5 rounded-xl bg-white text-navy-950 font-bold text-xs font-mono hover:bg-cyan-50 transition-all shadow-lg shadow-black/10 active:scale-95 flex items-center gap-2"
                >
                  <FolderKanban className="w-4 h-4 text-cyan-600" />
                  <span>Open Collaboration Portal</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            5. WHO WE SERVE
        ==================================================================== */}
        <section id="who-we-serve" className="py-20 bg-slate-100/60 dark:bg-navy-900/30 border-y border-slate-200 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800/60 text-cyan-800 dark:text-cyan-300 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                <span>ECOSYSTEM & CLIENTS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Who We Serve
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Empowering academic researchers, venture-backed startups, national institutions, and global hardware companies.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {COMPANY_INFO.whoWeServe.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white dark:bg-navy-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800/60 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                    {idx === 0 && <GraduationCap className="w-6 h-6" />}
                    {idx === 1 && <Rocket className="w-6 h-6" />}
                    {idx === 2 && <ShieldCheck className="w-6 h-6" />}
                    {idx === 3 && <Globe className="w-6 h-6" />}
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================================
            6. FUTURE ROADMAP
        ==================================================================== */}
        <section id="roadmap" className="py-24 bg-white dark:bg-navy-900/50 border-y border-slate-200 dark:border-slate-800/80 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800/60 text-cyan-800 dark:text-cyan-300 text-xs font-mono">
                <Binary className="w-3.5 h-3.5 text-cyan-500" />
                <span>STRATEGIC VISION</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Our Path to Semiconductor Design
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                How Circuit Serve Technologies is scaling from high-speed PCB mastery to full ASIC silicon innovation.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
              {COMPANY_INFO.roadmap.map((stage, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl border transition-all relative ${
                    stage.status === 'Active'
                      ? 'bg-slate-50 dark:bg-navy-900/90 border-cyan-500/80 shadow-md'
                      : stage.status === 'In Progress'
                      ? 'bg-slate-50 dark:bg-navy-900/60 border-slate-300 dark:border-sky-800/60'
                      : 'bg-white dark:bg-navy-950 border-slate-200 dark:border-slate-800/80'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                        {stage.phase}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          stage.status === 'Active'
                            ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700 font-bold'
                            : 'bg-slate-100 dark:bg-navy-950 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {stage.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{stage.title}</h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {stage.description}
                    </p>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-slate-500 block">
                        Milestones & Scope:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {stage.highlights.map((h, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-[10px] font-mono rounded bg-white dark:bg-navy-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================================
            7. PROJECTS SHOWCASE SECTION (Strictly Zero Admin leakage)
        ==================================================================== */}
        <section id="projects" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800/60 text-cyan-800 dark:text-cyan-300 text-xs font-mono mb-3">
                  <Cpu className="w-3.5 h-3.5 text-cyan-500" />
                  <span>HARDWARE REPOSITORY</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Featured Projects & Prototypes
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  Custom electronics engineered under Circuit Serve Technologies.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  <span>View All Projects</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/client"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-700 dark:text-cyan-300 bg-slate-100 dark:bg-cyan-950 border border-slate-300 dark:border-cyan-800 hover:border-cyan-500 transition-colors"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Assign Project</span>
                </Link>
              </div>
            </div>

            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.slice(0, 6).map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={(p) => setActiveModalProject(p)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-sm max-w-2xl mx-auto space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto border border-cyan-300 dark:border-cyan-800/80 shadow-inner">
                  <Layers className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Project Showcase</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Our portfolio highlights custom hardware designs, PCB stackups, and IoT prototypes. Verified client projects will be featured here as they are completed.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/client"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold text-white dark:text-navy-950 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 transition-all shadow-md shadow-cyan-500/20"
                  >
                    <FolderKanban className="w-4 h-4" />
                    <span>Collaborate / Assign Your Project</span>
                  </Link>
                  <Link
                    href="/#contact"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-slate-700 hover:border-cyan-500"
                  >
                    <span>Contact Us</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ====================================================================
            8. CONTACT SECTION
        ==================================================================== */}
        <section id="contact" className="py-24 bg-slate-100/60 dark:bg-navy-900/40 border-t border-slate-200 dark:border-slate-800/80 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800/60 text-cyan-800 dark:text-cyan-300 text-xs font-mono">
                  <Phone className="w-3.5 h-3.5 text-cyan-500" />
                  <span>DIRECT INQUIRIES</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Let's Build Your Hardware Together
                </h2>

                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Whether you have a schematic that needs high-speed layout, an IoT device requiring custom firmware, or a high-volume manufacturing plan, Circuit Serve Technologies is your engineering partner.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 shadow-sm">
                    <MapPin className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-mono text-slate-500 uppercase block">Headquarters</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {COMPANY_INFO.contact.location}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 shadow-sm">
                    <Phone className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-mono text-slate-500 uppercase block">Direct Call & WhatsApp</span>
                      <a
                        href={`tel:${COMPANY_INFO.contact.rawPhone}`}
                        className="text-sm font-semibold text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                      >
                        {COMPANY_INFO.contact.phone}
                      </a>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 shadow-sm">
                    <Mail className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-mono text-slate-500 uppercase block">Official Email</span>
                      <a
                        href={`mailto:${COMPANY_INFO.contact.email}`}
                        className="text-sm font-semibold text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                      >
                        {COMPANY_INFO.contact.email}
                      </a>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 shadow-sm">
                    <Instagram className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-mono text-slate-500 uppercase block">Official Instagram</span>
                      <a
                        href={COMPANY_INFO.contact.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-slate-900 dark:text-white hover:text-pink-500 transition-colors flex items-center gap-1.5"
                      >
                        <span>@{COMPANY_INFO.contact.instagramHandle}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="/circuit-serve-brochure.jpg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/80 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-cyan-500" />
                    <span>Download Official Startup Brochure</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-7">
                <ContactForm />
              </div>

            </div>
          </div>
        </section>

      </main>

      <ProjectModal
        project={activeModalProject}
        onClose={() => setActiveModalProject(null)}
      />

      <Footer />
    </div>
  );
}
