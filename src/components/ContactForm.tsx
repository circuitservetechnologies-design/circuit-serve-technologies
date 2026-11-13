"use client";

import React, { useState } from 'react';
import { submitInquiry } from '@/lib/projectsStore';
import { COMPANY_INFO } from '@/lib/constants';
import { Send, CheckCircle2, MessageSquare, PhoneCall, Mail } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'PCB Design & Layout',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await submitInquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        message: formData.message,
      });

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: 'PCB Design & Layout',
        message: '',
      });
    } catch (err: any) {
      console.error(err);
      setError('Unable to submit inquiry. Please try again or reach out directly via WhatsApp/Phone.');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello Circuit Serve Technologies,\nMy name is ${formData.name || 'a hardware client'}.\nI am interested in ${formData.service}.\nMessage: ${formData.message || 'I would like to discuss a project.'}`
    );
    window.open(`https://wa.me/91${COMPANY_INFO.contact.rawPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="bg-white dark:bg-navy-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl relative overflow-hidden transition-colors">
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full pointer-events-none" />

      {submitted ? (
        <div className="py-12 text-center space-y-4">
          <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-full flex items-center justify-center mx-auto border border-cyan-300 dark:border-cyan-500/40 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Inquiry Received!</h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md mx-auto">
            Thank you for reaching out to Circuit Serve Technologies. Our engineering team at Surampalem will review your requirement and get in touch within 24 hours.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setSubmitted(false)}
              className="px-4 py-2 text-xs font-mono text-cyan-700 dark:text-cyan-300 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors"
            >
              Send Another Inquiry
            </button>
            <button
              onClick={openWhatsApp}
              className="px-4 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Connect on WhatsApp</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Send Us a Direct Message</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Share your project specs, schematic inquiries, or engineering requirements.
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. John Doe"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@organization.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 89850..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Primary Interest</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="PCB Design & Layout">PCB Design & Layout</option>
                <option value="Embedded Systems">Embedded Systems & Firmware</option>
                <option value="IoT Product Development">IoT Product Development</option>
                <option value="Rapid Hardware Prototyping">Rapid Hardware Prototyping</option>
                <option value="Testing & Validation">Testing & Validation</option>
                <option value="Manufacturing Support">Manufacturing Support</option>
                <option value="FPGA & Semiconductor Consultation">FPGA & Semiconductor Consultation</option>
                <option value="Other">Other / General Collaboration</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">Project Details / Message *</label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell us about your hardware specs, timeline, target microcontroller/sensors, or production scale..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 text-white dark:text-navy-950 font-bold text-xs font-mono rounded-lg hover:from-cyan-400 hover:to-sky-400 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Send Message to CST'}</span>
            </button>

            <button
              type="button"
              onClick={openWhatsApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700/80 text-emerald-800 dark:text-emerald-300 font-medium text-xs font-mono rounded-lg transition-colors"
              title="Quick Chat on WhatsApp"
            >
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span>WhatsApp Chat</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
