import React from 'react';
import { Project } from '@/types';
import { Layers, Calendar, ExternalLink, Cpu, Tag } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

export default function ProjectCard({ project, onSelect }: ProjectCardProps) {
  return (
    <div
      onClick={() => onSelect(project)}
      className="group relative bg-navy-900/80 border border-slate-800 hover:border-cyan-500/60 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 flex flex-col"
    >
      {/* Top Banner / Image */}
      <div className="relative h-48 w-full bg-navy-950 overflow-hidden flex items-center justify-center border-b border-slate-800">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-600 gap-2">
            <Cpu className="w-12 h-12 text-cyan-600/60 group-hover:text-cyan-400 transition-colors" />
            <span className="text-[11px] font-mono tracking-wider text-slate-500 uppercase">
              Hardware Project
            </span>
          </div>
        )}

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-md bg-navy-950/80 backdrop-blur-md border border-cyan-800/80 text-cyan-300 shadow">
            {project.category}
          </span>
        </div>

        {/* Status Pill */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-0.5 text-[10px] font-mono rounded font-semibold uppercase ${
              project.status === 'Completed'
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                : project.status === 'In Progress'
                ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                : 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/60'
            }`}
          >
            {project.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
            {project.client ? (
              <span className="truncate max-w-[180px] text-slate-300">Client: {project.client}</span>
            ) : (
              <span className="text-slate-500">Circuit Serve Tech</span>
            )}
            {project.completion_date && (
              <span className="flex items-center gap-1 text-slate-500">
                <Calendar className="w-3 h-3" />
                {project.completion_date}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
            {project.title}
          </h3>

          <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {project.summary}
          </p>
        </div>

        {/* Tech tags */}
        <div className="pt-2 border-t border-slate-800/60">
          <div className="flex flex-wrap gap-1.5">
            {project.technologies && project.technologies.slice(0, 3).map((tech, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-[10px] font-mono bg-navy-950 text-slate-300 rounded border border-slate-700/80"
              >
                {tech}
              </span>
            ))}
            {project.technologies && project.technologies.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
                +{project.technologies.length - 3} more
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-cyan-400 font-medium">
            <span>View Specifications</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
