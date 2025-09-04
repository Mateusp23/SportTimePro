const prisma = require('../config/db');
const { addDays, isBefore, isAfter, parseISO, formatISO } = require('date-fns');
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

// GET /aulas
// Query params (opcionais):
// - dateStart=yyyy-mm-dd
// - dateEnd=yyyy-mm-dd
// - unidadeId=<uuid>
// - localId=<uuid>
// - modalidade=<texto>
// - onlyMine=true|false
// - page=1&pageSize=20
exports.getAulas = async (req, res) => {
  const { clienteId, userId } = req.user;

  // query params
  const {
    dateStart,
    dateEnd,
    unidadeId,
    localId,
    modalidade,
    onlyMine,
    page = "1",
    pageSize = "50",
  } = req.query;

  // paginação segura
  const take = Math.min(Math.max(parseInt(pageSize, 10) || 50, 1), 200);
  const currPage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (currPage - 1) * take;

  // monta where dinâmico
  const where = { clienteId };

  // intervalo de data (opcional)
  if (dateStart && dateEnd) {
    // Usa o dia todo em UTC para evitar cortes por timezone
    const gte = new Date(`${dateStart}T00:00:00.000Z`);
    const lte = new Date(`${dateEnd}T23:59:59.999Z`);
    where.dataHoraInicio = { gte, lte };
  }

  if (unidadeId) where.unidadeId = String(unidadeId);
  if (localId) where.localId = String(localId);

  if (modalidade) {
    where.modalidade = {
      contains: String(modalidade),
      mode: "insensitive",
    };
  }

  // somente aulas do professor logado
  if (String(onlyMine).toLowerCase() === "true") {
    where.professorId = userId;
  }

  try {
    // count total para paginação
    const total = await prisma.aula.count({ where });

    const aulas = await prisma.aula.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        modalidade: true,
        dataHoraInicio: true,
        dataHoraFim: true,
        vagasTotais: true,
        professorId: true,
        unidadeId: true,
        localId: true,
        seriesId: true,
        isException: true,
        professor: { select: { nome: true } },
        unidade: { select: { nome: true } },
        local: { select: { nome: true } },
        _count: { select: { agendamentos: true } },
      },
      orderBy: { dataHoraInicio: "asc" },
    });

    res.json({
      items: aulas,
      page: currPage,
      pageSize: take,
      total,
      totalPages: Math.ceil(total / take),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAula = async (req, res) => {
  console.log('🔍 updateAula - req.params:', req.params);
  console.log('🔍 updateAula - req.user:', req.user);
  
  const { id: aulaId } = req.params;
  const { clienteId, roles } = req.user;
  
  console.log('🔍 updateAula - Parâmetros extraídos:', { aulaId, clienteId, roles });
  console.log('🔍 updateAula - Body:', req.body);

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
  const { id: aulaId } = req.params;
  const { clienteId, roles, userId } = req.user;
  
  console.log('🔍 deleteAula - Parâmetros:', { aulaId, clienteId, roles, userId });

  if (!roles.includes('ADMIN') && !roles.includes('PROFESSOR')) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  try {
    // Verificar se aula existe
    const whereClause = { id: aulaId, clienteId };
    
    // Se for professor, só pode deletar suas próprias aulas
    if (roles.includes('PROFESSOR') && !roles.includes('ADMIN')) {
      whereClause.professorId = userId;
    }

    const aula = await prisma.aula.findFirst({
      where: whereClause,
      include: {
        agendamentos: true // Inclui todos os agendamentos
      }
    });

    if (!aula) {
      return res.status(404).json({ message: 'Aula não encontrada ou você não tem permissão para excluí-la.' });
    }

    // Usar transação para garantir atomicidade
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Cancelar agendamentos ativos
      const agendamentosAtualizados = await tx.agendamento.updateMany({
        where: { 
          aulaId: aulaId, 
          status: 'ATIVO' 
        },
        data: { status: 'CANCELADO' }
      });

      // 2. Deletar todos os agendamentos
      const agendamentosDeletados = await tx.agendamento.deleteMany({
        where: { aulaId: aulaId }
      });

      // 3. Deletar a aula
      const aulaExcluida = await tx.aula.delete({
        where: { id: aulaId }
      });

      return {
        agendamentosCancelados: agendamentosAtualizados.count,
        agendamentosDeletados: agendamentosDeletados.count,
        aula: aulaExcluida
      };
    });

    console.log(`✅ Aula ${aulaId} excluída com sucesso:`, {
      agendamentosCancelados: resultado.agendamentosCancelados,
      agendamentosDeletados: resultado.agendamentosDeletados
    });

    res.json({ 
      message: 'Aula excluída com sucesso e agendamentos cancelados.',
      details: {
        agendamentosCancelados: resultado.agendamentosCancelados,
        agendamentosDeletados: resultado.agendamentosDeletados
      }
    });
  } catch (err) {
    console.error('❌ Erro ao excluir aula:', err);
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

exports.listarAulasAluno = async (req, res) => {
  const { userId, clienteId } = req.user;
  
  try {
    // Verificar se o usuário é um aluno
    const aluno = await prisma.usuario.findFirst({
      where: { id: userId, roles: { has: 'ALUNO' } }
    });
    
    if (!aluno) {
      return res.status(403).json({ message: 'Apenas alunos podem acessar esta funcionalidade.' });
    }

    // Buscar aulas onde o aluno está vinculado
    const aulas = await prisma.aula.findMany({
      where: {
        clienteId: clienteId,
        agendamentos: {
          some: {
            alunoId: userId
          }
        }
      },
      include: {
        local: {
          select: { nome: true }
        },
        professor: {
          select: { nome: true }
        }
      },
      orderBy: [
        { dataHoraInicio: 'asc' }
      ]
    });

    // Formatar as aulas para o formato esperado pelo frontend
    const aulasFormatadas = aulas.map(aula => ({
      id: aula.id,
      nome: aula.modalidade,
      horario: aula.dataHoraInicio,
      data: aula.dataHoraInicio,
      local: {
        nome: aula.local.nome
      },
      professor: {
        nome: aula.professor.nome
      }
    }));

    res.json(aulasFormatadas);
  } catch (error) {
    console.error('Erro ao listar aulas do aluno:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Nova função para listar aulas dos professores vinculados ao aluno
exports.listarAulasProfessoresVinculados = async (req, res) => {
  const { userId, clienteId } = req.user;
  const { dateStart, dateEnd, unidadeId, localId, modalidade } = req.query;
  
  try {
    // Verificar se o usuário é um aluno
    const aluno = await prisma.usuario.findFirst({
      where: { id: userId, roles: { has: 'ALUNO' } }
    });
    
    if (!aluno) {
      return res.status(403).json({ message: 'Apenas alunos podem acessar esta funcionalidade.' });
    }

    // Buscar professores vinculados ao aluno
    const vinculos = await prisma.alunoProfessor.findMany({
      where: {
        alunoId: userId,
        clienteId: clienteId
      },
      include: {
        professor: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });

    if (vinculos.length === 0) {
      return res.json({
        items: [],
        page: 1,
        pageSize: 50,
        total: 0,
        totalPages: 0,
        message: 'Você não possui vínculos com professores ainda.'
      });
    }

    // IDs dos professores vinculados
    const professoresIds = vinculos.map(v => v.professor.id);

    // Montar filtros para as aulas
    const where = {
      clienteId: clienteId,
      professorId: { in: professoresIds },
      dataHoraInicio: { gte: new Date() } // Apenas aulas futuras
    };

    // Filtros opcionais
    if (dateStart && dateEnd) {
      const gte = new Date(`${dateStart}T00:00:00.000Z`);
      const lte = new Date(`${dateEnd}T23:59:59.999Z`);
      where.dataHoraInicio = { 
        gte: new Date() > gte ? new Date() : gte, // Não mostrar aulas passadas
        lte 
      };
    }

    if (unidadeId) where.unidadeId = String(unidadeId);
    if (localId) where.localId = String(localId);

    if (modalidade) {
      where.modalidade = {
        contains: String(modalidade),
        mode: "insensitive",
      };
    }

    // Buscar aulas dos professores vinculados
    const aulas = await prisma.aula.findMany({
      where,
      select: {
        id: true,
        modalidade: true,
        dataHoraInicio: true,
        dataHoraFim: true,
        vagasTotais: true,
        professorId: true,
        unidadeId: true,
        localId: true,
        professor: { select: { nome: true, email: true } },
        unidade: { select: { nome: true } },
        local: { select: { nome: true } },
        _count: { select: { agendamentos: true } },
      },
      orderBy: { dataHoraInicio: "asc" },
    });

    // Verificar quais aulas o aluno já está agendado
    const aulasComAgendamento = await Promise.all(
      aulas.map(async (aula) => {
        const agendamento = await prisma.agendamento.findFirst({
          where: {
            aulaId: aula.id,
            alunoId: userId
          }
        });
        
        return {
          ...aula,
          agendado: !!agendamento
        };
      })
    );

    res.json({
      items: aulasComAgendamento,
      page: 1,
      pageSize: aulasComAgendamento.length,
      total: aulasComAgendamento.length,
      totalPages: 1,
      professoresVinculados: vinculos.map(v => ({
        id: v.professor.id,
        nome: v.professor.nome,
        email: v.professor.email
      }))
    });

  } catch (error) {
    console.error('Erro ao listar aulas dos professores vinculados:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.createRecorrencia = async (req, res) => {
  const {
    modalidade, professorId, unidadeId, localId, inicio, fim, vagasTotais, regra, janelaGeracaoDias = 60
  } = req.body;
  const { clienteId } = req.user;
  
  if (!modalidade || !professorId || !unidadeId || !localId || !inicio || !fim || !vagasTotais || !regra) {
    return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
  }
  try {
    // Cria a recorrência
    const recorrencia = await prisma.recorrencia.create({
      data: {
        modalidade,
        professorId,
        unidadeId,
        localId,
        inicio: new Date(inicio),
        fim: new Date(fim),
        vagasTotais,
        regra,
        janelaGeracaoDias,
        clienteId
      }
    });

    // Geração das instâncias de Aula
    const aulasCriadas = [];
    const conflitos = [];
    const startDate = parseISO(inicio);
    const endDate = regra.until ? parseISO(regra.until) : addDays(startDate, janelaGeracaoDias);
    let d = new Date(startDate);
    let count = 0;
    while (isBefore(d, endDate) && count < 200) {
      let shouldCreate = false;
      if (regra.freq === 'DAILY') {
        shouldCreate = true;
      } else if (regra.freq === 'WEEKLY' && Array.isArray(regra.byWeekday)) {
        const dias = ['SU','MO','TU','WE','TH','FR','SA'];
        const diaSemana = dias[d.getDay()];
        shouldCreate = regra.byWeekday.includes(diaSemana);
      }
      if (shouldCreate) {
        // Calcular horários
        const dataHoraInicio = new Date(d);
        dataHoraInicio.setHours(new Date(inicio).getHours(), new Date(inicio).getMinutes(), 0, 0);
        const dataHoraFim = new Date(d);
        dataHoraFim.setHours(new Date(fim).getHours(), new Date(fim).getMinutes(), 0, 0);
        // Validação de conflito de aula do professor
        const conflitoAula = await prisma.aula.findFirst({
          where: {
            professorId,
            dataHoraInicio: { lt: dataHoraFim },
            dataHoraFim: { gt: dataHoraInicio }
          }
        });
        // Validação de indisponibilidade do professor
        const conflitoIndisp = await prisma.indisponibilidadeProfessor.findFirst({
          where: {
            professorId,
            dataInicio: { lt: dataHoraFim },
            dataFim: { gt: dataHoraInicio }
          }
        });
        if (conflitoAula || conflitoIndisp) {
          conflitos.push({ dataHoraInicio, motivo: conflitoAula ? 'Aula existente' : 'Indisponibilidade' });
        } else {
          const aula = await prisma.aula.create({
            data: {
              modalidade,
              professorId,
              unidadeId,
              localId,
              dataHoraInicio,
              dataHoraFim,
              vagasTotais,
              clienteId: req.user.clienteId,
              seriesId: recorrencia.id,
              isException: false,
            }
          });
          aulasCriadas.push(aula);
          count++;
        }
      }
      d = addDays(d, 1);
    }
    res.status(201).json({ message: 'Recorrência criada e instâncias geradas', recorrencia, aulasCriadas, conflitos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Listar recorrências agrupadas
exports.getRecorrencias = async (req, res) => {
  const { clienteId, roles, userId } = req.user;
  
  try {
    const whereClause = { clienteId };
    if (roles.includes('PROFESSOR') && !roles.includes('ADMIN')) {
      whereClause.professorId = userId;
    }

    const recorrencias = await prisma.recorrencia.findMany({
      where: whereClause,
      include: {
        professor: { select: { nome: true } },
        unidade: { select: { nome: true } },
        local: { select: { nome: true } },
        aulas: {
          where: {
            dataHoraInicio: { gte: new Date() }
          },
          orderBy: { dataHoraInicio: 'asc' },
          take: 10
        }
      },
      orderBy: { criadoEm: 'desc' }
    });

    // Calcular total de aulas para cada série
    const seriesWithTotals = await Promise.all(
      recorrencias.map(async (recorrencia) => {
        const totalAulas = await prisma.aula.count({
          where: { seriesId: recorrencia.id }
        });

        return {
          id: recorrencia.id,
          modalidade: recorrencia.modalidade,
          vagasTotais: recorrencia.vagasTotais,
          professorId: recorrencia.professorId,
          unidadeId: recorrencia.unidadeId,
          localId: recorrencia.localId,
          professor: recorrencia.professor,
          unidade: recorrencia.unidade,
          local: recorrencia.local,
          regra: recorrencia.regra,
          ativa: recorrencia.ativa,
          proximasAulas: recorrencia.aulas,
          totalAulas,
          criadoEm: recorrencia.criadoEm
        };
      })
    );

    res.json({ items: seriesWithTotals });
  } catch (error) {
    console.error('Erro ao buscar recorrências:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Listar aulas com agendamentos (para página de agendamentos)
exports.getAulasComAgendamentos = async (req, res) => {
  const { clienteId, roles, userId } = req.user;
  
  try {
    const whereClause = { 
      clienteId,
      dataHoraInicio: { gte: new Date() }, // Apenas aulas futuras
      agendamentos: {
        some: { status: 'ATIVO' } // Apenas aulas que têm agendamentos ativos
      }
    };
    
    // Se for professor, mostrar apenas suas aulas
    if (roles.includes('PROFESSOR') && !roles.includes('ADMIN')) {
      whereClause.professorId = userId;
    }

    const aulas = await prisma.aula.findMany({
      where: whereClause,
      select: {
        id: true,
        modalidade: true,
        dataHoraInicio: true,
        dataHoraFim: true,
        vagasTotais: true,
        professorId: true,
        unidadeId: true,
        localId: true,
        seriesId: true,
        isException: true,
        professor: { select: { nome: true } },
        unidade: { select: { nome: true } },
        local: { select: { nome: true } },
        _count: { select: { agendamentos: { where: { status: 'ATIVO' } } } },
        recorrencia: {
          select: {
            id: true,
            regra: true,
            ativa: true
          }
        }
      },
      orderBy: { dataHoraInicio: 'asc' }
    });

    res.json({ items: aulas });
  } catch (error) {
    console.error('Erro ao buscar aulas com agendamentos:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Listar séries recorrentes com agendamentos (para página de agendamentos)
exports.getRecorrenciasComAgendamentos = async (req, res) => {
  const { clienteId, roles, userId } = req.user;
  
  try {
    const whereClause = { 
      clienteId,
      ativa: true,
      aulas: {
        some: {
          dataHoraInicio: { gte: new Date() }, // Apenas com aulas futuras
          agendamentos: {
            some: { status: 'ATIVO' } // Que tenham agendamentos ativos
          }
        }
      }
    };
    
    // Se for professor, mostrar apenas suas séries
    if (roles.includes('PROFESSOR') && !roles.includes('ADMIN')) {
      whereClause.professorId = userId;
    }

    const recorrencias = await prisma.recorrencia.findMany({
      where: whereClause,
      include: {
        professor: { select: { nome: true } },
        unidade: { select: { nome: true } },
        local: { select: { nome: true } },
        aulas: {
          where: {
            dataHoraInicio: { gte: new Date() },
            agendamentos: {
              some: { status: 'ATIVO' }
            }
          },
          include: {
            _count: { select: { agendamentos: { where: { status: 'ATIVO' } } } }
          },
          orderBy: { dataHoraInicio: 'asc' },
          take: 10
        }
      },
      orderBy: { criadoEm: 'desc' }
    });

    // Calcular total de aulas futuras com agendamentos para cada série
    const seriesWithTotals = await Promise.all(
      recorrencias.map(async (recorrencia) => {
        const totalAulasComAgendamentos = await prisma.aula.count({
          where: { 
            seriesId: recorrencia.id,
            dataHoraInicio: { gte: new Date() },
            agendamentos: {
              some: { status: 'ATIVO' }
            }
          }
        });

        return {
          id: recorrencia.id,
          modalidade: recorrencia.modalidade,
          vagasTotais: recorrencia.vagasTotais,
          professorId: recorrencia.professorId,
          unidadeId: recorrencia.unidadeId,
          localId: recorrencia.localId,
          professor: recorrencia.professor,
          unidade: recorrencia.unidade,
          local: recorrencia.local,
          regra: recorrencia.regra,
          ativa: recorrencia.ativa,
          proximasAulas: recorrencia.aulas,
          totalAulas: totalAulasComAgendamentos,
          criadoEm: recorrencia.criadoEm
        };
      })
    );

    res.json({ items: seriesWithTotals });
  } catch (error) {
    console.error('Erro ao buscar recorrências com agendamentos:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Listar aulas futuras SEM agendamentos (para aba "Sem Agendamentos")
exports.getAulasSemAgendamentos = async (req, res) => {
  const { clienteId, roles, userId } = req.user;
  
  try {
    const whereClause = { 
      clienteId,
      dataHoraInicio: { gte: new Date() }, // Apenas aulas futuras
      agendamentos: {
        none: { status: 'ATIVO' } // Apenas aulas que NÃO têm agendamentos ativos
      }
    };
    
    // Se for professor, mostrar apenas suas aulas
    if (roles.includes('PROFESSOR') && !roles.includes('ADMIN')) {
      whereClause.professorId = userId;
    }

    const aulas = await prisma.aula.findMany({
      where: whereClause,
      select: {
        id: true,
        modalidade: true,
        dataHoraInicio: true,
        dataHoraFim: true,
        vagasTotais: true,
        professorId: true,
        unidadeId: true,
        localId: true,
        seriesId: true,
        isException: true,
        professor: { select: { nome: true } },
        unidade: { select: { nome: true } },
        local: { select: { nome: true } },
        _count: { select: { agendamentos: { where: { status: 'ATIVO' } } } },
        recorrencia: {
          select: {
            id: true,
            regra: true,
            ativa: true
          }
        }
      },
      orderBy: { dataHoraInicio: 'asc' }
    });

    res.json({ items: aulas });
  } catch (error) {
    console.error('Erro ao buscar aulas sem agendamentos:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Listar séries recorrentes SEM agendamentos (para aba "Sem Agendamentos")
exports.getRecorrenciasSemAgendamentos = async (req, res) => {
  const { clienteId, roles, userId } = req.user;
  
  try {
    const whereClause = { 
      clienteId,
      ativa: true,
      aulas: {
        some: {
          dataHoraInicio: { gte: new Date() }, // Com aulas futuras
          agendamentos: {
            none: { status: 'ATIVO' } // Mas SEM agendamentos ativos
          }
        }
      }
    };
    
    // Se for professor, mostrar apenas suas séries
    if (roles.includes('PROFESSOR') && !roles.includes('ADMIN')) {
      whereClause.professorId = userId;
    }

    const recorrencias = await prisma.recorrencia.findMany({
      where: whereClause,
      include: {
        professor: { select: { nome: true } },
        unidade: { select: { nome: true } },
        local: { select: { nome: true } },
        aulas: {
          where: {
            dataHoraInicio: { gte: new Date() },
            agendamentos: {
              none: { status: 'ATIVO' }
            }
          },
          include: {
            _count: { select: { agendamentos: { where: { status: 'ATIVO' } } } }
          },
          orderBy: { dataHoraInicio: 'asc' },
          take: 10
        }
      },
      orderBy: { criadoEm: 'desc' }
    });

    // Calcular total de aulas futuras sem agendamentos para cada série
    const seriesWithTotals = await Promise.all(
      recorrencias.map(async (recorrencia) => {
        const totalAulasSemAgendamentos = await prisma.aula.count({
          where: { 
            seriesId: recorrencia.id,
            dataHoraInicio: { gte: new Date() },
            agendamentos: {
              none: { status: 'ATIVO' }
            }
          }
        });

        return {
          id: recorrencia.id,
          modalidade: recorrencia.modalidade,
          vagasTotais: recorrencia.vagasTotais,
          professorId: recorrencia.professorId,
          unidadeId: recorrencia.unidadeId,
          localId: recorrencia.localId,
          professor: recorrencia.professor,
          unidade: recorrencia.unidade,
          local: recorrencia.local,
          regra: recorrencia.regra,
          ativa: recorrencia.ativa,
          proximasAulas: recorrencia.aulas,
          totalAulas: totalAulasSemAgendamentos,
          criadoEm: recorrencia.criadoEm
        };
      })
    );

    res.json({ items: seriesWithTotals });
  } catch (error) {
    console.error('Erro ao buscar recorrências sem agendamentos:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Listar aulas PASSADAS (para aba "Histórico")
exports.getAulasPassadas = async (req, res) => {
  const { clienteId, roles, userId } = req.user;
  
  try {
    const whereClause = { 
      clienteId,
      dataHoraFim: { lt: new Date() } // Apenas aulas já finalizadas
    };
    
    // Se for professor, mostrar apenas suas aulas
    if (roles.includes('PROFESSOR') && !roles.includes('ADMIN')) {
      whereClause.professorId = userId;
    }

    const aulas = await prisma.aula.findMany({
      where: whereClause,
      select: {
        id: true,
        modalidade: true,
        dataHoraInicio: true,
        dataHoraFim: true,
        vagasTotais: true,
        professorId: true,
        unidadeId: true,
        localId: true,
        seriesId: true,
        isException: true,
        professor: { select: { nome: true } },
        unidade: { select: { nome: true } },
        local: { select: { nome: true } },
        _count: { 
          select: { 
            agendamentos: true // Total de agendamentos (incluindo cancelados)
          } 
        },
        recorrencia: {
          select: {
            id: true,
            regra: true,
            ativa: true
          }
        }
      },
      orderBy: { dataHoraInicio: 'desc' }, // Mais recentes primeiro
      take: 100 // Limitar para não sobrecarregar
    });

    res.json({ items: aulas });
  } catch (error) {
    console.error('Erro ao buscar aulas passadas:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Listar séries recorrentes com aulas PASSADAS (para aba "Histórico")
exports.getRecorrenciasPassadas = async (req, res) => {
  const { clienteId, roles, userId } = req.user;
  
  try {
    const whereClause = { 
      clienteId,
      aulas: {
        some: {
          dataHoraFim: { lt: new Date() } // Que tenham aulas já finalizadas
        }
      }
    };
    
    // Se for professor, mostrar apenas suas séries
    if (roles.includes('PROFESSOR') && !roles.includes('ADMIN')) {
      whereClause.professorId = userId;
    }

    const recorrencias = await prisma.recorrencia.findMany({
      where: whereClause,
      include: {
        professor: { select: { nome: true } },
        unidade: { select: { nome: true } },
        local: { select: { nome: true } },
        aulas: {
          where: {
            dataHoraFim: { lt: new Date() }
          },
          include: {
            _count: { select: { agendamentos: true } }
          },
          orderBy: { dataHoraInicio: 'desc' },
          take: 10 // Últimas 10 aulas passadas
        }
      },
      orderBy: { criadoEm: 'desc' }
    });

    // Calcular total de aulas passadas para cada série
    const seriesWithTotals = await Promise.all(
      recorrencias.map(async (recorrencia) => {
        const totalAulasPassadas = await prisma.aula.count({
          where: { 
            seriesId: recorrencia.id,
            dataHoraFim: { lt: new Date() }
          }
        });

        return {
          id: recorrencia.id,
          modalidade: recorrencia.modalidade,
          vagasTotais: recorrencia.vagasTotais,
          professorId: recorrencia.professorId,
          unidadeId: recorrencia.unidadeId,
          localId: recorrencia.localId,
          professor: recorrencia.professor,
          unidade: recorrencia.unidade,
          local: recorrencia.local,
          regra: recorrencia.regra,
          ativa: recorrencia.ativa,
          proximasAulas: recorrencia.aulas, // Na verdade são "aulas passadas" neste contexto
          totalAulas: totalAulasPassadas,
          criadoEm: recorrencia.criadoEm
        };
      })
    );

    res.json({ items: seriesWithTotals });
  } catch (error) {
    console.error('Erro ao buscar recorrências passadas:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Deletar recorrência completa
exports.deleteRecorrencia = async (req, res) => {
  const { id } = req.params;
  const { clienteId, roles, userId } = req.user;

  try {
    // Verificar se a recorrência existe e pertence ao cliente
    const recorrencia = await prisma.recorrencia.findFirst({
      where: { 
        id, 
        clienteId,
        ...(roles.includes('PROFESSOR') && !roles.includes('ADMIN') ? { professorId: userId } : {})
      }
    });

    if (!recorrencia) {
      return res.status(404).json({ message: 'Recorrência não encontrada.' });
    }

    // Cancelar todas as aulas futuras da série
    const now = new Date();
    await prisma.agendamento.updateMany({
      where: {
        aula: {
          seriesId: id,
          dataHoraInicio: { gte: now }
        },
        status: 'ATIVO'
      },
      data: { status: 'CANCELADO' }
    });

    // Marcar recorrência como inativa
    await prisma.recorrencia.update({
      where: { id },
      data: { ativa: false }
    });

    res.json({ message: 'Recorrência cancelada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar recorrência:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
