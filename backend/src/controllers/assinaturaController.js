const prisma = require('../config/db');

exports.atribuirPlano = async (req, res) => {
  const { alunoId, planoId, dataInicio, dataFim, renovacaoAutomatica, tipoAtivacao } = req.body;
  const { clienteId, roles } = req.user;

  if (!roles.includes('ADMIN') && !roles.includes('PROFESSOR')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
    // Verificar se o aluno pertence ao mesmo cliente
    const aluno = await prisma.usuario.findFirst({
      where: { id: alunoId, clienteId, roles: { has: 'ALUNO' } }
    });
    if (!aluno) {
      return res.status(404).json({ message: 'Aluno não encontrado.' });
    }

    // Verificar se o plano pertence ao mesmo cliente
    const plano = await prisma.plano.findFirst({
      where: { id: planoId, clienteId }
    });
    if (!plano) {
      return res.status(404).json({ message: 'Plano não encontrado.' });
    }

    // Criar assinatura
    const assinatura = await prisma.assinatura.create({
      data: {
        alunoId,
        planoId,
        dataInicio: dataInicio ? new Date(dataInicio) : new Date(),
        dataFim: new Date(dataFim),
        status: 'ATIVO',
        renovacaoAutomatica: renovacaoAutomatica ?? false,
        tipoAtivacao: tipoAtivacao ?? 'MANUAL'
      },
      include: {
        plano: true,
        aluno: { select: { nome: true, email: true } }
      }
    });

    res.json({
      message: 'Plano atribuído com sucesso',
      assinatura
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
