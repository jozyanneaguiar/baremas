import React from 'react';
import {
  Award,
  Send,
  Download,
  GraduationCap,
  Sparkles,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { BaremaData, OptionKey } from '../types';
import { EVALUATION_ITEMS } from '../data/evaluationItems';

interface Props {
  data: BaremaData;
  onChangeData: (newData: BaremaData) => void;
  totalScore: number;
  onDownloadPDF: () => void;
  onSubmit: () => void;
  userConnected: boolean;
  onConnectGoogle: () => void;
}

export const BaremaForm: React.FC<Props> = ({
  data,
  onChangeData,
  totalScore,
  onDownloadPDF,
  onSubmit,
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

  const handleSelectAllPleno = () => {
    const newSelections: Record<number, OptionKey> = {};
    EVALUATION_ITEMS.forEach((item) => {
      newSelections[item.id] = 'A';
    });
    onChangeData({ ...data, selections: newSelections });
  };

  const handleClearAll = () => {
    onChangeData({ ...data, selections: {} });
  };

  const selectedCount = Object.keys(data.selections).length;
  const isComplete = selectedCount === EVALUATION_ITEMS.length;

  const getScoreBadgeStyle = (score: number) => {
    if (score >= 7.0) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (score >= 5.0) return 'text-amber-700 bg-amber-50 border-amber-300';
    return 'text-rose-700 bg-rose-50 border-rose-300';
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card with Sleek Metadata Inputs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 transition-all">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md">
                UNIAENE NPG
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Ficha de Avaliação – TCC Memorial Reflexivo
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Preencha os dados do acadêmico e selecione a pontuação correspondente aos 12 itens de avaliação.
            </p>
          </div>

          {/* Dynamic Score Badge */}
          <div
            className={`flex items-center gap-4 px-5 py-3 rounded-2xl border ${getScoreBadgeStyle(
              totalScore
            )} shadow-sm transition-all shrink-0`}
          >
            <div className="p-2.5 rounded-xl bg-white/90 shadow-sm border border-slate-200/50">
              <Award className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                Nota Final
              </div>
              <div className="text-2xl font-black tracking-tight leading-none mt-0.5">
                {totalScore.toString().replace('.', ',')}
                <span className="text-xs font-bold opacity-70"> / 10,0</span>
              </div>
              <div className="text-[10px] font-medium mt-1">
                {selectedCount} de 12 itens avaliados
              </div>
            </div>
          </div>
        </div>

        {/* Inputs Grid containing only Nome do Curso and Nome do Aluno */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>Nome do Curso *</span>
            </label>
            <input
              type="text"
              value={data.programa}
              onChange={(e) => handleInputChange('programa', e.target.value)}
              placeholder="Ex: Pós-Graduação em Gestão Escolar"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Nome do Aluno *</span>
            </label>
            <input
              type="text"
              value={data.academico}
              onChange={(e) => handleInputChange('academico', e.target.value)}
              placeholder="Ex: Maria Silva Santos"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
            />
          </div>
        </div>

        {/* Quick actions bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {isComplete ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 text-xs">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Todos os 12 itens foram avaliados!
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-800 font-medium bg-amber-50 px-3 py-1 rounded-full border border-amber-200 text-xs">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Faltam {12 - selectedCount} itens para concluir
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllPleno}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 border border-blue-200 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Marcar Todos "Atende Plenamente"</span>
            </button>

            {selectedCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Evaluation Items List - Pure item cards without category banners */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-4 sm:p-5 space-y-3">
        {EVALUATION_ITEMS.map((item) => {
          const currentSelection = data.selections[item.id];

          return (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-4 ${
                currentSelection
                  ? 'bg-slate-50/90 border-slate-300 shadow-sm'
                  : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex-1 max-w-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold text-blue-600 tracking-wider">
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

              {/* Compact Option Buttons (A, B, C) */}
              <div className="flex items-center gap-2 shrink-0">
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
                      className={`flex flex-col items-center justify-center min-w-[70px] sm:min-w-[85px] py-2 px-2.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${buttonStyle}`}
                    >
                      <span className="text-sm leading-none">{optKey}</span>
                      <span
                        className={`text-[9px] mt-1 font-semibold ${
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

      {/* Bottom Footer Action Controls - Normal scrolling flow (not fixed/sticky) */}
      <footer className="p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white px-5 py-2.5 rounded-xl border border-slate-300 shadow-sm">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Nota Final
            </p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {totalScore.toString().replace('.', ',')} <span className="text-xs font-semibold text-slate-500">/ 10,0</span>
            </p>
          </div>
          <div className="text-xs text-slate-500 max-w-xs leading-tight hidden md:block">
            <p>
              <strong>A</strong>: Atende Plenamente | <strong>B</strong>: Atende Parcialmente | <strong>C</strong>: Não Atende
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onDownloadPDF}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Baixar PDF</span>
          </button>

          <button
            type="button"
            onClick={onSubmit}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all text-xs"
          >
            <Send className="w-4 h-4" />
            <span>Finalizar e Enviar</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

