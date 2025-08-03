const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Se for usar Gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Função genérica para enviar e-mails
 */
exports.enviarEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"SportTimePro" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 E-mail enviado para ${to}: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ Erro ao enviar e-mail para ${to}:`, error);
    throw new Error('Falha ao enviar e-mail.');
  }
};
