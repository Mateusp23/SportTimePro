const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/aulaController');
const { createRecorrencia } = require('../controllers/aulaController');

// Rotas públicas (se houver)
// router.get('/public', ctrl.listarAulasPublicas);

// Rotas protegidas
router.get('/', auth(['ADMIN', 'PROFESSOR']), ctrl.getAulas);
router.get('/recorrencias', auth(['ADMIN', 'PROFESSOR']), ctrl.getRecorrencias);

// Rotas específicas para agendamentos (aulas que têm alunos inscritos)
router.get('/agendamentos', auth(['ADMIN', 'PROFESSOR']), ctrl.getAulasComAgendamentos);
router.get('/agendamentos/recorrencias', auth(['ADMIN', 'PROFESSOR']), ctrl.getRecorrenciasComAgendamentos);

// Rotas para aulas sem agendamentos (futuras mas vazias)
router.get('/sem-agendamentos', auth(['ADMIN', 'PROFESSOR']), ctrl.getAulasSemAgendamentos);
router.get('/sem-agendamentos/recorrencias', auth(['ADMIN', 'PROFESSOR']), ctrl.getRecorrenciasSemAgendamentos);

// Rotas para histórico (aulas passadas)
router.get('/historico', auth(['ADMIN', 'PROFESSOR']), ctrl.getAulasPassadas);
router.get('/historico/recorrencias', auth(['ADMIN', 'PROFESSOR']), ctrl.getRecorrenciasPassadas);

router.post('/', auth(['ADMIN', 'PROFESSOR']), ctrl.createAula);
router.put('/:id', auth(['ADMIN', 'PROFESSOR']), ctrl.updateAula);
router.delete('/:id', auth(['ADMIN', 'PROFESSOR']), ctrl.deleteAula);
router.post('/recorrentes', auth(['ADMIN', 'PROFESSOR']), ctrl.createAulasRecorrentes);
router.post('/recorrencias', auth(['PROFESSOR', 'ADMIN']), createRecorrencia);
router.delete('/recorrencias/:id', auth(['PROFESSOR', 'ADMIN']), ctrl.deleteRecorrencia);

// Rota específica para alunos verem suas aulas
router.get('/aluno', auth(['ALUNO']), ctrl.listarAulasAluno);

// Rota para alunos verem aulas dos professores vinculados
router.get('/professores-vinculados', auth(['ALUNO']), ctrl.listarAulasProfessoresVinculados);

// Rota para alunos verem séries recorrentes disponíveis
router.get('/recorrencias-disponiveis', auth(['ALUNO']), ctrl.listarRecorrenciasDisponiveis);

module.exports = router;
