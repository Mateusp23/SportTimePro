const prisma = require('../config/db');
const crypto = require('crypto');

// Gerar código único
const generateInviteCode = () => crypto.randomBytes(8).toString('hex');

exports.getInviteLink = async (req, res) => {
  const { clienteId, roles } = req.user;

  if (!roles.includes('ADMIN')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      select: { inviteCode: true }
    });

    if (!cliente.inviteCode) {
      const newCode = generateInviteCode();
      await prisma.cliente.update({
        where: { id: clienteId },
        data: { inviteCode: newCode }
      });
      cliente.inviteCode = newCode;
    }

    const inviteLink = `${process.env.FRONTEND_URL}/register?code=${cliente.inviteCode}`;
    res.json({ inviteLink });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.regenerateInviteLink = async (req, res) => {
  const { clienteId, roles } = req.user;

  if (!roles.includes('ADMIN')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
    const newCode = generateInviteCode();
    await prisma.cliente.update({
      where: { id: clienteId },
      data: { inviteCode: newCode }
    });

    const inviteLink = `${process.env.FRONTEND_URL}/register?code=${newCode}`;
    res.json({ message: 'Link regenerado com sucesso', inviteLink });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.disableInviteLink = async (req, res) => {
  const { clienteId, roles } = req.user;

  if (!roles.includes('ADMIN')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
    await prisma.cliente.update({
      where: { id: clienteId },
      data: { inviteCode: null }
    });

    res.json({ message: 'Link desativado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
