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
  Wifi, 
  Factory, 
  ShieldCheck, 
  GraduationCap, 
  Rocket, 
  Globe, 
  TrendingUp, 
  Award, 
  Clock, 
  Sparkles, 
  ExternalLink,
  Plus
} from 'lucide-react';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);
  const [selectedCapability, setSelectedCapability] = useState(0);

  useEffect(() => {
    async function load() {
      const data = await getProjects();
      setProjects(data);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 selection:bg-cyan-500 selection:text-navy-950 flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        {/* ====================================================================
            1. HERO SECTION
        ==================================================================== */}
        <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
          {/* High-tech circuit background grid and subtle radial glow */}
          <div className="absolute inset-0 bg-circuit-pattern opacity-25 pointer-events-none" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 left-10 w-72 h-72 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
              
              {/* Concept to Hardware Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-800/80 text-cyan-300 text-xs font-mono backdrop-blur-md shadow-lg shadow-cyan-950/50">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="tracking-wide">{COMPANY_INFO.conceptToHardware}</span>
              </div>

              {/* Startup Title & Tagline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
                Circuit Serve <br />
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-teal-300 bg-clip-text text-transparent">
                  Technologies
                </span>
              </h1>

              <p className="text-lg sm:text-2xl text-slate-300 font-medium tracking-tight">
                Engineering the Future of Hardware — <span className="text-cyan-400 font-mono">From Concept to Silicon</span>
              </p>

              <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                Transforming complex electronics ideas into reliable, market-ready hardware. We bridge high-speed PCB design, embedded firmware, IoT prototyping, and semiconductor-ready digital architectures.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
                <Link
                  href="/#capabilities"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-navy-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
                >
                  <span>Explore Core Capabilities</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/projects"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-200 bg-navy-900/90 hover:bg-navy-800/90 border border-slate-700/80 hover:border-cyan-500/60 transition-all shadow-md active:scale-95"
                >
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Projects Showcase</span>
                </Link>

                <a
                  href="/circuit-serve-brochure.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-xs font-mono text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/80 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Official Brochure</span>
                </a>
              </div>

              {/* Hardware Domain Badges */}
              <div className="pt-8 flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-xs font-mono text-slate-400">
                <span className="px-3 py-1 rounded-md bg-navy-900/80 border border-slate-800">PCB Design</span>
                <span className="text-cyan-500">•</span>
                <span className="px-3 py-1 rounded-md bg-navy-900/80 border border-slate-800">Embedded Systems</span>
                <span className="text-cyan-500">•</span>
                <span className="px-3 py-1 rounded-md bg-navy-900/80 border border-slate-800">IoT Products</span>
                <span className="text-cyan-500">•</span>
                <span className="px-3 py-1 rounded-md bg-navy-900/80 border border-slate-800">Prototyping</span>
                <span className="text-cyan-500">•</span>
                <span className="px-3 py-1 rounded-md bg-navy-900/80 border border-slate-800">Manufacturing Support</span>
                <span className="text-cyan-500">•</span>
                <span className="px-3 py-1 rounded-md bg-navy-900/80 border border-slate-800 text-cyan-300">Future ASIC Design</span>
              </div>

            </div>
          </div>
        </section>

        {/* ====================================================================
            2. ABOUT US SECTION
        ==================================================================== */}
        <section id="about" className="py-20 bg-navy-900/40 border-y border-slate-800/80 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Mission & Brochure Text */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ABOUT CIRCUIT SERVE TECHNOLOGIES</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                  End-to-End Electronics Product Development Solutions
                </h2>

                <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                  {COMPANY_INFO.aboutSummary}
                </p>

                {/* Mission Callout Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-navy-900 to-cyan-950/60 border border-cyan-800/50 shadow-inner">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
                        Our Mission: {COMPANY_INFO.missionHeading}
                      </h4>
                      <p className="mt-1 text-sm text-slate-200 font-medium">
                        "{COMPANY_INFO.missionStatement}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Location & Contact Quick Pill */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-2">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>Surampalem, Andhra Pradesh, India</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Phone className="w-4 h-4 text-cyan-400" />
                    <span>+91 8985043496</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hardware Metrics / Tech Focus Grid */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-navy-900/90 border border-slate-800 space-y-2">
                  <span className="text-xs font-mono text-cyan-400 uppercase">Focus 01</span>
                  <h4 className="font-bold text-white text-base">High-Speed PCB & HDI</h4>
                  <p className="text-xs text-slate-400">Strict signal & power integrity for multi-layer micro-architectures.</p>
                </div>

                <div className="p-5 rounded-xl bg-navy-900/90 border border-slate-800 space-y-2">
                  <span className="text-xs font-mono text-cyan-400 uppercase">Focus 02</span>
                  <h4 className="font-bold text-white text-base">Embedded Firmware</h4>
                  <p className="text-xs text-slate-400">Mission-critical RTOS, bare-metal C/C++, ARM Cortex & RISC-V.</p>
                </div>

                <div className="p-5 rounded-xl bg-navy-900/90 border border-slate-800 space-y-2">
                  <span className="text-xs font-mono text-cyan-400 uppercase">Focus 03</span>
                  <h4 className="font-bold text-white text-base">Turnkey IoT</h4>
                  <p className="text-xs text-slate-400">BLE, Wi-Fi, LoRaWAN, Cellular edge sensors with cloud integration.</p>
                </div>

                <div className="p-5 rounded-xl bg-navy-900/90 border border-cyan-800/60 bg-cyan-950/30 space-y-2">
                  <span className="text-xs font-mono text-cyan-400 uppercase">Vision</span>
                  <h4 className="font-bold text-white text-base">RTL-to-GDSII ASIC</h4>
                  <p className="text-xs text-cyan-300/80">Advancing from board-level mastery to complete semiconductor design.</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ====================================================================
            3. CORE CAPABILITIES (The 6 Pillars from Brochure)
        ==================================================================== */}
        <section id="capabilities" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
                <Boxes className="w-3.5 h-3.5 text-cyan-400" />
                <span>HARDWARE ENGINEERING STACK</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Core Capabilities
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                From initial schematic capture and firmware architecture to bench validation and production transfer.
              </p>
            </div>

            {/* 6 Capabilities Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {COMPANY_INFO.capabilities.map((cap) => (
                <div
                  key={cap.id}
                  className="group relative rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-cyan-500/60 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    {/* Number and Badge Header */}
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 font-mono font-bold text-sm flex items-center justify-center border border-cyan-800/80">
                        {cap.number}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-navy-950 text-cyan-400 border border-cyan-900">
                        {cap.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {cap.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {cap.summary}
                    </p>

                    {/* Bullet Points */}
                    <ul className="space-y-2 pt-2 border-t border-slate-800/80">
                      {cap.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-800/50">
                    <Link
                      href="/#contact"
                      className="text-xs font-mono text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>Consult on {cap.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ====================================================================
            4. WHO WE SERVE
        ==================================================================== */}
        <section id="who-we-serve" className="py-20 bg-navy-900/30 border-y border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>ECOSYSTEM & CLIENTS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Who We Serve
              </h2>
              <p className="text-slate-400 text-sm">
                Empowering academic researchers, venture-backed startups, national institutions, and global hardware companies.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {COMPANY_INFO.whoWeServe.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                    {idx === 0 && <GraduationCap className="w-6 h-6" />}
                    {idx === 1 && <Rocket className="w-6 h-6" />}
                    {idx === 2 && <ShieldCheck className="w-6 h-6" />}
                    {idx === 3 && <Globe className="w-6 h-6" />}
                  </div>

                  <h3 className="font-bold text-lg text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================================
            5. WHY CHOOSE CIRCUIT SERVE?
        ==================================================================== */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                <span>THE CST ADVANTAGE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Why Choose Circuit Serve?
              </h2>
              <p className="text-slate-400 text-sm">
                Engineered for speed, durability, and seamless hardware scalability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {COMPANY_INFO.whyChooseUs.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-navy-900/70 border border-slate-800/80 hover:border-cyan-800/60 space-y-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-800/80 text-xs font-mono font-bold">
                      0{idx + 1}
                    </span>
                    <h3 className="font-bold text-white text-base">{pillar.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-11">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================================
            6. FUTURE ROADMAP: OUR PATH TO SEMICONDUCTOR DESIGN
        ==================================================================== */}
        <section id="roadmap" className="py-24 bg-navy-900/50 border-y border-slate-800/80 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
                <Binary className="w-3.5 h-3.5 text-cyan-400" />
                <span>STRATEGIC VISION</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Our Path to Semiconductor Design
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                How Circuit Serve Technologies is scaling from high-speed PCB mastery to full ASIC silicon innovation.
              </p>
            </div>

            {/* 3 Phases Horizontal Roadmap */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
              {COMPANY_INFO.roadmap.map((stage, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl border transition-all relative ${
                    stage.status === 'Active'
                      ? 'bg-navy-900/90 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                      : stage.status === 'In Progress'
                      ? 'bg-navy-900/60 border-sky-800/60'
                      : 'bg-navy-950 border-slate-800/80'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                        {stage.phase}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          stage.status === 'Active'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold'
                            : 'bg-navy-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {stage.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white">{stage.title}</h3>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {stage.description}
                    </p>

                    {/* Highlights */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-slate-500 block">
                        Milestones & Scope:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {stage.highlights.map((h, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-[10px] font-mono rounded bg-navy-950 text-slate-300 border border-slate-800"
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
            7. PROJECTS SHOWCASE SECTION
        ==================================================================== */}
        <section id="projects" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono mb-3">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>HARDWARE REPOSITORY</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Featured Projects & Prototypes
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Custom electronics engineered under Circuit Serve Technologies.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>View All Projects</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 transition-colors"
                  title="Upload projects via Admin Dashboard"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </Link>
              </div>
            </div>

            {/* If projects exist, render grid; if 0 projects (as requested: "don't give any demo projects in project section give me the provision to add the projects from my backend"), render clean empty state */}
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
              <div className="p-12 text-center rounded-2xl bg-navy-900/60 border border-slate-800/80 backdrop-blur-sm max-w-2xl mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-950 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-800/80 shadow-inner">
                  <Layers className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Project Showcase Ready</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  As requested, demo projects are excluded. Your portfolio is connected to your backend database and ready for your real project uploads!
                </p>
                <div className="pt-2">
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-medium text-navy-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 transition-all shadow-md shadow-cyan-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Open Admin Portal to Upload Your Projects</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ====================================================================
            8. CONTACT SECTION
        ==================================================================== */}
        <section id="contact" className="py-24 bg-navy-900/40 border-t border-slate-800/80 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Contact Info (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>DIRECT INQUIRIES</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Let's Build Your Hardware Together
                </h2>

                <p className="text-slate-300 text-sm leading-relaxed">
                  Whether you have a schematic that needs high-speed layout, an IoT device requiring custom firmware, or a high-volume manufacturing plan, Circuit Serve Technologies is your engineering partner.
                </p>

                {/* Contact Details Cards */}
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 flex items-start gap-3.5">
                    <MapPin className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-mono text-slate-400 uppercase block">Headquarters</span>
                      <span className="text-sm font-semibold text-white">
                        {COMPANY_INFO.contact.location}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 flex items-start gap-3.5">
                    <Phone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-mono text-slate-400 uppercase block">Direct Call & WhatsApp</span>
                      <a
                        href={`tel:${COMPANY_INFO.contact.rawPhone}`}
                        className="text-sm font-semibold text-white hover:text-cyan-400 transition-colors"
                      >
                        {COMPANY_INFO.contact.phone}
                      </a>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 flex items-start gap-3.5">
                    <Mail className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-mono text-slate-400 uppercase block">Official Email</span>
                      <a
                        href={`mailto:${COMPANY_INFO.contact.email}`}
                        className="text-sm font-semibold text-white hover:text-cyan-400 transition-colors"
                      >
                        {COMPANY_INFO.contact.email}
                      </a>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 flex items-start gap-3.5">
                    <Instagram className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-mono text-slate-400 uppercase block">Official Instagram</span>
                      <a
                        href={COMPANY_INFO.contact.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-white hover:text-pink-400 transition-colors flex items-center gap-1.5"
                      >
                        <span>@{COMPANY_INFO.contact.instagramHandle}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Brochure Download CTA */}
                <div className="pt-2">
                  <a
                    href="/circuit-serve-brochure.jpg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800 rounded-lg hover:bg-cyan-900/80 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Download Official Startup Brochure</span>
                  </a>
                </div>
              </div>

              {/* Contact Form Column (7 cols) */}
              <div className="lg:col-span-7">
                <ContactForm />
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Project Details Modal */}
      <ProjectModal
        project={activeModalProject}
        onClose={() => setActiveModalProject(null)}
      />

      <Footer />
    </div>
  );
}
