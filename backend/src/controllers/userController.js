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

// Atualizar perfil do próprio usuário
exports.updateProfile = async (req, res) => {
  const userId = req.user.userId;
  const { nome, email, senha, senhaAtual, telefone, dataNascimento, endereco, avatarUrl, preferencias } = req.body;

  const dataToUpdate = {};
  if (nome) dataToUpdate.nome = nome;
  if (email) dataToUpdate.email = email;
  if (telefone) dataToUpdate.telefone = telefone;
  if (dataNascimento) dataToUpdate.dataNascimento = new Date(dataNascimento);
  if (endereco) dataToUpdate.endereco = endereco;
  if (avatarUrl) dataToUpdate.avatarUrl = avatarUrl;
  if (preferencias) dataToUpdate.preferencias = preferencias;

  // Atualizar senha se fornecida
  if (senha) {
    if (!senhaAtual) {
      return res.status(400).json({ message: 'Informe a senha atual para alterar a senha.' });
    }
    const bcrypt = require('bcryptjs');
    const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senhaHash);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Senha atual incorreta.' });
    }
    const salt = await bcrypt.genSalt(10);
    dataToUpdate.senhaHash = await bcrypt.hash(senha, salt);
  }

  try {
    const usuario = await prisma.usuario.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        dataNascimento: true,
        endereco: true,
        avatarUrl: true,
        preferencias: true,
        roles: true
      }
    });
    res.json(usuario);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ message: 'Email já está em uso.' });
    }
    res.status(500).json({ message: err.message });
  }
};
