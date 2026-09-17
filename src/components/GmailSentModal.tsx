import React from 'react';
import {
  Mail,
  Download,
  CheckCircle2,
  X,
} from 'lucide-react';
import { BaremaData } from '../types';

interface GmailSentModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BaremaData;
  totalScore: number;
  pdfBlob?: Blob | null;
  gmailUrl?: string;
  mailtoUrl?: string;
  onDownloadPDF: () => void;
  popupBlocked?: boolean;
  supabaseSavedUrl?: string | null;
  emailSentDirectly?: boolean;
}

export const GmailSentModal: React.FC<GmailSentModalProps> = ({
  isOpen,
  onClose,
  data,
  totalScore,
  onDownloadPDF,
  supabaseSavedUrl,
}) => {
  if (!isOpen) return null;

  const academicoName = data.academico?.trim() || 'Aluno';
  const resultadoFinal = totalScore >= 7.0 ? 'Aprovado' : 'Reprovado';
  const emailSubject = `Barema - ${academicoName}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl text-white bg-emerald-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                E-mail Enviado com Sucesso!
              </h3>
              <p className="text-[11px] text-slate-300">
                Barema de <strong>{academicoName}</strong> ({resultadoFinal})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Direct Success Message */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-emerald-950 space-y-2">
            <div className="font-bold flex items-center gap-2 text-emerald-900 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>E-mail e PDF Enviados com Sucesso!</span>
            </div>
            <p className="text-[12px] text-emerald-800 leading-relaxed">
              O barema de <strong>{academicoName}</strong> foi enviado diretamente da sua conta <strong>jozyanne.aguiar@gmail.com</strong> com o PDF oficial anexado.
            </p>
            <p className="text-[11px] text-emerald-700">
              Destinatários: <strong>coord.pos@adventista.edu.br</strong> e <strong>jozyanne.aguiar@gmail.com</strong>.
            </p>
            {supabaseSavedUrl && (
              <div className="pt-2 text-[11px] text-emerald-900 flex items-center gap-1.5 border-t border-emerald-200/70 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>Salvo e protegido no <strong>Supabase Storage (bucket baremas)</strong>.</span>
              </div>
            )}
          </div>

          {/* Summary Box */}
          <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Aluno:</span>
              <span className="font-semibold text-slate-800">{academicoName}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Curso:</span>
              <span className="font-semibold text-slate-800">{data.programa || '-'}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Assunto:</span>
              <span className="font-semibold text-slate-800">{emailSubject}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Resultado:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  resultadoFinal === 'Aprovado'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {resultadoFinal} ({totalScore.toString().replace('.', ',')})
              </span>
            </div>
          </div>

          {/* Optional Action Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={onDownloadPDF}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-colors min-h-[40px]"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Baixar uma cópia em PDF (Opcional)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs transition-colors min-h-[36px]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
