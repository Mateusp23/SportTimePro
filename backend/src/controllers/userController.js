const prisma = require('../config/db');

// Já temos getAllUsers e updateRoles
exports.getAllUsers = async (req, res) => {
  const { clienteId } = req.user;

  try {
    const users = await prisma.usuario.findMany({
      where: {
        clienteId,
        roles: {
          hasSome: ['ADMIN', 'PROFESSOR']
        }
      },
      select: {
        id: true,
        nome: true,
        email: true,
        roles: true
      }
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRoles = async (req, res) => {
  const { id } = req.params;
  const { roles: newRoles } = req.body;
  const { clienteId, roles: currentUserRoles, userId } = req.user;

  if (!currentUserRoles.includes('ADMIN')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  // Impedir remover o próprio papel de ADMIN
  if (id === userId && !newRoles.includes('ADMIN')) {
    return res.status(400).json({
      message: 'Você não pode remover seu próprio papel de ADMIN.'
    });
  }

  try {
    const user = await prisma.usuario.updateMany({
      where: { id, clienteId },
      data: { roles: newRoles }
    });

    if (user.count === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json({ message: 'Papéis atualizados com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Novo método para deletar usuários
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const { clienteId, roles, userId } = req.user;

  if (!roles.includes('ADMIN')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  // Impedir auto-exclusão
  if (id === userId) {
    return res.status(400).json({
      message: 'Você não pode excluir sua própria conta de administrador.'
    });
  }

  try {
    const deleted = await prisma.usuario.deleteMany({
      where: { id, clienteId }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
