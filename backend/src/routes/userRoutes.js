const express = require('express');
const router = express.Router();
const { getAllUsers, updateRoles, deleteUser, updateProfile } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/avatars'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.user.userId + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage });

router.get('/', authMiddleware(['ADMIN']), getAllUsers);
router.put('/:id/roles', authMiddleware(['ADMIN']), updateRoles);
router.delete('/:id', authMiddleware(['ADMIN']), deleteUser);
router.put('/me', authMiddleware(), updateProfile);
router.post('/me/avatar', authMiddleware(), upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Arquivo não enviado.' });
  // Salvar a URL do avatar no usuário
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  try {
    await require('../config/db').usuario.update({
      where: { id: req.user.userId },
      data: { avatarUrl }
    });
    res.json({ avatarUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
