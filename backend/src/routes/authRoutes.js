const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Corrigido para passar funções específicas
router.post('/register-cliente', authController.registerCliente);
router.post('/login', authController.login);
router.post('/register-aluno', authController.registerAluno);
router.post('/register-aluno-invite', authController.registerAlunoViaInvite);
router.get('/confirm-email', authController.confirmarEmail);
router.post('/resend-confirmation', authController.resendConfirmationEmail);

module.exports = router;
