const prisma = require('../config/db');
const { StatusAgendamento } = require('@prisma/client');

exports.agendarAula = async (req, res) => {
  const { aulaId } = req.body;
  const { userId, roles } = req.user;

  if (!roles.includes('ALUNO')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
    const agora = new Date();

    // Verificar se aula existe
    const aula = await prisma.aula.findUnique({
      where: { id: aulaId },
      include: {
        agendamentos: {
          where: { status: 'ATIVO' }
        }
      }
    });

    if (!aula) {
      return res.status(404).json({ message: 'Aula não encontrada.' });
    }

    // ✅ Aula já começou
    if (new Date(aula.dataHoraInicio) <= agora) {
      return res.status(400).json({ message: 'Não é possível agendar para uma aula que já começou.' });
    }

    // ✅ Aula já finalizou
    if (new Date(aula.dataHoraFim) <= agora) {
      return res.status(400).json({ message: 'Essa aula já foi finalizada.' });
    }

    // ✅ Validação: aluno já agendado
    const jaAgendado = await prisma.agendamento.findFirst({
      where: {
        alunoId: userId,
        aulaId,
        status: 'ATIVO'
      }
    });

    if (jaAgendado) {
      return res.status(400).json({ message: 'Você já está agendado para essa aula.' });
    }

    // Verificar vagas
    const vagasRestantes = aula.vagasTotais - aula.agendamentos.length;
    if (vagasRestantes <= 0) {
      return res.status(400).json({ message: 'Não há vagas disponíveis para essa aula.' });
    }

    // Criar agendamento
    const agendamento = await prisma.agendamento.create({
      data: {
        alunoId: userId,
        aulaId,
        status: 'ATIVO'
      }
    });

    res.status(201).json({ message: 'Agendamento realizado com sucesso!', agendamento });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAlunosPorAula = async (req, res) => {
  const { aulaId } = req.params;
  const { clienteId, roles } = req.user;

  if (!roles.includes('ADMIN') && !roles.includes('PROFESSOR')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
    // Busca da aula (garante que pertence ao cliente logado)
    const aula = await prisma.aula.findFirst({
      where: {
        id: aulaId,
        ...(clienteId && { clienteId }) // só aplica se clienteId existir
      },
      select: {
        id: true,
        modalidade: true,
        dataHoraInicio: true
      }
    });

    if (!aula) {
      return res.status(404).json({ message: 'Aula não encontrada.' });
    }

    // Buscar agendamentos ativos
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        aulaId,
        status: 'ATIVO'
      },
      include: {
        aluno: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });

    const alunos = agendamentos.map(item => ({
      id: item.aluno.id,
      nome: item.aluno.nome,
      email: item.aluno.email
    }));

    res.json({
      aula,
      totalAgendados: alunos.length,
      alunos
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelarAgendamento = async (req, res) => {
  const { agendamentoId } = req.params;
  const { userId, roles } = req.user;

  try {
    // Buscar agendamento
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: agendamentoId },
      include: { aluno: true }
    });

    if (!agendamento) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    // Permissões:
    //  - Aluno pode cancelar apenas o próprio agendamento
    //  - Admin/Professor pode cancelar qualquer um
    if (
      roles.includes('ALUNO') &&
      agendamento.alunoId !== userId
    ) {
      return res.status(403).json({ message: 'Você não tem permissão para cancelar este agendamento.' });
    }

    const cancelado = await prisma.agendamento.update({
      where: { id: agendamentoId },
      data: { status: 'CANCELADO' }
    });

    res.json({ message: 'Agendamento cancelado com sucesso', cancelado });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAgendamentosCancelados = async (req, res) => {
  const { aulaId } = req.params;
  const { clienteId, roles } = req.user;

  if (!roles.includes('ADMIN') && !roles.includes('PROFESSOR')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
    const cancelados = await prisma.agendamento.findMany({
      where: {
        aulaId,
        status: 'CANCELADO'
      },
      include: {
        aluno: {
          select: { id: true, nome: true, email: true }
        }
      }
    });

    res.json({
      totalCancelados: cancelados.length,
      cancelados: cancelados.map(c => ({
        id: c.id,
        nome: c.aluno.nome,
        email: c.aluno.email
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHistoricoAluno = async (req, res) => {
  const { userId, roles } = req.user;

  if (!roles.includes('ALUNO')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
    const agora = new Date();

    const agendamentos = await prisma.agendamento.findMany({
      where: { alunoId: userId },
      include: {
        aula: {
          include: {
            professor: { select: { nome: true } },
            unidade: { select: { nome: true } },
            local: { select: { nome: true } }
          }
        }
      },
      orderBy: {
        aula: { dataHoraInicio: 'desc' }
      }
    });

    const futuras = [];
    const concluidas = [];
    const canceladas = [];

    agendamentos.forEach(item => {
      const aula = item.aula;
      const info = {
        id: item.id,
        status: item.status,
        modalidade: aula.modalidade,
        dataHoraInicio: aula.dataHoraInicio,
        dataHoraFim: aula.dataHoraFim,
        professor: aula.professor.nome,
        unidade: aula.unidade.nome,
        local: aula.local.nome
      };

      if (item.status === 'CANCELADO') {
        canceladas.push(info);
      } else if (item.status === 'ATIVO' && new Date(aula.dataHoraFim) > agora) {
        futuras.push(info);
      } else {
        concluidas.push(info);
      }
    });

    res.json({ futuras, concluidas, canceladas });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAgendamentosPorAula = async (req, res) => {
  const { aulaId } = req.params;
  const { status } = req.query; // filtro opcional
  const { clienteId, roles } = req.user;

  if (!roles.includes('ADMIN') && !roles.includes('PROFESSOR')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
    const aula = await prisma.aula.findFirst({
      where: {
        id: aulaId,
        clienteId
      },
      include: {
        agendamentos: {
          where: status ? { status } : {}, // aplica filtro se existir
          include: {
            aluno: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          }
        },
        professor: { select: { nome: true } },
        unidade: { select: { nome: true } },
        local: { select: { nome: true } }
      }
    });

    if (!aula) {
      return res.status(404).json({ message: 'Aula não encontrada.' });
    }

    const agendamentos = aula.agendamentos.map(item => ({
      id: item.id,
      status: item.status,
      dataAgendamento: item.criadoEm,
      aluno: {
        id: item.aluno.id,
        nome: item.aluno.nome,
        email: item.aluno.email
      }
    }));

    res.json({
      aula: {
        id: aula.id,
        modalidade: aula.modalidade,
        dataHoraInicio: aula.dataHoraInicio,
        dataHoraFim: aula.dataHoraFim,
        professor: aula.professor.nome,
        unidade: aula.unidade.nome,
        local: aula.local.nome
      },
      totalAgendados: agendamentos.length,
      agendamentos
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
