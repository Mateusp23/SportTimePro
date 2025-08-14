const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');

// Corrigido para passar funções específicas
router.post('/register-cliente', authController.registerCliente);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/register-aluno', authController.registerAluno);
router.post('/register-aluno-invite', authController.registerAlunoViaInvite);
router.get('/confirm-email', authController.confirmarEmail);

// Rota para buscar informações do usuário logado
router.get('/me', auth(['ADMIN', 'PROFESSOR', 'ALUNO']), authController.getMe);

module.exports = router;
