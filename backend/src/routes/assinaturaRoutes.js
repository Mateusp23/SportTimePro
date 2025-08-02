const express = require('express');
const router = express.Router();
const { atribuirPlano } = require('../controllers/assinaturaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/atribuir', authMiddleware(['ADMIN', 'PROFESSOR']), atribuirPlano);

module.exports = router;
