const prisma = require('../config/db');

exports.getInviteLink = async (req, res) => {
  const { clienteId, roles } = req.user;

  if (!roles.includes('ADMIN') && !roles.includes('PROFESSOR')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
    // URL pública que o aluno usará para registro
    const inviteLink = `${process.env.FRONTEND_URL}/register?clienteId=${clienteId}`;

    res.json({ inviteLink });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
