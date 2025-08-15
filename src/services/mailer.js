import nodemailer from 'nodemailer';

let transporter = null;
function getTransporter(){
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  return transporter;
}

export async function sendMail({ to, subject, html, text }){
  if (!process.env.SMTP_HOST) return;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const tx = await getTransporter().sendMail({ from, to, subject, html, text });
  return tx;
}
