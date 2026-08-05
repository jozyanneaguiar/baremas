import React from 'react';
import { User } from 'firebase/auth';
import { LogIn, LogOut, CheckCircle2, ShieldCheck, FileCheck } from 'lucide-react';
import { googleSignIn, logout } from '../lib/firebase';

interface Props {
  user: User | null;
  onAuthChange: (user: User | null, token: string | null) => void;
}

export const Header: React.FC<Props> = ({ user, onAuthChange }) => {
  const handleLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        onAuthChange(res.user, res.accessToken);
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        console.error('Login error:', err);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    onAuthChange(null, null);
  };

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
          {user ? (
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1.5">
              <div className="flex items-center gap-2 text-xs">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-blue-500"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">
                    {(user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="font-semibold text-slate-200 text-xs truncate max-w-[140px]">
                    {user.displayName || 'Conectado'}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Google Conectado
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sair da conta"
                className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs px-3 py-2 rounded-xl shadow-sm transition-all border border-blue-500/30 active:scale-[0.98] min-h-[38px]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">Conectar Google</span>
              <span className="inline xs:hidden sm:hidden">Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
