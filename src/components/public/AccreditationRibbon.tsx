import React from 'react';
import { SchoolConfig } from '../../types';
import { Award, ShieldCheck } from 'lucide-react';

interface AccreditationRibbonProps {
  config: SchoolConfig;
}

export const AccreditationRibbon: React.FC<AccreditationRibbonProps> = ({ config }) => {
  const { identity } = config;

  return (
    <section
      id="akreditasi-unggulan"
      className="relative z-20 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white border-y border-blue-800/50 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2.5 text-center sm:text-left">
          
          {/* Main Accreditation Badge & Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm font-black">
              <Award className="w-5 h-5 text-slate-950" />
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-0.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                {identity.akreditasi || 'Akreditasi A Unggul'}
              </span>
              <span className="text-xs text-blue-200 font-semibold">
                Sertifikasi Resmi BAN-S/M
              </span>
              <span className="hidden md:inline text-slate-500">•</span>
              <p className="text-xs text-slate-300 font-medium">
                Peringkat Tertinggi dengan Predikat <strong className="text-amber-300">Unggul</strong> • NPSN: <span className="font-mono text-blue-300 font-bold">{identity.npsn}</span>
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Terverifikasi Resmi Kemendikbudristek</span>
          </div>

        </div>
      </div>
    </section>
  );
};

