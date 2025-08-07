const prisma = require('../config/db');
const { addDays, isBefore, parseISO, formatISO } = require('date-fns');
const { isProfessorUnavailable } = require('../utils/verificaIndisponibilidade');

exports.createAula = async (req, res) => {
  const { modalidade, professorId: professorIdBody, unidadeId, localId, dataHoraInicio, dataHoraFim, vagasTotais } = req.body;
  const { clienteId, roles, userId } = req.user;

  if (!roles.includes('ADMIN') && !roles.includes('PROFESSOR')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  const professorId = professorIdBody || (roles.includes('ADMIN') ? userId : null);

  try {
    const professor = await prisma.usuario.findFirst({
      where: { id: professorId, clienteId, roles: { has: 'PROFESSOR' } }
    });
    if (!professor) return res.status(404).json({ message: 'Professor não encontrado.' });

    const unidade = await prisma.unidade.findFirst({
      where: { id: unidadeId, clienteId }
    });
    if (!unidade) return res.status(404).json({ message: 'Unidade não encontrada.' });

    const local = await prisma.local.findFirst({
      where: { id: localId, unidade: { clienteId } }
    });
    if (!local) return res.status(404).json({ message: 'Local não encontrado.' });

    const indisponivel = await isProfessorUnavailable(professorId, dataHoraInicio, dataHoraFim);
    if (indisponivel) {
      return res.status(400).json({ message: 'Professor está indisponível neste horário.' });
    }

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

exports.updateAula = async (req, res) => {
  const { aulaId } = req.params;
  const { clienteId, roles } = req.user;

  if (!roles.includes('ADMIN') && !roles.includes('PROFESSOR')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
    const { modalidade, professorId, unidadeId, localId, dataHoraInicio, dataHoraFim, vagasTotais } = req.body;

    // Verificar se a aula existe e pertence ao cliente
    const aulaExistente = await prisma.aula.findFirst({
      where: { id: aulaId, clienteId }
    });

    if (!aulaExistente) {
      return res.status(404).json({ message: 'Aula não encontrada.' });
    }

    // Atualizar dados da aula
    const aulaAtualizada = await prisma.aula.update({
      where: { id: aulaId },
      data: {
        modalidade: modalidade || aulaExistente.modalidade,
        professorId: professorId || aulaExistente.professorId,
        unidadeId: unidadeId || aulaExistente.unidadeId,
        localId: localId || aulaExistente.localId,
        dataHoraInicio: dataHoraInicio ? new Date(dataHoraInicio) : aulaExistente.dataHoraInicio,
        dataHoraFim: dataHoraFim ? new Date(dataHoraFim) : aulaExistente.dataHoraFim,
        vagasTotais: vagasTotais || aulaExistente.vagasTotais
      },
      include: {
        professor: { select: { nome: true } },
        unidade: { select: { nome: true } },
        local: { select: { nome: true } }
      }
    });

    res.json({ message: 'Aula atualizada com sucesso', aulaAtualizada });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAula = async (req, res) => {
  const { aulaId } = req.params;
  const { clienteId, roles } = req.user;

  if (!roles.includes('ADMIN') && !roles.includes('PROFESSOR')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
    // Verificar se aula existe
    const aula = await prisma.aula.findFirst({
      where: { id: aulaId, clienteId },
      include: {
        agendamentos: {
          where: { status: 'ATIVO' },
          include: { aluno: { select: { id: true, nome: true, email: true } } }
        }
      }
    });

    if (!aula) {
      return res.status(404).json({ message: 'Aula não encontrada.' });
    }

    // Cancelar todos os agendamentos ativos
    if (aula.agendamentos.length > 0) {
      await prisma.agendamento.updateMany({
        where: { aulaId, status: 'ATIVO' },
        data: { status: 'CANCELADO' }
      });

      // 🚩 Aqui podemos futuramente disparar emails/notificações
      console.log(`🔔 Notificar ${aula.agendamentos.length} alunos sobre o cancelamento da aula.`);
    }

    // Excluir aula
    await prisma.aula.delete({
      where: { id: aulaId }
    });

    res.json({ message: 'Aula excluída com sucesso e agendamentos cancelados.' });
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

exports.createAulasRecorrentes = async (req, res) => {
  const { clienteId, roles } = req.user;

  if (!roles.includes('ADMIN') && !roles.includes('PROFESSOR')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
    const {
      modalidade,
      professorId,
      unidadeId,
      localId,
      diasSemana,
      dataInicio,
      dataFim,
      horaInicio,
      horaFim,
      vagasTotais
    } = req.body;

    const aulasCriadas = [];
    let dataAtual = parseISO(dataInicio);
    const fim = parseISO(dataFim);

    while (isBefore(dataAtual, addDays(fim, 1))) {
      const diaSemana = dataAtual.getDay(); // 0=Domingo
      if (diasSemana.includes(diaSemana)) {
        const inicio = new Date(`${formatISO(dataAtual, { representation: 'date' })}T${horaInicio}`);
        const fimHora = new Date(`${formatISO(dataAtual, { representation: 'date' })}T${horaFim}`);

        // ✅ Verificar conflito: já existe aula nesse intervalo para o professor?
        const conflito = await prisma.aula.findFirst({
          where: {
            professorId,
            clienteId,
            OR: [
              {
                dataHoraInicio: { lte: fimHora },
                dataHoraFim: { gte: inicio }
              }
            ]
          }
        });

        if (!conflito) {
          const aula = await prisma.aula.create({
            data: {
              modalidade,
              professorId,
              unidadeId,
              localId,
              dataHoraInicio: inicio,
              dataHoraFim: fimHora,
              vagasTotais,
              clienteId
            }
          });
          aulasCriadas.push(aula);
        } else {
          console.log(`⚠️ Conflito detectado em ${dataAtual}, aula não criada.`);
        }
      }
      dataAtual = addDays(dataAtual, 1);
    }

    res.status(201).json({
      message: 'Processo concluído',
      totalCriadas: aulasCriadas.length,
      aulas: aulasCriadas
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
