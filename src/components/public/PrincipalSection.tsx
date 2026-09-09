import React, { useState } from 'react';
import { PrincipalConfig } from '../../types';
import { ChevronRight, Award } from 'lucide-react';
import { SpeechDetailModal } from './SpeechDetailModal';

interface PrincipalSectionProps {
  principal: PrincipalConfig;
  schoolName: string;
}

export const PrincipalSection: React.FC<PrincipalSectionProps> = ({ principal, schoolName }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section id="sambutan" className="py-10 sm:py-14 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-10 lg:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Principal Photo - Clickable to open speech modal */}
            <div className="lg:col-span-4 flex justify-center">
              <div
                onClick={() => setModalOpen(true)}
                className="relative group cursor-pointer transform hover:scale-[1.02] transition-transform duration-200"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setModalOpen(true);
                  }
                }}
                title="Klik untuk membaca sambutan lengkap"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-sm opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-xl overflow-hidden shadow-lg border-4 border-white bg-slate-200">
                  <img
                    src={principal.imageUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80'}
                    alt={principal.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-4 text-white">
                    <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold mb-0.5">
                      <Award className="w-3.5 h-3.5" />
                      <span>Pimpinan Sekolah</span>
                    </div>
                    <div className="font-bold text-sm leading-tight text-white">
                      {principal.name}
                    </div>
                    <div className="text-[10px] text-blue-200 font-medium mt-1 flex items-center gap-1">
                      <span>Tap untuk membaca sambutan</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content & Quote */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Sambutan Kepala {schoolName}
              </h2>

              <div className="pl-4 border-l-3 border-blue-600 py-1">
                <p className="text-xs sm:text-sm text-slate-600 font-medium italic leading-relaxed">
                  "{principal.quote}"
                </p>
              </div>

              <div className="pt-2 flex items-center justify-start">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  <span>Baca Sambutan Lengkap</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Speech Modal */}
      {modalOpen && (
        <SpeechDetailModal
          principal={principal}
          schoolName={schoolName}
          onClose={() => setModalOpen(false)}
        />
      )}
    </section>
  );
};
