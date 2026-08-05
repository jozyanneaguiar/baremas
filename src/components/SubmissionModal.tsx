import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  HardDrive,
  FileText,
  Download,
  X,
  Plus,
  Trash2,
  AtSign,
} from 'lucide-react';
import { BaremaData } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: BaremaData;
  totalScore: number;
  status: 'confirm' | 'submitting' | 'success' | 'error';
  currentStep: number;
  errorMessage?: string;
  onConfirmSubmit: (recipients: string[]) => void;
  onDownloadPDF: () => void;
  userEmail?: string | null;
}

export const SubmissionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  data,
  totalScore,
  status,
  currentStep,
  errorMessage,
  onConfirmSubmit,
  onDownloadPDF,
  userEmail,
}) => {
  const [recipients, setRecipients] = useState<string[]>([
    'coord.pos@adventista.edu.br',
    'coordenador.pos@adventista.edu.br',
  ]);
  const [newEmail, setNewEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');

  // Reset emails state on open if default
  useEffect(() => {
    if (isOpen && status === 'confirm') {
      setEmailError('');
    }
  }, [isOpen, status]);

  if (!isOpen) return null;

  const handleAddEmail = () => {
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) return;

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError('Digite um endereço de e-mail válido.');
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

  const handleRemoveEmail = (indexToRemove: number) => {
    setRecipients(recipients.filter((_, idx) => idx !== indexToRemove));
    setEmailError('');
  };

  const handleAddUserEmail = () => {
    if (userEmail && !recipients.includes(userEmail.toLowerCase())) {
      setRecipients([...recipients, userEmail.toLowerCase()]);
      setEmailError('');
    }
  };

  const steps = [
    { title: 'Gerar arquivo PDF no modelo oficial Barema', icon: FileText },
    {
      title: `Enviar e-mail para ${recipients.length} destinatário(s)`,
      icon: Mail,
    },
    { title: 'Salvar arquivo PDF na pasta "Correção TCCs" do Google Drive', icon: HardDrive },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800 shrink-0">
          <div>
            <h3 className="font-bold text-base text-slate-100">
              {status === 'confirm' && 'Confirmar Destinatários e Envio'}
              {status === 'submitting' && 'Executando Ações de Envio...'}
              {status === 'success' && 'Envio Concluído com Sucesso!'}
              {status === 'error' && 'Erro no Processamento'}
            </h3>
            <p className="text-xs text-slate-400">
              Acadêmico(a): {data.academico || 'Não informado'} • Nota: {totalScore.toString().replace('.', ',')}
            </p>
          </div>
          {status !== 'submitting' && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {status === 'confirm' && (
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Curso / Programa:</span>
                  <span className="font-semibold text-slate-800">{data.programa || 'Não informado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Parecerista:</span>
                  <span className="font-semibold text-slate-800">{data.parecerista || 'Jozy Anne Miranda Aguiar Castro'}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1">
                  <span className="font-bold text-slate-700">Nota Final Calculada:</span>
                  <span className="font-extrabold text-blue-600 text-sm">
                    {totalScore.toString().replace('.', ',')} / 10,0
                  </span>
                </div>
              </div>

              {/* Recipients Manager Section */}
              <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>Lista de E-mails para Envio ({recipients.length})</span>
                  </div>
                  {userEmail && !recipients.includes(userEmail.toLowerCase()) && (
                    <button
                      type="button"
                      onClick={handleAddUserEmail}
                      className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"
                    >
                      <AtSign className="w-3 h-3" />
                      <span>Incluir meu e-mail</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 leading-tight">
                  Você pode incluir, remover ou alterar os e-mails que receberão o PDF do barema em anexo:
                </p>

                {/* Email Badges List */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {recipients.length === 0 ? (
                    <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-rose-700 text-xs font-semibold text-center">
                      Nenhum e-mail adicionado. Adicione pelo menos 1 e-mail abaixo.
                    </div>
                  ) : (
                    recipients.map((email, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs shadow-sm"
                      >
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase shrink-0 ${
                              idx === 0
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {idx === 0 ? 'Para' : 'CC'}
                          </span>
                          <span className="font-medium text-slate-800 truncate">{email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(idx)}
                          title="Remover e-mail"
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add New Email Input */}
                <div className="pt-1">
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
                      placeholder="adicionar.outro@adventista.edu.br"
                      className="flex-1 px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-base sm:text-xs outline-none focus:ring-2 focus:ring-blue-500 font-medium min-h-[42px]"
                    />
                    <button
                      type="button"
                      onClick={handleAddEmail}
                      className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 min-h-[42px]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar</span>
                    </button>
                  </div>
                  {emailError && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">{emailError}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={recipients.length === 0}
                  onClick={() => onConfirmSubmit(recipients)}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Mail className="w-4 h-4" />
                  <span>Confirmar e Enviar ({recipients.length})</span>
                </button>
              </div>
            </div>
          )}

          {(status === 'submitting' || status === 'success') && (
            <div className="space-y-4">
              <div className="space-y-3">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = status === 'success' || currentStep > idx + 1;
                  const isCurrent = status === 'submitting' && currentStep === idx + 1;

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : isCurrent
                          ? 'bg-blue-50 border-blue-300 text-blue-950 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isDone && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                        {isCurrent && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
                        {!isDone && !isCurrent && <Icon className="w-5 h-5 text-slate-300" />}
                      </div>
                      <div className="flex-1 text-xs">
                        <div className={`font-semibold ${isDone ? 'text-emerald-950' : isCurrent ? 'text-blue-950' : 'text-slate-500'}`}>
                          Ação {idx + 1}: {idx === 0 ? 'Criar PDF' : idx === 1 ? 'Enviar E-mail' : 'Salvar no Drive'}
                        </div>
                        <div className="mt-0.5 text-[11px] opacity-90 leading-tight">{step.title}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {status === 'success' && (
                <div className="bg-emerald-100/70 border border-emerald-300 rounded-xl p-4 text-emerald-950 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Processo concluído com sucesso!</span>
                  </div>
                  <p className="text-emerald-800 leading-relaxed">
                    O PDF foi enviado por e-mail para <strong>{recipients.join(', ')}</strong> e armazenado na pasta <strong>Correção TCCs</strong> do seu Google Drive.
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={onDownloadPDF}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-medium py-2 rounded-lg transition-colors text-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>Baixar Cópia do PDF</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 border border-emerald-400 bg-white text-emerald-900 font-semibold rounded-lg hover:bg-emerald-50 transition-colors text-xs"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-800">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>Ocorreu um erro ao processar a solicitação</span>
                </div>
                <p className="text-rose-700">{errorMessage || 'Não foi possível completar o envio.'}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Fechar
                </button>
                <button
                  onClick={onDownloadPDF}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar PDF Manualmente</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
