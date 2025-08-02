const express = require('express');
const router = express.Router();
const { registerCliente, login } = require('../controllers/authController');

router.post('/register-cliente', registerCliente);
router.post('/login', login);

module.exports = router;
