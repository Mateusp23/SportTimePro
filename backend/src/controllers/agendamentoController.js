const prisma = require('../config/db');
const { StatusAgendamento } = require('../../generated/prisma');

exports.agendarAula = async (req, res) => {
  const { aulaId } = req.body;
  const { userId, roles } = req.user;

  if (!roles.includes('ALUNO')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Aula + contagem atual
      const aula = await tx.aula.findUnique({
        where: { id: aulaId },
        include: {
          _count: { select: { agendamentos: { where: { status: 'ATIVO' } } } }
        }
      });
      if (!aula) throw new Error('Aula não encontrada.');

      const agora = new Date();
      if (new Date(aula.dataHoraInicio) <= agora) {
        throw new Error('Não é possível agendar para uma aula que já começou.');
      }
      if (new Date(aula.dataHoraFim) <= agora) {
        throw new Error('Essa aula já foi finalizada.');
      }

      // Já agendado?
      const ja = await tx.agendamento.findUnique({
        where: { alunoId_aulaId: { alunoId: userId, aulaId } } // pelo @@unique
      });
      if (ja && ja.status === 'ATIVO') {
        throw new Error('Você já está agendado para essa aula.');
      }

      const ocupadas = aula._count.agendamentos;
      if (ocupadas >= aula.vagasTotais) {
        throw new Error('Não há vagas disponíveis para essa aula.');
      }

      const agendamento = await tx.agendamento.upsert({
        where: { alunoId_aulaId: { alunoId: userId, aulaId } },
        update: { status: 'ATIVO' },
        create: { alunoId: userId, aulaId, status: 'ATIVO' }
      });

      return agendamento;
    });

    return res.status(201).json({ message: 'Agendamento realizado com sucesso!', agendamento: result });
  } catch (err) {
    // Trata violação da constraint única de forma amigável
    if (String(err.message).includes('Unique constraint') || String(err.code) === 'P2002') {
      return res.status(400).json({ message: 'Você já está agendado para essa aula.' });
    }
    return res.status(400).json({ message: err.message || 'Falha ao agendar.' });
  }
};

exports.getAlunosPorAula = async (req, res) => {
  const { aulaId } = req.params;
  const { clienteId, roles } = req.user;
  const { page = "1", pageSize = "20", search = "", status = "ATIVO" } = req.query;

  if (!roles.includes('ADMIN') && !roles.includes('PROFESSOR')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
    // Paginação segura
    const take = Math.min(Math.max(parseInt(pageSize, 10) || 20, 1), 100);
    const currPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (currPage - 1) * take;

    // Busca da aula (garante que pertence ao cliente logado)
    const aula = await prisma.aula.findFirst({
      where: {
        id: aulaId,
        ...(clienteId && { clienteId }) // só aplica se clienteId existir
      },
      select: {
        id: true,
        modalidade: true,
        vagasTotais: true,
        dataHoraInicio: true,
        dataHoraFim: true,
        professor: { select: { nome: true } },
        unidade: { select: { nome: true } },
        local: { select: { nome: true } }
      }
    });

    if (!aula) {
      return res.status(404).json({ message: 'Aula não encontrada.' });
    }

    // Montar filtros para agendamentos
    const where = {
      aulaId,
      status: String(status)
    };

    // Filtro de busca por nome ou email do aluno
    if (search) {
      where.aluno = {
        OR: [
          { nome: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } }
        ]
      };
    }

    // Count total para paginação
    const total = await prisma.agendamento.count({ where });

    // Buscar agendamentos com paginação
    const agendamentos = await prisma.agendamento.findMany({
      where,
      skip,
      take,
      include: {
        aluno: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      orderBy: {
        criadoEm: 'desc'
      }
    });

    // Formatar dados para o frontend
    const data = agendamentos.map(item => ({
      id: item.aluno.id,
      nome: item.aluno.nome,
      email: item.aluno.email,
      agendamentoId: item.id,
      status: item.status,
      criadoEm: item.criadoEm
    }));

    res.json({
      aula,
      data,
      page: currPage,
      pageSize: take,
      total,
      totalPages: Math.ceil(total / take)
    });
  } catch (err) {
    console.error('Erro ao buscar alunos por aula:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
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
        local: aula.local.nome,
        vagasTotais: aula.vagasTotais,
        vagasDisponiveis: aula.vagasTotais - aula._count.agendamentos,
        totalAgendados: aula._count.agendamentos
      },
      totalAgendados: agendamentos.length,
      agendamentos
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// professor/admin adicionar um aluno manualmente pela UI 
exports.agendarAlunoNaAula = async (req, res) => {
  const { aulaId, alunoId } = req.body;
  const { roles, clienteId } = req.user;

  if (!roles.includes('ADMIN') && !roles.includes('PROFESSOR')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
    const agendamento = await prisma.$transaction(async (tx) => {
      // Aula do mesmo cliente
      const aula = await tx.aula.findFirst({
        where: { id: aulaId, clienteId },
        include: {
          _count: { select: { agendamentos: { where: { status: 'ATIVO' } } } }
        }
      });
      if (!aula) throw new Error('Aula não encontrada.');

      const aluno = await tx.usuario.findFirst({
        where: { id: alunoId, clienteId }
      });
      if (!aluno) throw new Error('Aluno não encontrado.');

      if (aula._count.agendamentos >= aula.vagasTotais) {
        throw new Error('Não há vagas disponíveis para essa aula.');
      }

      const ag = await tx.agendamento.upsert({
        where: { alunoId_aulaId: { alunoId, aulaId } },
        update: { status: 'ATIVO' },
        create: { alunoId, aulaId, status: 'ATIVO' }
      });

      return ag;
    });

    res.status(201).json({ message: 'Aluno agendado com sucesso!', agendamento });
  } catch (err) {
    if (String(err.message).includes('Unique constraint') || String(err.code) === 'P2002') {
      return res.status(400).json({ message: 'Este aluno já está agendado para a aula.' });
    }
    res.status(400).json({ message: err.message || 'Falha ao agendar aluno.' });
  }
};

exports.listarAgendamentosAluno = async (req, res) => {
  const { userId, clienteId } = req.user;
  
  try {
    // Verificar se o usuário é um aluno
    const aluno = await prisma.usuario.findFirst({
      where: { id: userId, roles: { has: 'ALUNO' } }
    });
    
    if (!aluno) {
      return res.status(403).json({ message: 'Apenas alunos podem acessar esta funcionalidade.' });
    }

    // Buscar agendamentos ativos do aluno
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        alunoId: userId,
        aula: {
          clienteId: clienteId
        },
        status: 'ATIVO'
      },
      include: {
        aula: {
          include: {
            local: { select: { nome: true } },
            professor: { select: { nome: true } }
          }
        }
      },
      orderBy: [
        { aula: { dataHoraInicio: 'asc' } }
      ]
    });

    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao listar agendamentos do aluno:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.listarHistoricoAgendamentosAluno = async (req, res) => {
  const { userId, clienteId } = req.user;
  
  try {
    // Verificar se o usuário é um aluno
    const aluno = await prisma.usuario.findFirst({
      where: { id: userId, roles: { has: 'ALUNO' } }
    });
    
    if (!aluno) {
      return res.status(403).json({ message: 'Apenas alunos podem acessar esta funcionalidade.' });
    }

    // Buscar histórico de agendamentos do aluno
    const historico = await prisma.agendamento.findMany({
      where: {
        alunoId: userId,
        aula: {
          clienteId: clienteId
        },
        status: {
          in: ['CONCLUIDO', 'CANCELADO']
        }
      },
      include: {
        aula: {
          include: {
            local: { select: { nome: true } },
            professor: { select: { nome: true } }
          }
        }
      },
      orderBy: [
        { aula: { dataHoraInicio: 'desc' } }
      ]
    });

    res.json(historico);
  } catch (error) {
    console.error('Erro ao listar histórico do aluno:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
