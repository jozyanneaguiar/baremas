import React, { useState } from 'react';
import {
  Mail,
  ExternalLink,
  Download,
  CheckCircle2,
  Share2,
  Paperclip,
  X,
  Copy,
  Check,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { BaremaData } from '../types';

interface GmailSentModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BaremaData;
  totalScore: number;
  pdfBlob: Blob | null;
  gmailUrl: string;
  mailtoUrl: string;
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
  pdfBlob,
  gmailUrl,
  mailtoUrl,
  onDownloadPDF,
  popupBlocked = false,
  supabaseSavedUrl,
  emailSentDirectly = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const academicoName = data.academico?.trim() || 'Aluno';
  const programaName = data.programa?.trim() || 'Curso';
  const resultadoFinal = totalScore >= 7.0 ? 'Aprovado' : 'Reprovado';
  const emailSubject = `Barema - ${academicoName}`;
  const filename = `Barema_TCC_${academicoName.replace(/\s+/g, '_')}.pdf`;

  const emailBodyPlain = `Olá,
Segue o trabalho corrigido.
Curso: ${programaName}
Nome do aluno(a): ${academicoName}
O resultado final é: ${resultadoFinal}

Qualquer dúvida, estou à disposição.

Ma. Jozy Anne Miranda Aguiar Castro`;

  const canShareFiles =
    typeof navigator !== 'undefined' &&
    !!navigator.share &&
    !!pdfBlob &&
    typeof File !== 'undefined';

  const handleMobileShare = async () => {
    if (!pdfBlob) return;
    try {
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: emailSubject,
          text: emailBodyPlain,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: emailSubject,
          text: emailBodyPlain,
        });
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn('Erro no compartilhamento móvel:', err);
      }
    }
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(emailBodyPlain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white ${emailSentDirectly ? 'bg-emerald-600' : 'bg-blue-600'}`}>
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                {emailSentDirectly
                  ? 'E-mail Enviado com Sucesso!'
                  : popupBlocked
                  ? 'Pronto para Enviar no Gmail'
                  : 'Aba do Gmail Aberta com Mensagem Pronta!'}
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
          {/* Status Message */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-emerald-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {emailSentDirectly
                  ? 'E-mail enviado e PDF salvo com sucesso!'
                  : 'PDF gerado e baixado automaticamente'}
              </span>
            </div>
            <p className="text-emerald-800 leading-relaxed text-[11px]">
              {emailSentDirectly
                ? `O documento ${filename} foi enviado diretamente para coord.pos@adventista.edu.br e jozyanne.aguiar@gmail.com.`
                : `O arquivo ${filename} foi salvo nos seus Downloads para você anexar ao e-mail no Gmail.`}
            </p>
            {supabaseSavedUrl && (
              <div className="pt-1 text-[11px] text-emerald-900 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Salvo e protegido no <strong>Supabase Storage (bucket baremas)</strong>!</span>
              </div>
            )}
          </div>

          {/* Quick instructions (only if manual Gmail was needed) */}
          {!emailSentDirectly && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-blue-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-blue-900">
                <Paperclip className="w-4 h-4 text-blue-600" />
                <span>Como enviar em 2 passos simples:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-blue-900/90 leading-relaxed">
                <li>
                  Na aba do Gmail aberta, clique no ícone de <strong>clipe (anexar)</strong> e escolha o PDF baixado (ou apenas arraste o arquivo para o e-mail).
                </li>
                <li>
                  Os destinatários, o assunto e o texto já estão 100% preenchidos. Basta clicar no botão <strong>Enviar</strong> do Gmail!
                </li>
              </ol>
            </div>
          )}

          {/* Direct Success Message */}
          {emailSentDirectly && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 text-emerald-950 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Envio Concluído com Sucesso</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                A mensagem foi enviada diretamente da sua conta <strong>jozyanne.aguiar@gmail.com</strong> com o PDF oficial anexado. Não é necessário abrir o Gmail nem baixar arquivos.
              </p>
            </div>
          )}

          {/* Summary Box */}
          <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Destinatários:</span>
              <span className="font-semibold text-slate-800 text-right truncate max-w-[280px]">
                coord.pos@adventista.edu.br, jozyanne.aguiar@gmail.com
              </span>
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

          {/* Buttons */}
          <div className="space-y-2 pt-1">
            {/* Direct Gmail Open Button (only if not sent directly) */}
            {!emailSentDirectly && (
              <a
                href={gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all text-xs min-h-[44px]"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir / Reabrir Gmail na Nova Aba</span>
              </a>
            )}

            {/* Mobile Native Share with Attachment */}
            {!emailSentDirectly && canShareFiles && (
              <button
                type="button"
                onClick={handleMobileShare}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all text-xs min-h-[42px]"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartilhar direto no App do Gmail (com PDF em anexo)</span>
              </button>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onDownloadPDF}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-colors min-h-[40px]"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Baixar PDF Novamente</span>
              </button>

              <button
                type="button"
                onClick={handleCopyBody}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-colors min-h-[40px]"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-600" />
                    <span>Copiar Mensagem</span>
                  </>
                )}
              </button>
            </div>
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
