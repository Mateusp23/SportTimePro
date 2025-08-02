const express = require('express');
const router = express.Router();
const { getAlunos } = require('../controllers/alunoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware(['ADMIN']), getAlunos);

module.exports = router;
