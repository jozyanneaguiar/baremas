import React from 'react';
import { FileCheck } from 'lucide-react';

interface Props {
  user?: any;
  onAuthChange?: (user: any, token: string | null) => void;
}

export const Header: React.FC<Props> = () => {
  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-row items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-sm flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="font-bold text-sm sm:text-lg text-slate-100 tracking-tight leading-snug truncate">
                Barema de Correção – TCC
              </h1>
              <span className="hidden sm:inline-block bg-blue-900/80 text-blue-200 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full border border-blue-700">
                Relato de Experiência
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">
              UNIAENE • Núcleo de Pós-Graduação (NPGUniaene)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>Sistema Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
