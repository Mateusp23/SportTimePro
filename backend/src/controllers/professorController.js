const prisma = require('../config/db');
const bcrypt = require('bcrypt');

exports.createProfessor = async (req, res) => {
  const { nome, email, senha, roles } = req.body;
  const { clienteId } = req.user;

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    const professor = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        roles: roles && roles.length > 0 ? roles : ['PROFESSOR'],
        clienteId
      }
    });

    res.json(professor);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.getProfessores = async (req, res) => {
  const { clienteId } = req.user;

  try {
    const professores = await prisma.usuario.findMany({
      where: { clienteId, roles: { has: 'PROFESSOR' } }
    });
    res.json(professores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfessor = async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha, roles } = req.body;
  const { clienteId } = req.user;

  try {
    const data = { nome, email };
    if (senha) data.senhaHash = await bcrypt.hash(senha, 10);
    if (roles) data.roles = roles;

    const professor = await prisma.usuario.updateMany({
      where: { id, clienteId, roles: { has: 'PROFESSOR' } },
      data
    });

    if (professor.count === 0) {
      return res.status(404).json({ message: 'Professor não encontrado.' });
    }

    res.json({ message: 'Professor atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProfessor = async (req, res) => {
  const { id } = req.params;
  const { clienteId } = req.user;

  try {
    const professor = await prisma.usuario.deleteMany({
      where: { id, clienteId, roles: { has: 'PROFESSOR' } }
    });

    if (professor.count === 0) {
      return res.status(404).json({ message: 'Professor não encontrado.' });
    }

    res.json({ message: 'Professor excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listarProfessoresAcademia = async (req, res) => {
  const { clienteId } = req.user;
  
  try {
    const professores = await prisma.usuario.findMany({
      where: {
        clienteId: clienteId,
        roles: { has: 'PROFESSOR' }
      },
      select: {
        id: true,
        nome: true,
        email: true,
        roles: true
      },
      orderBy: { nome: 'asc' }
    });

    res.json(professores);
  } catch (error) {
    console.error('Erro ao listar professores da academia:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
