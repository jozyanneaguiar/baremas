import React from 'react';
import { ShieldCheck, Mail, HardDrive, ArrowRight } from 'lucide-react';

interface Props {
  onLogin: () => void;
}

export const AuthBanner: React.FC<Props> = ({ onLogin }) => {
  return (
    <div className="bg-gradient-to-r from-blue-900/90 to-slate-900 border border-blue-700/50 rounded-xl p-4 text-white shadow-md mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-600/30 border border-blue-500/40 p-2.5 rounded-lg text-blue-300 mt-0.5 sm:mt-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-blue-100 flex items-center gap-2">
              Conexão Google Solicitada
            </h3>
            <p className="text-xs text-blue-200/80 mt-1 max-w-xl leading-relaxed">
              Para enviar o e-mail automaticamente (via Gmail para <span className="text-blue-200 font-medium">coord.pos@adventista.edu.br</span>) e salvar o PDF na sua pasta <span className="text-blue-200 font-medium">Correção TCCs</span> do Google Drive, conecte sua conta Google.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-blue-300">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-400" /> Envio via jozyanne.aguiar@gmail.com
              </span>
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-blue-400" /> Pasta Drive "Correção TCCs"
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onLogin}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all whitespace-nowrap"
        >
          <span>Conectar Conta Google</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
