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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-100 tracking-tight">
                Barema de Correção – TCC
              </h1>
              <span className="bg-blue-900/80 text-blue-200 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-blue-700">
                Relato de Experiência
              </span>
            </div>
            <p className="text-xs text-slate-400">
              UNIAENE • Núcleo de Pós-Graduação (NPGUniaene)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-1.5">
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
                className="text-slate-400 hover:text-rose-400 p-1 rounded transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-sm transition-all border border-blue-500/30 active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              <span>Conectar Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
