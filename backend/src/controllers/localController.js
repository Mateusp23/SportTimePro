const prisma = require('../config/db');

exports.createLocal = async (req, res) => {
  const { nome, unidadeId } = req.body;
  const { clienteId } = req.user;

  try {
    const unidade = await prisma.unidade.findFirst({
      where: { id: unidadeId, clienteId }
    });

    if (!unidade) {
      return res.status(404).json({ message: 'Unidade não encontrada.' });
    }

    const local = await prisma.local.create({
      data: {
        nome,
        unidadeId
      }
    });

    res.json(local);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLocais = async (req, res) => {
  const { clienteId } = req.user;

  try {
    const locais = await prisma.local.findMany({
      where: {
        unidade: { clienteId }
      },
      include: {
        unidade: {
          select: {
            id: true,
            nome: true,
            cidade: true
          }
        }
      }
    });
    res.json(locais);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLocal = async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  const { clienteId } = req.user;

  try {
    const local = await prisma.local.updateMany({
      where: {
        id,
        unidade: { clienteId }
      },
      data: { nome }
    });

    if (local.count === 0) {
      return res.status(404).json({ message: 'Local não encontrado.' });
    }

    res.json({ message: 'Local atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteLocal = async (req, res) => {
  const { id } = req.params;
  const { clienteId } = req.user;

  try {
    const local = await prisma.local.deleteMany({
      where: {
        id,
        unidade: { clienteId }
      }
    });

    if (local.count === 0) {
      return res.status(404).json({ message: 'Local não encontrado.' });
    }

    res.json({ message: 'Local excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
