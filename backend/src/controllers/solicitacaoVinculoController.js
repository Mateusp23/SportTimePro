const prisma = require('../config/db');

// Criar solicitação de vínculo
exports.criarSolicitacao = async (req, res) => {
  const { professorId, mensagem } = req.body;
  const { userId, clienteId } = req.user;

  try {
    // Verificar se o usuário é um aluno
    const aluno = await prisma.usuario.findFirst({
      where: {
        id: userId,
        roles: { has: 'ALUNO' }
      }
    });

    if (!aluno) {
      return res.status(403).json({ message: 'Apenas alunos podem solicitar vínculo.' });
    }

    // Verificar se o professor existe e pertence ao mesmo cliente
    const professor = await prisma.usuario.findFirst({
      where: {
        id: professorId,
        clienteId: aluno.clienteId,
        roles: { has: 'PROFESSOR' }
      }
    });

    if (!professor) {
      return res.status(404).json({ message: 'Professor não encontrado.' });
    }

    // Verificar se já existe uma solicitação pendente
    const solicitacaoExistente = await prisma.solicitacaoVinculo.findFirst({
      where: {
        alunoId: userId,
        professorId,
        clienteId: aluno.clienteId
      }
    });

    if (solicitacaoExistente) {
      return res.status(400).json({ message: 'Já existe uma solicitação para este professor.' });
    }

    // Criar solicitação
    const solicitacao = await prisma.solicitacaoVinculo.create({
      data: {
        alunoId: userId,
        professorId,
        clienteId: aluno.clienteId,
        mensagem: mensagem || null
      }
    });

    res.status(201).json({
      message: 'Solicitação enviada com sucesso!',
      solicitacao
    });

  } catch (error) {
    console.error('Erro ao criar solicitação:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Listar solicitações recebidas (para professores/admins)
exports.listarSolicitacoesRecebidas = async (req, res) => {
  const { userId, clienteId, roles } = req.user;

  try {
    // Verificar se é professor ou admin
    if (!roles.includes('PROFESSOR') && !roles.includes('ADMIN')) {
      return res.status(403).json({ message: 'Permissão negada.' });
    }

    const where = { clienteId };
    
    // Se for apenas professor (não admin), só ver suas solicitações
    if (!roles.includes('ADMIN')) {
      where.professorId = userId;
    }

    const solicitacoes = await prisma.solicitacaoVinculo.findMany({
      where,
      include: {
        aluno: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        professor: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      orderBy: { criadoEm: 'desc' }
    });

    res.json(solicitacoes);

  } catch (error) {
    console.error('Erro ao listar solicitações:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Responder solicitação (aprovar/rejeitar)
exports.responderSolicitacao = async (req, res) => {
  const { id } = req.params;
  const { status, resposta } = req.body;
  const { userId, clienteId, roles } = req.user;

  try {
    // Verificar se é professor ou admin
    if (!roles.includes('PROFESSOR') && !roles.includes('ADMIN')) {
      return res.status(403).json({ message: 'Permissão negada.' });
    }

    // Buscar solicitação
    const solicitacao = await prisma.solicitacaoVinculo.findFirst({
      where: {
        id,
        clienteId,
        ...(roles.includes('PROFESSOR') && !roles.includes('ADMIN') && { professorId: userId })
      }
    });

    if (!solicitacao) {
      return res.status(404).json({ message: 'Solicitação não encontrada.' });
    }

    if (solicitacao.status !== 'PENDENTE') {
      return res.status(400).json({ message: 'Esta solicitação já foi respondida.' });
    }

    // Atualizar solicitação
    const solicitacaoAtualizada = await prisma.solicitacaoVinculo.update({
      where: { id },
      data: {
        status,
        resposta,
        respondidoEm: new Date()
      }
    });

    // Se aprovada, criar vínculo
    if (status === 'APROVADA') {
      await prisma.alunoProfessor.create({
        data: {
          alunoId: solicitacao.alunoId,
          professorId: solicitacao.professorId,
          clienteId: solicitacao.clienteId
        }
      });
    }

    res.json({
      message: `Solicitação ${status.toLowerCase()} com sucesso!`,
      solicitacao: solicitacaoAtualizada
    });

  } catch (error) {
    console.error('Erro ao responder solicitação:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.verificarStatusVinculo = async (req, res) => {
  const { userId, clienteId } = req.user;
  try {
    const aluno = await prisma.usuario.findFirst({ where: { id: userId, roles: { has: 'ALUNO' } } });
    if (!aluno) return res.status(403).json({ message: 'Apenas alunos podem verificar status de vínculo.' });
    
    // Buscar solicitação mais recente do aluno
    const solicitacao = await prisma.solicitacaoVinculo.findFirst({
      where: { 
        alunoId: userId, 
        clienteId: aluno.clienteId 
      },
      include: {
        professor: { select: { nome: true } },
        cliente: { select: { nome: true } }
      },
      orderBy: { criadoEm: 'desc' }
    });

    if (!solicitacao) {
      return res.status(404).json({ message: 'Nenhuma solicitação de vínculo encontrada.' });
    }

    res.json({
      status: solicitacao.status,
      professorNome: solicitacao.professor.nome,
      academiaNome: solicitacao.cliente.nome,
      mensagem: solicitacao.mensagem,
      resposta: solicitacao.resposta,
      criadoEm: solicitacao.criadoEm
    });
  } catch (error) {
    console.error('Erro ao verificar status do vínculo:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
