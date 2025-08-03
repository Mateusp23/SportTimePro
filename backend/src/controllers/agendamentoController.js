const prisma = require('../config/db');
const { StatusAgendamento } = require('@prisma/client');

exports.agendarAula = async (req, res) => {
  const { aulaId, alunoId } = req.body;
  const { userId, clienteId, roles } = req.user;

  const idParaAgendar = roles.includes('ALUNO') ? userId : alunoId;

  if (!roles.includes('ALUNO') && !roles.includes('ADMIN') && !roles.includes('PROFESSOR')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  if (!idParaAgendar) {
    return res.status(400).json({ message: 'AlunoId é obrigatório quando não é um aluno agendando para si mesmo.' });
  }

  try {
    // Verificar se a aula existe
    const aula = await prisma.aula.findFirst({
      where: { id: aulaId, clienteId },
      include: {
        agendamentos: true
      }
    });
    if (!aula) return res.status(404).json({ message: 'Aula não encontrada' });

    // Verificar se o aluno já agendou essa aula
    const agendamentoExistente = await prisma.agendamento.findFirst({
      where: { alunoId: userId, aulaId }
    });
    if (agendamentoExistente) {
      return res.status(400).json({ message: 'Você já está agendado nesta aula' });
    }

    // Verificar vagas
    const vagasOcupadas = await prisma.agendamento.count({
      where: { aulaId, status: 'ATIVO' }
    });
    if (vagasOcupadas >= aula.vagasTotais) {
      return res.status(400).json({ message: 'A aula está lotada' });
    }

    // Verificar plano ativo
    const assinaturaAtiva = await prisma.assinatura.findFirst({
      where: {
        alunoId: userId,
        status: 'ATIVO',
        dataFim: { gte: new Date() }
      }
    });
    if (!assinaturaAtiva) {
      return res.status(403).json({ message: 'Plano inativo ou vencido. Não é possível agendar.' });
    }

    // Criar agendamento
    const agendamento = await prisma.agendamento.create({
      data: {
        alunoId: userId,
        aulaId,
        status: 'ATIVO'
      },
      include: {
        aluno: {
          select: {
            nome: true,
            email: true
          }
        },
        aula: {
          select: {
            modalidade: true,
            dataHoraInicio: true,
            dataHoraFim: true,
            professor: { select: { nome: true } }
          }
        }
      }
    });

    res.json({ message: 'Agendamento realizado com sucesso', agendamento });
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
