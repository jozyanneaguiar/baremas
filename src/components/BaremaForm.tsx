import React from 'react';
import {
  Send,
  Download,
  GraduationCap,
  BookOpen,
  FilePlus,
  Loader2,
} from 'lucide-react';
import { BaremaData, OptionKey } from '../types';
import { EVALUATION_ITEMS } from '../data/evaluationItems';

interface Props {
  data: BaremaData;
  onChangeData: (newData: BaremaData) => void;
  totalScore: number;
  onDownloadPDF: () => void;
  onSubmit: () => void;
  userConnected?: boolean;
  onConnectGoogle?: () => void;
  isSending?: boolean;
}

export const BaremaForm: React.FC<Props> = ({
  data,
  onChangeData,
  totalScore,
  onDownloadPDF,
  onSubmit,
  isSending = false,
}) => {
  const handleInputChange = (field: keyof BaremaData, value: any) => {
    onChangeData({ ...data, [field]: value });
  };

  const handleSelectOption = (itemId: number, option: OptionKey) => {
    onChangeData({
      ...data,
      selections: {
        ...data.selections,
        [itemId]: option,
      },
    });
  };

  const handleNewForm = () => {
    const defaultSelections: Record<number, OptionKey> = {};
    EVALUATION_ITEMS.forEach((item) => {
      defaultSelections[item.id] = 'A';
    });
    onChangeData({
      ...data,
      programa: '',
      academico: '',
      selections: defaultSelections,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card containing only Nome do Curso and Nome do Aluno */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-4 sm:p-6 transition-all">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5 tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Nome do Curso *</span>
            </label>
            <input
              type="text"
              value={data.programa}
              onChange={(e) => handleInputChange('programa', e.target.value)}
              placeholder="Ex: Pós-Graduação em Gestão Escolar"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5 tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Nome do Aluno *</span>
            </label>
            <input
              type="text"
              value={data.academico}
              onChange={(e) => handleInputChange('academico', e.target.value)}
              placeholder="Ex: Maria Silva Santos"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* Evaluation Items List - Pure item cards optimized for touch */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-3 sm:p-5 space-y-3">
        {EVALUATION_ITEMS.map((item) => {
          const currentSelection = data.selections[item.id];

          return (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all gap-3 sm:gap-4 ${
                currentSelection
                  ? 'bg-slate-50/90 border-slate-300 shadow-sm'
                  : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex-1 max-w-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-extrabold text-blue-600 tracking-wider">
                    ITEM {item.id}
                  </span>
                  {item.options.A.score > 1.0 && (
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Peso Especial ({item.options.A.score.toString().replace('.', ',')} pts)
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Touch-optimized Option Buttons (A, B, C) in a 3-column grid on mobile */}
              <div className="grid grid-cols-3 gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                {(['A', 'B', 'C'] as OptionKey[]).map((optKey) => {
                  const opt = item.options[optKey];
                  const isSelected = currentSelection === optKey;

                  let buttonStyle = '';
                  if (isSelected) {
                    if (optKey === 'A')
                      buttonStyle = 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300';
                    else if (optKey === 'B')
                      buttonStyle = 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-300';
                    else
                      buttonStyle = 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-300';
                  } else {
                    buttonStyle =
                      'bg-white border-slate-300 text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600';
                  }

                  return (
                    <button
                      key={optKey}
                      type="button"
                      onClick={() => handleSelectOption(item.id, optKey)}
                      title={`${optKey}: ${opt.label} (${opt.score.toString().replace('.', ',')} pt)`}
                      className={`flex flex-col items-center justify-center min-w-0 sm:min-w-[80px] py-2.5 px-2 rounded-xl border text-xs font-bold transition-all active:scale-95 min-h-[48px] ${buttonStyle}`}
                    >
                      <span className="text-base sm:text-sm leading-none font-black">{optKey}</span>
                      <span
                        className={`text-[10px] sm:text-[9px] mt-1 font-semibold ${
                          isSelected ? 'opacity-95' : 'text-slate-500 group-hover:text-white'
                        }`}
                      >
                        {opt.score.toString().replace('.', ',')} pt
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Action Controls */}
      <footer className="p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <div className="bg-white px-5 py-2.5 rounded-xl border border-slate-300 shadow-sm w-full sm:w-auto flex items-center justify-between sm:block">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Nota Final
            </span>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {totalScore.toString().replace('.', ',')} <span className="text-xs font-semibold text-slate-500">/ 10,0</span>
            </p>
          </div>
          <div className="text-[11px] text-slate-500 leading-tight w-full sm:max-w-xs text-center sm:text-left bg-white/50 p-2 sm:p-0 rounded-lg sm:bg-transparent border sm:border-0 border-slate-200">
            <p>
              <strong>A</strong>: Plenamente | <strong>B</strong>: Parcialmente | <strong>C</strong>: Não Atende
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleNewForm}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3.5 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-colors min-h-[48px]"
          >
            <FilePlus className="w-4 h-4 text-slate-600" />
            <span>Novo</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPDF}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3.5 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-colors min-h-[48px]"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Baixar PDF</span>
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isSending}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all text-xs sm:text-sm min-h-[48px]"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enviando e Salvando PDF...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Finalizar e Enviar</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

