const express = require('express');
const router = express.Router();
const { getAllUsers, updateRoles, deleteUser } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware(['ADMIN']), getAllUsers);
router.put('/:id/roles', authMiddleware(['ADMIN']), updateRoles);
router.delete('/:id', authMiddleware(['ADMIN']), deleteUser);

module.exports = router;
