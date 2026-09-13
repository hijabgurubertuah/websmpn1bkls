import React from 'react';
import { PrincipalConfig } from '../../types';
import { X, Award } from 'lucide-react';
import { FormattedContentRenderer } from '../common/FormattedContentRenderer';

interface SpeechDetailModalProps {
  principal: PrincipalConfig;
  schoolName: string;
  onClose: () => void;
}

export const SpeechDetailModal: React.FC<SpeechDetailModalProps> = ({
  principal,
  schoolName,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Sambutan Kepala {schoolName}
              </h3>
              <p className="text-xs text-slate-500 truncate">{principal.name || principal.title || 'Kepala Sekolah'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
          {/* Foto Pimpinan di Samping Quotes */}
          <div className="flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-blue-50/90 via-slate-50 to-blue-50/60 border border-blue-100/90 rounded-2xl p-3 sm:p-4 shadow-2xs">
            <div className="relative w-16 h-20 sm:w-22 sm:h-28 rounded-xl overflow-hidden shadow-xs border-2 border-white bg-slate-200 shrink-0">
              {principal.imageUrl ? (
                <img
                  src={principal.imageUrl}
                  alt={principal.name || 'Kepala Sekolah'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white p-1 text-center">
                  <Award className="w-6 h-6 text-amber-300 mb-0.5" />
                  <span className="text-[7px] font-bold text-white uppercase">Kepala Sekolah</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-blue-950 font-medium italic leading-relaxed">
                "{principal.quote}"
              </p>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-1 sm:mt-1.5 not-italic">
                — {principal.name || 'Kepala Sekolah'}
              </p>
            </div>
          </div>

          {/* Full Speech Body */}
          <div className="space-y-3 text-slate-700 pt-1">
            <FormattedContentRenderer content={principal.fullSpeech} />
          </div>

          {/* Info Pimpinan di Bawah (Tulisan Pimpinan SMP Negeri 1 Bengkalis telah dihapus) */}
          <div className="pt-4 border-t border-slate-100 mt-6">
            <p className="font-bold text-slate-900 text-sm sm:text-base">{principal.name || principal.title || 'Kepala Sekolah'}</p>
            <p className="text-xs text-slate-500">{principal.title || 'Kepala Sekolah'}</p>
            {principal.nip && <p className="text-xs text-slate-400">NIP. {principal.nip}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
