import type { IncomingMessage, ServerResponse } from 'http';
import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, pdfBase64, filename, totalScore } = req.body || {};

    if (!data || !pdfBase64) {
      return res.status(400).json({ error: 'Dados da avaliação ou PDF ausentes.' });
    }

    const academicoName = (data.academico || 'Aluno').trim();
    const programaName = (data.programa || 'Pós-Graduação').trim();
    const pdfFilename = filename || `Barema_TCC_${academicoName.replace(/\s+/g, '_')}.pdf`;
    const resultadoFinal = (typeof totalScore === 'number' ? totalScore : 0) >= 7.0 ? 'Aprovado' : 'Reprovado';

    const emailSubject = `Barema - ${academicoName}`;
    const emailList = ['coord.pos@adventista.edu.br', 'jozyanne.aguiar@gmail.com'];

    const emailBodyPlain = `Olá,\nSegue o trabalho corrigido.\nCurso: ${programaName}\nNome do aluno(a): ${academicoName}\nO resultado final é: ${resultadoFinal}\n\nQualquer dúvida, estou à disposição.\n\nMa. Jozy Anne Miranda Aguiar Castro`;

    const emailBodyHtml = `
      <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6; font-size: 14px;">
        <p>Olá,</p>
        <p>Segue o trabalho corrigido.</p>
        <p style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 12px; margin: 16px 0; border-radius: 4px;">
          <strong>Curso:</strong> ${programaName}<br>
          <strong>Nome do aluno(a):</strong> ${academicoName}<br>
          <strong>O resultado final é:</strong> <strong>${resultadoFinal}</strong>
        </p>
        <p>Qualquer dúvida, estou à disposição.</p>
        <br>
        <p><strong>Ma. Jozy Anne Miranda Aguiar Castro</strong></p>
      </div>
    `;

    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || 'jozyanne.aguiar@gmail.com';
    const smtpPass = (
      process.env.SMTP_PASS ||
      process.env.GMAIL_PASS ||
      process.env.GMAIL_APP_PASSWORD ||
      'knvo ofix cccu qdrl'
    ).replace(/\s+/g, '');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    await transporter.sendMail({
      from: `"Ma. Jozy Anne Miranda Aguiar Castro" <${smtpUser}>`,
      to: emailList.join(', '),
      subject: emailSubject,
      text: emailBodyPlain,
      html: emailBodyHtml,
      attachments: [
        {
          filename: pdfFilename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return res.status(200).json({
      success: true,
      method: 'vercel_serverless_smtp',
      recipients: emailList,
      subject: emailSubject,
      message: 'E-mail enviado automaticamente com sucesso via Gmail SMTP!',
    });
  } catch (err: any) {
    console.error('Erro ao enviar e-mail na Vercel:', err);
    return res.status(500).json({ error: 'Erro ao enviar e-mail', details: err.message });
  }
}
