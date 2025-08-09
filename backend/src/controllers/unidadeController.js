const prisma = require('../config/db');

exports.createUnidade = async (req, res) => {
  const { nome, cidade } = req.body;
  const { clienteId } = req.user;

  try {
    const unidade = await prisma.unidade.create({
      data: {
        nome,
        cidade,
        clienteId
      }
    });
    res.json(unidade);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUnidades = async (req, res) => {
  const { clienteId } = req.user;
  try {
    const unidades = await prisma.unidade.findMany({
      where: { clienteId }
    });
    res.json(unidades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUnidade = async (req, res) => {
  const { id } = req.params;
  const { nome, cidade } = req.body;
  const { clienteId } = req.user;

  try {
    const unidade = await prisma.unidade.updateMany({
      where: { id, clienteId },
      data: { nome, cidade }
    });

    if (unidade.count === 0) {
      return res.status(404).json({ message: 'Unidade não encontrada.' });
    }

    res.json({ message: 'Unidade atualizada com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUnidade = async (req, res) => {
  const { id } = req.params;
  const { clienteId } = req.user;

  try {
    // checar vínculos
    const [qtdLocais, qtdAulas] = await Promise.all([
      prisma.local.count({ where: { unidadeId: id, unidade: { clienteId } } }),
      prisma.aula.count({ where: { unidadeId: id, clienteId } }),
    ]);

    if (qtdLocais > 0 || qtdAulas > 0) {
      return res.status(400).json({
        message:
          `Não é possível excluir esta unidade: existem ${qtdLocais} local(is) e ${qtdAulas} aula(s) vinculados. ` +
          `Exclua/mova-os antes de excluir a unidade.`,
      });
    }

    // excluir
    await prisma.unidade.delete({
      where: { id },
    });

    res.json({ message: 'Unidade excluída com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
