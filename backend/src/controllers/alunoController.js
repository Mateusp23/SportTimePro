const prisma = require('../config/db');

exports.getAlunos = async (req, res) => {
  const { clienteId, roles } = req.user;

  if (!roles.includes('ADMIN')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
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
                nome: true
              }
            }
          },
          orderBy: { dataFim: 'desc' }, // Pega assinatura mais recente
          take: 1
        }
      }
    });

    const response = alunos.map(aluno => {
      const assinatura = aluno.Assinatura && aluno.Assinatura.length > 0
        ? aluno.Assinatura[0]
        : null;

      let statusPlano = 'Sem plano';
      let planoNome = null;

      if (assinatura) {
        if (assinatura.status === 'ATIVO' && new Date(assinatura.dataFim) >= new Date()) {
          statusPlano = 'Ativo';
        } else {
          statusPlano = 'Expirado';
        }
        planoNome = assinatura.plano.nome;
      }

      return {
        id: aluno.id,
        nome: aluno.nome,
        email: aluno.email,
        criadoEm: aluno.criadoEm,
        atualizadoEm: aluno.atualizadoEm,
        plano: planoNome,
        statusPlano
      };
    });
    
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
