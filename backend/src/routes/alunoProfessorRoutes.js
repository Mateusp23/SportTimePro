// src/routes/alunoProfessorRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/alunoProfessorController');
const auth = require('../middlewares/authMiddleware');

// Vincular / Desvincular (ADMIN ou PROFESSOR)
router.post(
  '/professores/:professorId/alunos/:alunoId',
  auth(['ADMIN', 'PROFESSOR']),
  ctrl.linkAlunoProfessor
);

router.delete(
  '/professores/:professorId/alunos/:alunoId',
  auth(['ADMIN', 'PROFESSOR']),
  ctrl.unlinkAlunoProfessor
);

// Listar alunos do professor (ADMIN ou PROFESSOR)
router.get(
  '/professores/:professorId/alunos',
  auth(['ADMIN', 'PROFESSOR']),
  ctrl.listAlunosDoProfessor
);

// Listar professores do aluno (ALUNO pode ver o seu; ADMIN/PROF podem ver de qualquer aluno do cliente)
router.get(
  '/alunos/:alunoId/professores',
  auth(['ADMIN', 'PROFESSOR', 'ALUNO']),
  ctrl.listProfessoresDoAluno
);

module.exports = router;
