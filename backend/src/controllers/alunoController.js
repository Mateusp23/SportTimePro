const prisma = require('../config/db');

exports.getAlunos = async (req, res) => {
  const { clienteId, roles } = req.user;

  if (!roles.includes('ADMIN') && !roles.includes('PROFESSOR')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
    // Buscar alunos
    const alunos = await prisma.usuario.findMany({
      where: {
        clienteId,
        roles: { has: 'ALUNO' }
      },
      select: {
        id: true,
        nome: true,
        email: true,
        criadoEm: true,
        atualizadoEm: true,
        Assinatura: {
          select: {
            status: true,
            dataFim: true,
            plano: {
              select: {
                id: true,
                nome: true
              }
            }
          },
          orderBy: { dataFim: 'desc' },
          take: 1
        }
      }
    });

    const alunosComStatus = alunos.map(aluno => {
      const assinatura = aluno.Assinatura && aluno.Assinatura.length > 0
        ? aluno.Assinatura[0]
        : null;

      let statusPlano = 'Sem plano';
      let planoNome = null;
      let planoId = null;

      if (assinatura) {
        if (assinatura.status === 'ATIVO' && new Date(assinatura.dataFim) >= new Date()) {
          statusPlano = 'Ativo';
        } else {
          statusPlano = 'Expirado';
        }
        planoNome = assinatura.plano.nome;
        planoId = assinatura.plano.id;
      }

      return {
        id: aluno.id,
        nome: aluno.nome,
        email: aluno.email,
        criadoEm: aluno.criadoEm,
        atualizadoEm: aluno.atualizadoEm,
        planoAtual: planoNome,
        planoAtualId: planoId,
        statusPlano
      };
    });

    // Buscar planos disponíveis para o cliente
    const planosDisponiveis = await prisma.plano.findMany({
      where: { clienteId },
      select: {
        id: true,
        nome: true,
        duracaoDias: true,
        preco: true
      }
    });

    res.json({
      alunos: alunosComStatus,
      planosDisponiveis
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
