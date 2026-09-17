import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // API Health Endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Route: Send Email via Gmail & Save PDF to Google Drive
  app.post('/api/submit-barema', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
      }

      const accessToken = authHeader.substring(7);
      const { data, pdfBase64, filename, recipients, totalScore } = req.body;

      if (!data || !pdfBase64) {
        return res.status(400).json({ error: 'Dados da avaliação ou PDF ausentes.' });
      }

      const academicoName = data.academico || 'Aluno';
      const programaName = data.programa || 'Pós-Graduação';
      const pdfFilename = filename || `Barema_TCC_${academicoName.replace(/\s+/g, '_')}.pdf`;

      // Process recipient email list (Default: coord.pos@adventista.edu.br and jozyanne.aguiar@gmail.com)
      let emailList: string[] = ['coord.pos@adventista.edu.br', 'jozyanne.aguiar@gmail.com'];
      if (Array.isArray(recipients) && recipients.length > 0) {
        emailList = recipients.map((e: string) => String(e).trim()).filter((e: string) => e.length > 0);
      }
      if (emailList.length === 0) {
        emailList = ['coord.pos@adventista.edu.br', 'jozyanne.aguiar@gmail.com'];
      }

      // Calculate final result (Aprovado >= 7.0, Reprovado < 7.0)
      let numericScore = typeof totalScore === 'number' ? totalScore : 0;
      if (!numericScore && data.selections) {
        const scoreValues: Record<string, number> = { A: 1.0, B: 0.8, C: 0.5, D: 0.2, E: 0.0 };
        const sum = (Object.values(data.selections) as string[]).reduce((acc: number, val: string) => {
          return acc + (scoreValues[val] || 0);
        }, 0);
        numericScore = Math.round(((sum as number) / 12) * 100) / 10;
      }
      const resultadoFinal = numericScore >= 7.0 ? 'Aprovado' : 'Reprovado';

      // 1. Google Drive: Find or Create Folder "Correção TCCs"
      let folderId = '';
      const driveSearchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        "name='Correção TCCs' and mimeType='application/vnd.google-apps.folder' and trashed=false"
      )}`;

      const searchRes = await fetch(driveSearchUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!searchRes.ok) {
        const errText = await searchRes.text();
        console.error('Erro ao buscar pasta no Drive:', errText);
        return res.status(searchRes.status).json({
          error: `Erro no Google Drive: ${searchRes.statusText}`,
          details: errText,
        });
      }

      const searchData = (await searchRes.json()) as { files?: { id: string }[] };
      if (searchData.files && searchData.files.length > 0) {
        folderId = searchData.files[0].id;
      } else {
        // Create folder "Correção TCCs"
        const createFolderRes = await fetch('https://www.googleapis.com/drive/v3/files', {
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

        if (!createFolderRes.ok) {
          const folderErr = await createFolderRes.text();
          console.error('Erro ao criar pasta no Drive:', folderErr);
          return res.status(createFolderRes.status).json({
            error: 'Não foi possível criar a pasta Correção TCCs no Drive.',
            details: folderErr,
          });
        }

        const folderData = (await createFolderRes.json()) as { id: string };
        folderId = folderData.id;
      }

      // 2. Google Drive: Upload PDF File into Folder
      const metadata = {
        name: pdfFilename,
        parents: [folderId],
        mimeType: 'application/pdf',
      };

      const pdfBuffer = Buffer.from(pdfBase64, 'base64');
      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelim = `\r\n--${boundary}--`;

      const multipartRequestBody = Buffer.concat([
        Buffer.from(
          delimiter +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: application/pdf\r\n\r\n'
        ),
        pdfBuffer,
        Buffer.from(closeDelim),
      ]);

      const uploadRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary="${boundary}"`,
          },
          body: multipartRequestBody,
        }
      );

      if (!uploadRes.ok) {
        const uploadErr = await uploadRes.text();
        console.error('Erro ao salvar PDF no Drive:', uploadErr);
        return res.status(uploadRes.status).json({
          error: 'Falha ao salvar o arquivo no Google Drive.',
          details: uploadErr,
        });
      }

      const uploadedFileData = (await uploadRes.json()) as { id: string };

      // 3. Gmail API: Send Email with PDF Attachment
      // Nome do email: Barema - Y (onde Y = Nome do aluno)
      const emailSubject = `Barema - ${academicoName}`;

      const emailBodyPlain = `Olá,
Segue o trabalho corrigido.
Curso: ${programaName}
Nome do aluno(a): ${academicoName}
O resultado final é: ${resultadoFinal}

Qualquer dúvida, estou à disposição.

Ma. Jozy Anne Miranda Aguiar Castro`;

      const emailBodyHtml = `
        <div style="font-family: Arial, Helvetica, sans-serif; color: #1e293b; line-height: 1.6; font-size: 14px;">
          <p style="margin: 0 0 12px 0;">Olá,</p>
          <p style="margin: 0 0 12px 0;">Segue o trabalho corrigido.</p>
          <p style="margin: 0 0 12px 0;">
            Curso: ${programaName}<br>
            Nome do aluno(a): ${academicoName}<br>
            O resultado final é: <strong>${resultadoFinal}</strong>
          </p>
          <p style="margin: 0 0 16px 0;">Qualquer dúvida, estou à disposição.</p>
          <p style="margin: 0; font-weight: bold; color: #0f172a;">Ma. Jozy Anne Miranda Aguiar Castro</p>
        </div>
      `;

      // Build MIME Message with all recipients in To
      const mimeBoundary = '----=_Part_' + Date.now();
      let rawMime = `To: ${emailList.join(', ')}\r\n`;
      rawMime += `Subject: =?UTF-8?B?${Buffer.from(emailSubject).toString('base64')}?=\r\n`;
      rawMime += `MIME-Version: 1.0\r\n`;
      rawMime += `Content-Type: multipart/mixed; boundary="${mimeBoundary}"\r\n\r\n`;

      rawMime += `--${mimeBoundary}\r\n`;
      rawMime += `Content-Type: text/plain; charset=UTF-8\r\n\r\n`;
      rawMime += `${emailBodyPlain}\r\n\r\n`;

      rawMime += `--${mimeBoundary}\r\n`;
      rawMime += `Content-Type: application/pdf; name="${pdfFilename}"\r\n`;
      rawMime += `Content-Disposition: attachment; filename="${pdfFilename}"\r\n`;
      rawMime += `Content-Transfer-Encoding: base64\r\n\r\n`;
      rawMime += `${pdfBase64}\r\n\r\n`;
      rawMime += `--${mimeBoundary}--`;

      const encodedMime = Buffer.from(rawMime)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const sendMailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encodedMime }),
      });

      if (!sendMailRes.ok) {
        const mailErr = await sendMailRes.text();
        console.error('Erro ao enviar e-mail via Gmail API:', mailErr);
        return res.status(sendMailRes.status).json({
          error: 'Falha ao enviar o e-mail via Gmail.',
          details: mailErr,
          driveSaved: true,
          driveFileId: uploadedFileData.id,
        });
      }

      return res.json({
        success: true,
        pdfGenerated: true,
        emailSent: true,
        driveSaved: true,
        driveFileId: uploadedFileData.id,
        recipients: emailList,
        subject: emailSubject,
        folderName: 'Correção TCCs',
      });
    } catch (err: any) {
      console.error('Erro no processamento backend:', err);
      return res.status(500).json({ error: 'Erro interno no servidor', details: err.message });
    }
  });

  // Vite Development / Production Static Server Setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

startServer();
