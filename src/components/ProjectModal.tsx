import React from 'react';
import { Project } from '@/types';
import { X, ExternalLink, Calendar, CheckCircle, Tag, Cpu, Building2, Star } from 'lucide-react';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-cyan-800/60 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950/80">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-mono font-medium rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800/80">
              {project.category}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Status: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{project.status}</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg bg-slate-200/50 dark:bg-slate-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {project.image_url && (
            <div className="w-full h-64 rounded-xl overflow-hidden bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{project.title}</h2>
            <p className="text-sm text-cyan-700 dark:text-cyan-400 font-medium">{project.summary}</p>
          </div>

          {/* Meta specs row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800/80 text-xs font-mono">
            {project.client && (
              <div>
                <span className="text-slate-400 block">Client / Organization</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{project.client}</span>
              </div>
            )}
            {project.completion_date && (
              <div>
                <span className="text-slate-400 block">Timeline</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{project.completion_date}</span>
              </div>
            )}
            <div>
              <span className="text-slate-400 block">Engineering Wing</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold">Circuit Serve Tech</span>
            </div>
          </div>

          {project.description && (
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                Overview & Engineering Scope
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>
          )}

          {project.features && project.features.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                Technical Highlights & Specifications
              </h4>
              <ul className="space-y-1.5">
                {project.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project.technologies && project.technologies.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                Hardware & Software Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs font-mono bg-slate-100 dark:bg-navy-950 text-cyan-700 dark:text-cyan-300 rounded-md border border-slate-200 dark:border-cyan-900/60"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {project.demo_url && (
            <div className="pt-2">
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 rounded-lg text-xs font-mono"
              >
                <span>View Schematic / External Reference</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Client Feedback & Reviews */}
          {project.feedbacks && project.feedbacks.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-purple-500 text-purple-500" />
                <span>Verified Client Reviews ({project.feedbacks.length})</span>
              </h4>

              <div className="space-y-2">
                {project.feedbacks.map((fb, idx) => (
                  <div
                    key={fb.id || idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950/70 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                        {fb.user_name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(fb.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {fb.rating && (
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < fb.rating! ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      {fb.review_status && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                          {fb.review_status}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                      "{fb.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200 dark:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
