import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { AuthBanner } from './components/AuthBanner';
import { BaremaForm } from './components/BaremaForm';
import { BaremaPDFTemplate } from './components/BaremaPDFTemplate';
import { SubmissionModal } from './components/SubmissionModal';
import { BaremaData, OptionKey } from './types';
import { EVALUATION_ITEMS } from './data/evaluationItems';
import { initAuth, googleSignIn, getAccessToken, setAccessToken } from './lib/firebase';
import { generateBaremaPDF } from './lib/pdfGenerator';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [showAuthBanner, setShowAuthBanner] = useState<boolean>(false);

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

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<
    'confirm' | 'submitting' | 'success' | 'error'
  >('confirm');
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string>('');

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
      const { pdfBlob } = await generateBaremaPDF(templateRef.current);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Barema_TCC_${(data.academico || 'Aluno').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao baixar PDF:', err);
      alert('Erro ao gerar arquivo PDF.');
    }
  };

  const handleSubmitClick = () => {
    if (!data.programa.trim() || !data.academico.trim()) {
      alert('Por favor, preencha o Nome do Curso e o Nome do Aluno antes de enviar.');
      return;
    }

    if (!accessToken) {
      setShowAuthBanner(true);
      handleConnectGoogle();
      return;
    }

    setSubmissionStatus('confirm');
    setCurrentStep(1);
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleConfirmSubmit = async (recipients: string[]) => {
    if (!templateRef.current) return;

    const tokenToUse = accessToken || getAccessToken();
    if (!tokenToUse) {
      setSubmissionStatus('error');
      setErrorMessage('Token de acesso Google não encontrado. Faça login novamente.');
      return;
    }

    try {
      setSubmissionStatus('submitting');
      setCurrentStep(1); // Action A: PDF Generation

      // 1. Generate PDF
      const { pdfBase64 } = await generateBaremaPDF(templateRef.current);

      setCurrentStep(2); // Action B & C: Send email and save to Drive

      const response = await fetch('/api/submit-barema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenToUse}`,
        },
        body: JSON.stringify({
          data,
          pdfBase64,
          filename: `Barema_TCC_${data.academico.replace(/\s+/g, '_')}.pdf`,
          recipients,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || resData.details || 'Erro ao enviar avaliação.');
      }

      setCurrentStep(3);
      setSubmissionStatus('success');
    } catch (err: any) {
      console.error('Erro no envio:', err);
      setSubmissionStatus('error');
      setErrorMessage(err.message || 'Ocorreu um erro ao comunicar com os serviços do Google.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      <Header user={user} onAuthChange={handleAuthChange} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {showAuthBanner && !user && <AuthBanner onLogin={handleConnectGoogle} />}

        <BaremaForm
          data={data}
          onChangeData={setData}
          totalScore={totalScore}
          onDownloadPDF={handleDownloadPDF}
          onSubmit={handleSubmitClick}
          userConnected={!!accessToken}
          onConnectGoogle={handleConnectGoogle}
        />
      </main>

      {/* Hidden PDF Template Container for Off-Screen Rendering */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', overflow: 'hidden' }}>
        <BaremaPDFTemplate ref={templateRef} data={data} totalScore={totalScore} />
      </div>

      <SubmissionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={data}
        totalScore={totalScore}
        status={submissionStatus}
        currentStep={currentStep}
        errorMessage={errorMessage}
        onConfirmSubmit={handleConfirmSubmit}
        onDownloadPDF={handleDownloadPDF}
        userEmail={user?.email}
      />
    </div>
  );
}
