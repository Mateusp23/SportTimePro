const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/inviteController');

// Rota pública para validar convite (sem autenticação)
router.get('/validate-invite', ctrl.validateInviteCode);

// Rota pública para buscar academias e professores
router.get('/search-academias', ctrl.searchAcademiasProfessores);

// professor/admin conseguem ler o inviteCode
router.get('/invite-code', auth(['ADMIN', 'PROFESSOR']), ctrl.getInviteCode);

// só admin pode rotacionar
router.post('/invite-code/rotate', auth(['ADMIN']), ctrl.rotateInviteCode);

module.exports = router;
