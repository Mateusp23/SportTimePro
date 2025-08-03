const prisma = require('../config/db');

exports.createAula = async (req, res) => {
  const { modalidade, professorId, unidadeId, localId, dataHoraInicio, dataHoraFim, vagasTotais } = req.body;
  const { clienteId, roles } = req.user;

  if (!roles.includes('ADMIN') && !roles.includes('PROFESSOR')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
    // Verificar professor
    const professor = await prisma.usuario.findFirst({
      where: { id: professorId, clienteId, roles: { has: 'PROFESSOR' } }
    });
    if (!professor) return res.status(404).json({ message: 'Professor não encontrado.' });

    // Verificar unidade
    const unidade = await prisma.unidade.findFirst({
      where: { id: unidadeId, clienteId }
    });
    if (!unidade) return res.status(404).json({ message: 'Unidade não encontrada.' });

    // Verificar local
    const local = await prisma.local.findFirst({
      where: { id: localId, unidade: { clienteId } }
    });
    if (!local) return res.status(404).json({ message: 'Local não encontrado.' });

    // Verificar indisponibilidade do professor
    const indisponivel = await prisma.indisponibilidadeProfessor.findFirst({
      where: {
        professorId,
        OR: [
          {
            dataInicio: { lte: new Date(dataHoraInicio) },
            dataFim: { gte: new Date(dataHoraInicio) }
          },
          {
            dataInicio: { lte: new Date(dataHoraFim) },
            dataFim: { gte: new Date(dataHoraFim) }
          }
        ]
      }
    });
    if (indisponivel) {
      return res.status(400).json({ message: 'Professor está indisponível neste horário.' });
    }

    // Criar aula
    const aula = await prisma.aula.create({
      data: {
        modalidade,
        professorId,
        unidadeId,
        localId,
        dataHoraInicio: new Date(dataHoraInicio),
        dataHoraFim: new Date(dataHoraFim),
        vagasTotais,
        clienteId
      },
      include: {
        professor: { select: { nome: true } },
        unidade: { select: { nome: true } },
        local: { select: { nome: true } }
      }
    });

    res.json({ message: 'Aula criada com sucesso', aula });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAulas = async (req, res) => {
  const { clienteId } = req.user;

  try {
    const aulas = await prisma.aula.findMany({
      where: { clienteId },
      include: {
        professor: { select: { nome: true } },
        unidade: { select: { nome: true } },
        local: { select: { nome: true } }
      },
      orderBy: { dataHoraInicio: 'asc' }
    });

    res.json(aulas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAulasDisponiveis = async (req, res) => {
  const { modalidade, data } = req.query;
  const { clienteId, roles } = req.user;

  if (!roles.includes('ALUNO')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
    const inicioDia = new Date(`${data}T00:00:00`);
    const fimDia = new Date(`${data}T23:59:59`);

    const aulas = await prisma.aula.findMany({
      where: {
        modalidade,
        clienteId,
        dataHoraInicio: {
          gte: inicioDia,
          lte: fimDia
        }
      },
      include: {
        professor: { select: { id: true, nome: true } },
        unidade: { select: { nome: true } },
        local: { select: { nome: true } },
        agendamentos: {
          where: { status: 'ATIVO' } // conta apenas alunos ativos
        }
      },
      orderBy: { dataHoraInicio: 'asc' }
    });

    const aulasDisponiveis = aulas
      .map(aula => {
        const vagasRestantes = aula.vagasTotais - aula.agendamentos.length;
        return {
          id: aula.id,
          modalidade: aula.modalidade,
          dataHoraInicio: aula.dataHoraInicio,
          dataHoraFim: aula.dataHoraFim,
          professor: aula.professor.nome,
          unidade: aula.unidade.nome,
          local: aula.local.nome,
          vagasRestantes
        };
      })
      .filter(aula => vagasRestantes > 0);

    res.json(aulasDisponiveis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
