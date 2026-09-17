import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { Header } from './components/Header';
import { BaremaForm } from './components/BaremaForm';
import { BaremaPDFTemplate } from './components/BaremaPDFTemplate';
import { GmailSentModal } from './components/GmailSentModal';
import { BaremaData, OptionKey } from './types';
import { EVALUATION_ITEMS } from './data/evaluationItems';
import { generateBaremaPDF } from './lib/pdfGenerator';
import { uploadBaremaPDF } from './lib/supabase';

export default function App() {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  // Sent Modal State
  const [gmailModalOpen, setGmailModalOpen] = useState<boolean>(false);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [popupBlocked, setPopupBlocked] = useState<boolean>(false);
  const [gmailUrl, setGmailUrl] = useState<string>('');
  const [mailtoUrl, setMailtoUrl] = useState<string>('');
  const [supabaseSavedUrl, setSupabaseSavedUrl] = useState<string | null>(null);
  const [emailSentDirectly, setEmailSentDirectly] = useState<boolean>(false);

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

  const handleFinalizarEEnviar = async () => {
    if (!data.programa.trim() || !data.academico.trim()) {
      setValidationWarning('Por favor, preencha o Nome do Curso e o Nome do Aluno antes de finalizar e enviar.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setValidationWarning(null);
    setIsFinalizing(true);
    setEmailSentDirectly(false);

    const academicoName = data.academico.trim();
    const programaName = data.programa.trim();
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

    const recipientsList = 'coord.pos@adventista.edu.br,jozyanne.aguiar@gmail.com';

    const targetGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      recipientsList
    )}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyPlain)}`;

    const targetMailtoUrl = `mailto:${encodeURIComponent(recipientsList)}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBodyPlain)}`;

    setGmailUrl(targetGmailUrl);
    setMailtoUrl(targetMailtoUrl);

    try {
      if (templateRef.current) {
        const { pdfBlob: blob, pdfBase64: b64 } = await generateBaremaPDF(templateRef.current);
        setPdfBlob(blob);

        // 1. Upload to Supabase Storage 'baremas' bucket
        try {
          const uploadRes = await uploadBaremaPDF(blob, academicoName);
          if (uploadRes?.publicUrl) {
            setSupabaseSavedUrl(uploadRes.publicUrl);
          }
        } catch (supaErr) {
          console.warn('Supabase storage upload fallback:', supaErr);
        }

        // 2. Attempt direct background email dispatch via backend SMTP with attached PDF
        let sentDirect = false;
        try {
          const directSendRes = await fetch('/api/send-email-direct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data,
              pdfBase64: b64,
              filename,
              totalScore,
            }),
          });

          if (directSendRes.ok) {
            const sendJson = await directSendRes.json();
            if (sendJson.success) {
              sentDirect = true;
              setEmailSentDirectly(true);
            }
          }
        } catch (dispatchErr) {
          console.warn('Direct SMTP dispatch fallback:', dispatchErr);
        }

        // 3. If direct SMTP failed or is inactive, fallback to downloading PDF and opening Gmail
        if (!sentDirect) {
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);

          const opened = window.open(targetGmailUrl, '_blank');
          setPopupBlocked(!opened);
        }
      }
      setGmailModalOpen(true);
    } catch (err) {
      console.error('Erro ao gerar PDF e processar envio:', err);
      setValidationWarning('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
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

        {/* Evaluation Form Screen */}
        <BaremaForm
          data={data}
          onChangeData={setData}
          totalScore={totalScore}
          onDownloadPDF={handleDownloadPDF}
          onSubmit={handleFinalizarEEnviar}
          isSending={isFinalizing}
        />
      </main>

      {/* Hidden PDF Template Container for Off-Screen High-Res Rendering */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', overflow: 'hidden' }}>
        <BaremaPDFTemplate ref={templateRef} data={data} totalScore={totalScore} />
      </div>

      {/* Confirmation & Dispatch Modal */}
      <GmailSentModal
        isOpen={gmailModalOpen}
        onClose={() => setGmailModalOpen(false)}
        data={data}
        totalScore={totalScore}
        pdfBlob={pdfBlob}
        gmailUrl={gmailUrl}
        mailtoUrl={mailtoUrl}
        onDownloadPDF={handleDownloadPDF}
        popupBlocked={popupBlocked}
        supabaseSavedUrl={supabaseSavedUrl}
        emailSentDirectly={emailSentDirectly}
      />
    </div>
  );
}
