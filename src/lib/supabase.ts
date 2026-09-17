import { createClient } from '@supabase/supabase-js';

// Supabase project credentials provided by user
export const SUPABASE_URL =
  ((import.meta as any).env?.VITE_SUPABASE_URL as string) ||
  'https://aofqlgmvupivolkqegsa.supabase.co';

export const SUPABASE_ANON_KEY =
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZnFsZ212dXBpdm9sa3FlZ3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MDM0NDEsImV4cCI6MjEwNTE3OTQ0MX0.Wok6fFpSNgZfdh9w6UQ6woe2OyC9h-VwgfVe6H97xOU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface UploadBaremaResult {
  filePath: string;
  publicUrl: string;
}

/**
 * Uploads a barema PDF file to the 'baremas' Supabase Storage bucket.
 */
export async function uploadBaremaPDF(
  fileBlob: Blob,
  studentName: string
): Promise<UploadBaremaResult> {
  const sanitizedStudent = (studentName || 'aluno')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_');

  const timestamp = Date.now();
  const fileName = `${sanitizedStudent}_${timestamp}.pdf`;
  const filePath = `tccs/${fileName}`;

  const { data, error } = await supabase.storage
    .from('baremas')
    .upload(filePath, fileBlob, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    console.error('Supabase Storage Upload Error:', error);
    throw new Error(`Falha no upload para o Supabase: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('baremas')
    .getPublicUrl(data.path);

  return {
    filePath: data.path,
    publicUrl: publicUrlData.publicUrl,
  };
}

/**
 * Dispatches an email via Supabase Edge Function or webhook service
 */
export async function sendBaremaEmailViaSupabase(payload: {
  studentName: string;
  courseName: string;
  finalScore: number;
  resultStatus: string;
  recipients: string[];
  pdfPublicUrl: string;
  pdfBase64?: string;
}) {
  // Invokes the 'send-barema-email' Edge Function if deployed
  const { data, error } = await supabase.functions.invoke('send-barema-email', {
    body: payload,
  });

  if (error) {
    throw error;
  }

  return data;
}
