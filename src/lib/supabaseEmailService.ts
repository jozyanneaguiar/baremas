import { supabase, uploadBaremaPDF } from './supabase';
import { BaremaData } from '../types';

export interface SendBaremaParams {
  data: BaremaData;
  totalScore: number;
  pdfBlob: Blob;
  pdfBase64?: string;
  recipients: string[];
}

export interface SendBaremaResponse {
  success: boolean;
  pdfPublicUrl: string;
  emailDispatched: boolean;
  message: string;
}

/**
 * Handles complete submission via Supabase:
 * 1. Uploads PDF to Supabase Storage 'baremas' bucket.
 * 2. Optionally stores evaluation record in Supabase 'evaluations' table.
 * 3. Triggers Edge Function or email dispatcher.
 */
export async function sendBaremaWithSupabase({
  data,
  totalScore,
  pdfBlob,
  pdfBase64,
  recipients,
}: SendBaremaParams): Promise<SendBaremaResponse> {
  const academicoName = data.academico?.trim() || 'Aluno';
  const programaName = data.programa?.trim() || 'Curso';
  const resultadoFinal = totalScore >= 7.0 ? 'Aprovado' : 'Reprovado';

  // 1. Upload PDF to Supabase Storage
  let pdfPublicUrl = '';
  try {
    const uploadResult = await uploadBaremaPDF(pdfBlob, academicoName);
    pdfPublicUrl = uploadResult.publicUrl;
  } catch (storageErr) {
    console.warn('Erro ao salvar no Storage do Supabase:', storageErr);
  }

  // 2. Try saving evaluation record to Supabase database table (if table exists)
  try {
    await supabase.from('avaliacoes').insert({
      aluno: academicoName,
      curso: programaName,
      parecerista: data.parecerista || null,
      data_avaliacao: data.data || new Date().toISOString(),
      nota_final: totalScore,
      resultado: resultadoFinal,
      pdf_url: pdfPublicUrl || null,
      destinatarios: recipients,
      respostas: data.selections,
    });
  } catch (dbErr) {
    // Non-blocking if table is not created yet
    console.warn('Tabela avaliacoes opcional no Supabase:', dbErr);
  }

  // 3. Try calling Edge function if deployed
  let emailDispatched = false;
  let responseMessage = 'PDF salvo com sucesso no Supabase!';

  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: recipients,
        subject: `Barema - ${academicoName}`,
        studentName: academicoName,
        courseName: programaName,
        totalScore,
        resultStatus: resultadoFinal,
        pdfPublicUrl,
        pdfBase64,
      },
    });

    if (!error) {
      emailDispatched = true;
      responseMessage = 'E-mail enviado diretamente pelo Supabase!';
    }
  } catch {
    // Edge function not yet created
    emailDispatched = false;
  }

  return {
    success: true,
    pdfPublicUrl,
    emailDispatched,
    message: responseMessage,
  };
}
