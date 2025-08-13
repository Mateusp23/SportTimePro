const express = require('express');
const router = express.Router();
const { agendarAula, getAlunosPorAula, cancelarAgendamento,
  getAgendamentosCancelados, getHistoricoAluno, getAgendamentosPorAula, agendarAlunoNaAula } = require('../controllers/agendamentoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware(['ALUNO', 'ADMIN', 'PROFESSOR']), agendarAula);
router.get('/:aulaId/alunos', authMiddleware(['ADMIN', 'PROFESSOR']), getAlunosPorAula);
router.put('/:agendamentoId/cancelar', authMiddleware(['ALUNO', 'ADMIN', 'PROFESSOR']), cancelarAgendamento);
router.get('/:aulaId/cancelados', authMiddleware(['ADMIN', 'PROFESSOR']), getAgendamentosCancelados);
router.get('/historico', authMiddleware(['ALUNO']), getHistoricoAluno);
router.get('/aula/:aulaId', authMiddleware(['ADMIN', 'PROFESSOR']), getAgendamentosPorAula);
// routes/agendamentoRoutes.js
router.post('/admin/agendar', authMiddleware(['ADMIN', 'PROFESSOR']), agendarAlunoNaAula);

module.exports = router;
