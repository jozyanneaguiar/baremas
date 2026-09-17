import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { FileEdit, Eye, AlertCircle } from 'lucide-react';
import { Header } from './components/Header';
import { AuthBanner } from './components/AuthBanner';
import { BaremaForm } from './components/BaremaForm';
import { BaremaPDFTemplate } from './components/BaremaPDFTemplate';
import { PreviewTab } from './components/PreviewTab';
import { BaremaData, OptionKey } from './types';
import { EVALUATION_ITEMS } from './data/evaluationItems';
import { initAuth, googleSignIn, getAccessToken, setAccessToken } from './lib/firebase';
import { generateBaremaPDF } from './lib/pdfGenerator';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [showAuthBanner, setShowAuthBanner] = useState<boolean>(false);

  // Active View Tab: 'form' (Ficha) or 'preview' (Pré-visualização e Envio)
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  // Form State
  const [data, setData] = useState<BaremaData>({
    programa: '',
    parecerista: 'M.a Jozy Anne Miranda Aguiar Castro',
    academico: '',
    data: new Date().toLocaleDateString('pt-BR'),
    selections: {
      1: 'A',
      2: 'A',
      3: 'A',
      4: 'A',
      5: 'A',
      6: 'A',
      7: 'A',
      8: 'A',
      9: 'A',
      10: 'A',
      11: 'A',
      12: 'A',
    },
  });

  const templateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initAuth(
      (authUser, token) => {
        setUser(authUser);
        setToken(token);
        setShowAuthBanner(false);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );

    // Clear any obsolete custom image overrides from localStorage
    localStorage.removeItem('customLogoUrl');
    localStorage.removeItem('customSignatureUrl');
  }, []);

  // Calculate dynamic score based on current selections
  const calculateTotalScore = (): number => {
    let score = 0;
    EVALUATION_ITEMS.forEach((item) => {
      const selectedOption = data.selections[item.id];
      if (selectedOption && item.options[selectedOption]) {
        score += item.options[selectedOption].score;
      }
    });
    return Math.round(score * 10) / 10;
  };

  const totalScore = calculateTotalScore();

  const handleAuthChange = (newUser: User | null, newToken: string | null) => {
    setUser(newUser);
    setToken(newToken);
    if (newToken) setShowAuthBanner(false);
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setShowAuthBanner(false);
      }
    } catch (err: any) {
      console.error('Falha ao autenticar:', err);
    }
  };

  const handleDownloadPDF = async () => {
    if (!templateRef.current) return;
    try {
      const { pdfBlob: blob } = await generateBaremaPDF(templateRef.current);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Barema_TCC_${(data.academico || 'Aluno').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao baixar PDF:', err);
      setValidationWarning('Não foi possível gerar o PDF para download.');
    }
  };

  const handleOpenPreview = async () => {
    if (!data.programa.trim() || !data.academico.trim()) {
      setValidationWarning('Por favor, preencha o Nome do Curso e o Nome do Aluno antes de avançar.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setValidationWarning(null);
    setActiveTab('preview');
    setIsGeneratingPdf(true);

    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }

    try {
      if (templateRef.current) {
        const { pdfBlob: blob, pdfBase64: b64 } = await generateBaremaPDF(templateRef.current);
        const url = URL.createObjectURL(blob);
        setPdfBlob(blob);
        setPdfBase64(b64);
        setPdfBlobUrl(url);
      }
    } catch (err) {
      console.error('Erro ao gerar prévia do PDF:', err);
      setValidationWarning('Erro ao processar visualização do PDF. Tente novamente.');
    } finally {
      setIsGeneratingPdf(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      <Header user={user} onAuthChange={handleAuthChange} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
        {showAuthBanner && !user && <AuthBanner onLogin={handleConnectGoogle} />}

        {/* Validation Warning Alert */}
        {validationWarning && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{validationWarning}</span>
            </div>
            <button
              type="button"
              onClick={() => setValidationWarning(null)}
              className="text-amber-800 hover:text-amber-950 font-bold text-xs underline"
            >
              Entendido
            </button>
          </div>
        )}

        {/* Top Tab Switcher */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
              activeTab === 'form'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileEdit className="w-4 h-4" />
            <span>Ficha de Avaliação</span>
          </button>

          <button
            type="button"
            onClick={handleOpenPreview}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
              activeTab === 'preview'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Pré-visualização e Envio</span>
            {pdfBlobUrl && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            )}
          </button>
        </div>

        {/* Active Tab View */}
        {activeTab === 'form' ? (
          <BaremaForm
            data={data}
            onChangeData={setData}
            totalScore={totalScore}
            onDownloadPDF={handleDownloadPDF}
            onSubmit={handleOpenPreview}
            userConnected={!!accessToken}
            onConnectGoogle={handleConnectGoogle}
          />
        ) : (
          <PreviewTab
            data={data}
            totalScore={totalScore}
            pdfBlobUrl={pdfBlobUrl}
            pdfBlob={pdfBlob}
            pdfBase64={pdfBase64}
            isGeneratingPdf={isGeneratingPdf}
            onBackToForm={() => setActiveTab('form')}
            onDownloadPDF={handleDownloadPDF}
            user={user}
            accessToken={accessToken}
            onAuthChange={handleAuthChange}
          />
        )}
      </main>

      {/* Hidden PDF Template Container for Off-Screen High-Res Rendering */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', overflow: 'hidden' }}>
        <BaremaPDFTemplate ref={templateRef} data={data} totalScore={totalScore} />
      </div>
    </div>
  );
}
