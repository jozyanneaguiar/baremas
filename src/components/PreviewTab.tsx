import React, { useState } from 'react';
import {
  Mail,
  Send,
  Download,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  FileText,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { BaremaData } from '../types';
import { googleSignIn } from '../lib/firebase';
import { submitBarema } from '../lib/submissionClient';
import { uploadBaremaPDF } from '../lib/supabase';

interface PreviewTabProps {
  data: BaremaData;
  totalScore: number;
  pdfBlobUrl: string | null;
  pdfBlob: Blob | null;
  pdfBase64: string | null;
  isGeneratingPdf: boolean;
  onBackToForm: () => void;
  onDownloadPDF: () => void;
  user: User | null;
  accessToken: string | null;
  onAuthChange: (user: User | null, token: string | null) => void;
}

export const PreviewTab: React.FC<PreviewTabProps> = ({
  data,
  totalScore,
  pdfBlobUrl,
  pdfBlob,
  pdfBase64,
  isGeneratingPdf,
  onBackToForm,
  onDownloadPDF,
  user,
  accessToken,
  onAuthChange,
}) => {
  // Recipients required by user: coord.pos@adventista.edu.br and jozyanne.aguiar@gmail.com
  const [recipients, setRecipients] = useState<string[]>([
    'coord.pos@adventista.edu.br',
    'jozyanne.aguiar@gmail.com',
  ]);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Status state
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'success' | 'auth_required' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Email content values
  const academicoName = data.academico?.trim() || 'Nome do Aluno';
  const programaName = data.programa?.trim() || 'Nome do Curso';
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

  const handleAddEmail = () => {
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError('Digite um e-mail válido.');
      return;
    }
    if (recipients.includes(trimmed)) {
      setEmailError('Este e-mail já está na lista.');
      return;
    }
    setRecipients([...recipients, trimmed]);
    setNewEmail('');
    setEmailError('');
  };

  const handleRemoveEmail = (index: number) => {
    setRecipients(recipients.filter((_, idx) => idx !== index));
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(emailBodyPlain);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  // Gmail Web Compose direct URL
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    recipients.join(',')
  )}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyPlain)}`;

  // Standard mailto link
  const mailtoUrl = `mailto:${encodeURIComponent(recipients.join(','))}?subject=${encodeURIComponent(
    emailSubject
  )}&body=${encodeURIComponent(emailBodyPlain)}`;

  const handleSendEmail = async () => {
    if (recipients.length === 0) {
      setEmailError('Adicione pelo menos um e-mail para enviar.');
      return;
    }

    if (!pdfBlob || !pdfBase64) {
      setErrorMessage('O arquivo PDF ainda não foi gerado. Aguarde um instante.');
      return;
    }

    setSendState('sending');
    setErrorMessage('');

    try {
      // 1. Download PDF automatically for the user to attach
      onDownloadPDF();

      // 2. Upload to Supabase Storage
      try {
        await uploadBaremaPDF(pdfBlob, academicoName);
      } catch (supaErr) {
        console.warn('Supabase storage upload background notice:', supaErr);
      }

      // 3. Open Gmail compose window with prefilled recipients, subject and body
      const opened = window.open(gmailComposeUrl, '_blank');
      if (!opened) {
        // In case popup was blocked by browser
        setSendState('auth_required');
        setErrorMessage('O navegador bloqueou a abertura da janela. Clique no botão abaixo para abrir o Gmail.');
        return;
      }

      setSendState('success');
    } catch (sendErr: any) {
      console.error('Falha ao abrir Gmail:', sendErr);
      setSendState('error');
      setErrorMessage(sendErr.message || 'Falha ao abrir a aba do Gmail.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToForm}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors min-h-[40px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Formulário</span>
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Pré-visualização do Barema e Envio
            </h2>
            <p className="text-xs text-slate-500">
              Aluno(a): <strong className="text-slate-800">{academicoName}</strong> • Nota: <strong className="text-blue-600">{totalScore.toString().replace('.', ',')}</strong> ({resultadoFinal})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownloadPDF}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors shadow-sm min-h-[40px]"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Baixar PDF</span>
          </button>

          {pdfBlobUrl && (
            <a
              href={pdfBlobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm min-h-[40px]"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir PDF em Nova Aba</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Grid: Left is PDF Document Preview, Right is Email Dispatch Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column: PDF Preview (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Arquivo PDF do Barema Oficial</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">{filename}</span>
          </div>

          <div className="p-3 bg-slate-900/5 min-h-[500px] flex items-center justify-center">
            {isGeneratingPdf ? (
              <div className="flex flex-col items-center gap-3 p-8 text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-600">
                  Gerando documento PDF de alta resolução...
                </p>
              </div>
            ) : pdfBlobUrl ? (
              <iframe
                src={pdfBlobUrl}
                title="Pré-visualização do Barema em PDF"
                className="w-full h-[620px] rounded-xl border border-slate-300 bg-white shadow-sm"
              />
            ) : (
              <div className="p-8 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-xs text-slate-600">
                  Não foi possível carregar a prévia do PDF.
                </p>
                <button
                  type="button"
                  onClick={onDownloadPDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Baixar PDF Diretamente
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Email Configuration and Send Action (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: Recipients */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 text-blue-700 p-1.5 rounded-lg">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    E-mails Destinatários
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    O PDF será encaminhado para estes endereços:
                  </p>
                </div>
              </div>
              <span className="text-xs font-extrabold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                {recipients.length}
              </span>
            </div>

            {/* Badges List */}
            <div className="space-y-2">
              {recipients.map((email, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    <span className="font-mono text-slate-800 truncate select-all">{email}</span>
                  </div>
                  {recipients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(idx)}
                      title="Remover destinatário"
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add more recipient field */}
            <div className="space-y-1.5 pt-1">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    setEmailError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEmail();
                    }
                  }}
                  placeholder="Adicionar outro e-mail..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddEmail}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Incluir</span>
                </button>
              </div>
              {emailError && <p className="text-[11px] font-semibold text-rose-600">{emailError}</p>}
            </div>
          </div>

          {/* Card 2: Email Message Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 leading-tight">
                  Conteúdo da Mensagem
                </h3>
                <p className="text-[11px] text-slate-500">
                  Assunto: <strong className="text-slate-800">{emailSubject}</strong>
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    resultadoFinal === 'Aprovado'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {resultadoFinal}
                </span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  title="Copiar texto da mensagem"
                  className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                >
                  {copiedMessage ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-mono text-xs text-slate-700 whitespace-pre-line leading-relaxed select-all">
              {emailBodyPlain}
            </div>
          </div>

          {/* Card 3: Action Button & Submission Handling */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            {sendState === 'success' ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-emerald-950 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Aba do Gmail Aberta com Sucesso!</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  O arquivo PDF do Barema de <strong>{academicoName}</strong> foi baixado no seu dispositivo e a tela do Gmail foi aberta com destinatários, assunto e mensagem preenchidos.
                </p>
                <div className="bg-white/80 border border-emerald-200 rounded-lg p-2.5 text-[11px] text-emerald-900">
                  <strong>Próximo passo:</strong> Na aba do Gmail, clique no ícone de <strong>clipe (anexo)</strong> para incluir o PDF baixado e depois clique no botão azul <strong>Enviar</strong> do Gmail!
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <a
                    href={gmailComposeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Reabrir Gmail</span>
                  </a>
                  <button
                    type="button"
                    onClick={onBackToForm}
                    className="px-4 py-2.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-semibold text-xs rounded-xl transition-colors"
                  >
                    Voltar ao Formulário
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Main Send Button */}
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={sendState === 'sending' || isGeneratingPdf}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all min-h-[50px]"
                >
                  {sendState === 'sending' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Baixando PDF e Abrindo Gmail...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Abrir Gmail com Mensagem e Destinatários Prontos</span>
                    </>
                  )}
                </button>

                {/* If Auth is required or failed on Vercel */}
                {sendState === 'auth_required' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs space-y-3 animate-in fade-in">
                    <div className="flex items-start gap-2 text-amber-900 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="leading-tight">Envio Rápido via Webmail</p>
                        <p className="text-[11px] font-normal text-amber-800 mt-0.5">
                          Para garantir a entrega imediata no Vercel sem bloqueios de autorização de conta:
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <a
                        href={gmailComposeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onDownloadPDF}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Abrir e Enviar no Gmail (com 1 clique)</span>
                      </a>

                      <a
                        href={mailtoUrl}
                        onClick={onDownloadPDF}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all text-[11px]"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Abrir no Aplicativo de E-mail (Outlook/Padrão)</span>
                      </a>
                    </div>
                    <p className="text-[10px] text-amber-700 leading-tight">
                      * Ao clicar, o PDF é baixado automaticamente e a tela do e-mail abre com os destinatários, assunto e mensagem preenchidos prontos para envio.
                    </p>
                  </div>
                )}

                {sendState === 'error' && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900 space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 font-bold text-rose-800">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Não foi possível completar o envio automático</span>
                    </div>
                    <p className="text-rose-700 text-[11px]">{errorMessage}</p>

                    <div className="pt-2 flex gap-2">
                      <a
                        href={gmailComposeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onDownloadPDF}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-center rounded-lg text-xs"
                      >
                        Enviar pelo Gmail Web
                      </a>
                      <button
                        type="button"
                        onClick={() => setSendState('idle')}
                        className="px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        Tentar de Novo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
