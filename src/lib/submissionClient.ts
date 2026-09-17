import { BaremaData } from '../types';

export interface SubmitBaremaParams {
  data: BaremaData;
  totalScore: number;
  pdfBase64: string;
  pdfBlob: Blob;
  recipients?: string[];
  accessToken: string;
}

export async function submitBarema({
  data,
  totalScore,
  pdfBase64,
  pdfBlob,
  recipients = ['coord.pos@adventista.edu.br', 'jozyanne.aguiar@gmail.com'],
  accessToken,
}: SubmitBaremaParams) {
  const academicoName = data.academico?.trim() || 'Aluno';
  const programaName = data.programa?.trim() || 'Pós-Graduação';
  const filename = `Barema_TCC_${academicoName.replace(/\s+/g, '_')}.pdf`;
  const resultadoFinal = totalScore >= 7.0 ? 'Aprovado' : 'Reprovado';
  const emailSubject = `Barema - ${academicoName}`;
  const emailBodyPlain = `Olá,
Segue o trabalho corrigido.
Curso: ${programaName}
Nome do aluno(a): ${academicoName}
O resultado final é: ${resultadoFinal}

Qualquer dúvida, estou à disposição.

Ma. Jozy Anne Miranda Aguiar Castro`;

  // First try the backend server route (/api/submit-barema)
  try {
    const response = await fetch('/api/submit-barema', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        data,
        totalScore,
        pdfBase64,
        filename,
        recipients,
      }),
    });

    if (response.ok) {
      const resData = await response.json();
      if (resData.success) {
        return resData;
      }
    } else if (response.status !== 404 && response.status !== 502) {
      const errJson = await response.json().catch(() => null);
      if (errJson?.error) {
        throw new Error(errJson.error + (errJson.details ? ` (${errJson.details})` : ''));
      }
    }
  } catch (err: any) {
    if (err.message && !err.message.includes('404') && !err.message.includes('Failed to fetch')) {
      throw err;
    }
  }

  // Fallback: Client-side Direct Google API calls (Drive + Gmail)
  // Guarantees delivery even on static Vercel deployments
  // 1. Google Drive save
  try {
    let folderId = '';
    const driveSearch = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        "name='Correção TCCs' and mimeType='application/vnd.google-apps.folder' and trashed=false"
      )}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (driveSearch.ok) {
      const searchData = await driveSearch.json();
      if (searchData.files && searchData.files.length > 0) {
        folderId = searchData.files[0].id;
      } else {
        const createFolder = await fetch('https://www.googleapis.com/drive/v3/files', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Correção TCCs',
            mimeType: 'application/vnd.google-apps.folder',
          }),
        });
        if (createFolder.ok) {
          const folderData = await createFolder.json();
          folderId = folderData.id;
        }
      }
    }

    if (folderId) {
      const metadata = {
        name: filename,
        parents: [folderId],
        mimeType: 'application/pdf',
      };
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', pdfBlob, filename);

      await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      });
    }
  } catch (driveErr) {
    console.warn('Aviso: Não foi possível sincronizar cópia no Drive:', driveErr);
  }

  // 2. Direct Gmail API message
  const boundary = '----=_Part_' + Date.now();
  const encodedSubject = btoa(unescape(encodeURIComponent(emailSubject)));
  const mimeParts = [
    `To: ${recipients.join(', ')}`,
    `Subject: =?UTF-8?B?${encodedSubject}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    ``,
    emailBodyPlain,
    ``,
    `--${boundary}`,
    `Content-Type: application/pdf; name="${filename}"`,
    `Content-Disposition: attachment; filename="${filename}"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    pdfBase64,
    ``,
    `--${boundary}--`,
  ];

  const rawMime = mimeParts.join('\r\n');
  const safeBase64 = btoa(unescape(encodeURIComponent(rawMime)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const mailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: safeBase64 }),
  });

  if (!mailRes.ok) {
    const errText = await mailRes.text();
    throw new Error(`Falha ao enviar e-mail via Gmail API (${mailRes.status}): ${errText}`);
  }

  return { success: true, recipients, emailSubject };
}
