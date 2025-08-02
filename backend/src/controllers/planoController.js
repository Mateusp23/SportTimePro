const prisma = require('../config/db');

exports.createPlano = async (req, res) => {
  const { nome, duracaoDias, preco } = req.body;
  const { clienteId, role } = req.user;

  if (role !== 'ADMIN') {
    return res.status(403).json({ message: 'Apenas administradores podem criar planos.' });
  }

  try {
    const plano = await prisma.plano.create({
      data: {
        nome,
        duracaoDias,
        preco,
        clienteId
      }
    });

    res.json(plano);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPlanos = async (req, res) => {
  const { clienteId } = req.user;
  try {
    const planos = await prisma.plano.findMany({
      where: { clienteId }
    });
    res.json(planos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePlano = async (req, res) => {
  const { id } = req.params;
  const { nome, duracaoDias, preco, ativo } = req.body;
  const { clienteId, role } = req.user;

  if (role !== 'ADMIN') {
    return res.status(403).json({ message: 'Apenas administradores podem atualizar planos.' });
  }

  try {
    const plano = await prisma.plano.updateMany({
      where: { id, clienteId },
      data: { nome, duracaoDias, preco, ativo }
    });

    if (plano.count === 0) {
      return res.status(404).json({ message: 'Plano não encontrado.' });
    }

    res.json({ message: 'Plano atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePlano = async (req, res) => {
  const { id } = req.params;
  const { clienteId, role } = req.user;

  if (role !== 'ADMIN') {
    return res.status(403).json({ message: 'Apenas administradores podem excluir planos.' });
  }

  try {
    const plano = await prisma.plano.deleteMany({
      where: { id, clienteId }
    });

    if (plano.count === 0) {
      return res.status(404).json({ message: 'Plano não encontrado.' });
    }

    res.json({ message: 'Plano excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
