import React from 'react';
import { Bus, MapPin, Phone, Mail, Globe, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-10 mt-12 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1: College Info */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">KLECET Transport</h3>
              <p className="text-[10px] text-sky-400">Smart Campus Fleet Portal</p>
            </div>
          </div>
          <p className="text-slate-400 leading-relaxed">
            KLE College of Engineering & Technology, Chikodi. Empowering safe, punctual, and transparent transport tracking.
          </p>
        </div>

        {/* Col 2: Quick Contact */}
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">Campus Contact</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
              <span>KLECET Campus, Banhatti Road, Chikodi - 591201</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>+91 08338-220020 / Transport Desk</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>transport@klecet.edu.in</span>
            </li>
          </ul>
        </div>

        {/* Col 3: Bus Operations */}
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">Fleet Fleet Details</h4>
          <ul className="space-y-1.5">
            <li>• Route Buses: Chikodi, Nipani, Sankeshwar</li>
            <li>• Local Buses: Campus Express Loop</li>
            <li>• Operations: 07:00 AM - 06:30 PM</li>
            <li>• Emergency SOS: Active 24/7</li>
          </ul>
        </div>

        {/* Col 4: Official Link */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">Official Portal</h4>
          <a
            href="https://klecet.edu.in/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-4 py-2.5 rounded-xl text-sky-400 font-medium text-xs transition-all shadow-md"
          >
            Visit Official Website <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
        <p>© {new Date().getFullYear()} KLE College of Engineering & Technology, Chikodi. All rights reserved.</p>
        <p>Built with React, Socket.IO & Tailwind CSS</p>
      </div>
    </footer>
  );
}