const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/agendamentoController');

// Rotas protegidas
router.get('/', auth(['ADMIN', 'PROFESSOR']), ctrl.getAgendamentosPorAula);
router.post('/', auth(['ALUNO', 'ADMIN', 'PROFESSOR']), ctrl.agendarAula);
router.put('/:agendamentoId/cancelar', auth(['ALUNO', 'ADMIN', 'PROFESSOR']), ctrl.cancelarAgendamento);

// Rotas específicas para alunos
router.get('/aluno', auth(['ALUNO']), ctrl.listarAgendamentosAluno);
router.get('/aluno/historico', auth(['ALUNO']), ctrl.listarHistoricoAgendamentosAluno);

module.exports = router;
