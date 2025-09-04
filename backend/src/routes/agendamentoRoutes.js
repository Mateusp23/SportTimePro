const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/agendamentoController');

// Rotas protegidas
router.get('/', auth(['ADMIN', 'PROFESSOR']), ctrl.getAgendamentosPorAula);
router.post('/', auth(['ALUNO', 'ADMIN', 'PROFESSOR']), ctrl.agendarAula);
router.put('/:agendamentoId/cancelar', auth(['ALUNO', 'ADMIN', 'PROFESSOR']), ctrl.cancelarAgendamento);
router.delete('/:agendamentoId', auth(['ALUNO', 'ADMIN', 'PROFESSOR']), ctrl.cancelarAgendamento);

// Rota para buscar alunos inscritos em uma aula específica
router.get('/:aulaId/alunos', auth(['ADMIN', 'PROFESSOR']), ctrl.getAlunosPorAula);

// Rotas específicas para alunos
router.get('/aluno', auth(['ALUNO']), ctrl.listarAgendamentosAluno);
router.get('/aluno/historico', auth(['ALUNO']), ctrl.listarHistoricoAgendamentosAluno);

// Rotas para séries recorrentes
router.post('/serie-recorrente', auth(['ALUNO']), ctrl.agendarSerieRecorrente);
router.delete('/serie-recorrente/:serieId', auth(['ALUNO']), ctrl.cancelarSerieRecorrente);

module.exports = router;
