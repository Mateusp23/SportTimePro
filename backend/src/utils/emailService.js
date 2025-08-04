const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // Ex: smtp.gmail.com
  port: process.env.SMTP_PORT, // Ex: 587
  secure: false, // true para 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendConfirmationEmail = async (to, token) => {
  const url = `${process.env.FRONTEND_URL}/auth/confirm-email?token=${token}`;

  await transporter.sendMail({
    from: `"SportTimePro" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Confirme seu e-mail',
    html: `
      <h3>Bem-vindo ao SportTimePro!</h3>
      <p>Por favor, confirme seu e-mail clicando no botão abaixo:</p>
      <a href="${url}" style="display:inline-block;padding:10px 20px;background-color:#0066FF;color:white;text-decoration:none;border-radius:5px;">Confirmar E-mail</a>
      <p>Ou copie e cole este link no navegador: ${url}</p>
    `,
  });
};
