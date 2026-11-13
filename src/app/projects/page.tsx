"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';
import { getProjects } from '@/lib/projectsStore';
import { Project } from '@/types';
import { 
  Search, 
  Filter, 
  Layers, 
  Plus, 
  Cpu, 
  Sparkles, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'PCB Design & Layout',
  'Embedded Systems',
  'IoT Products',
  'Rapid Hardware Prototyping',
  'Testing & Validation',
  'Manufacturing Support',
  'FPGA & ASIC Design',
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
      setLoading(false);
    }
    load();
  }, []);

  const filteredProjects = projects.filter((proj) => {
    const matchesCategory =
      selectedCategory === 'All' || proj.category.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesSearch =
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.technologies && proj.technologies.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-navy-950">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>CIRCUIT SERVE TECHNOLOGIES • PORTFOLIO</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Hardware Projects & Systems
            </h1>
            
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Explore custom electronic boards, embedded firmware architectures, and IoT hardware prototypes developed by Circuit Serve Technologies.
            </p>
          </div>

          {/* Controls Bar: Search & Category Pills */}
          <div className="mt-10 space-y-4 max-w-4xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by title, microcontroller, sensor, or technology..."
                className="w-full pl-11 pr-4 py-3 bg-navy-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-lg backdrop-blur-md transition-colors"
              />
              <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-sm'
                      : 'bg-navy-900/60 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid or Clean Empty State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs font-mono text-slate-400">Loading hardware database...</p>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={(p) => setActiveModalProject(p)}
                />
              ))}
            </div>
          ) : (
            /* Clean Empty State as requested: "don't give any demo projects in project section give me the provision to add the projects from my backend" */
            <div className="max-w-2xl mx-auto py-16 px-6 text-center rounded-2xl bg-navy-900/60 border border-slate-800/80 backdrop-blur-md space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-800/80 shadow-inner">
                <Layers className="w-8 h-8 text-cyan-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">
                  {projects.length === 0 ? "No Projects Published Yet" : "No Matching Projects Found"}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                  {projects.length === 0
                    ? "Our project repository is configured and waiting for submissions. You can add your authentic hardware and PCB projects anytime through the CST Admin Portal."
                    : "No projects match your current search or category filter. Try clearing the filter or searching for another term."}
                </p>
              </div>

              {projects.length === 0 && (
                <div className="pt-2">
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-medium text-navy-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 transition-all shadow-md shadow-cyan-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Your First Project in Admin Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
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
