const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/solicitacaoVinculoController');

// Alunos podem criar solicitações
router.post('/', auth(['ALUNO']), ctrl.criarSolicitacao);

// Professores/admins podem listar solicitações recebidas
router.get('/', auth(['PROFESSOR', 'ADMIN']), ctrl.listarSolicitacoesRecebidas);

// Professores/admins podem responder solicitações
router.put('/:id/responder', auth(['PROFESSOR', 'ADMIN']), ctrl.responderSolicitacao);

// Alunos podem verificar o status do seu vínculo
router.get('/status', auth(['ALUNO']), ctrl.verificarStatusVinculo);

module.exports = router;
