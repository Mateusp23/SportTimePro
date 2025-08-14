const prisma = require('../config/db');
const crypto = require('crypto');

exports.getInviteCode = async (req, res) => {
  const { clienteId } = req.user;
  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    select: { inviteCode: true }
  });
  if (!cliente) return res.status(404).json({ message: 'Cliente não encontrado' });

  // cria caso ainda não exista
  if (!cliente.inviteCode) {
    const code = crypto.randomBytes(8).toString('hex');
    await prisma.cliente.update({ where: { id: clienteId }, data: { inviteCode: code } });
    return res.json({ inviteCode: code });
  }
  res.json({ inviteCode: cliente.inviteCode });
};

// Novo método para validar convite publicamente (sem autenticação)
exports.validateInviteCode = async (req, res) => {
  const { inviteCode, professorId } = req.query;

  if (!inviteCode || !professorId) {
    return res.status(400).json({ 
      valid: false, 
      message: 'Código de convite e ID do professor são obrigatórios' 
    });
  }

  try {
    // Buscar o cliente pelo código de convite
    const cliente = await prisma.cliente.findFirst({
      where: { inviteCode: inviteCode }
    });

    if (!cliente) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Código de convite inválido ou expirado' 
      });
    }

    // Verificar se o professor existe e pertence ao mesmo cliente
    const professor = await prisma.usuario.findFirst({
      where: {
        id: professorId,
        clienteId: cliente.id,
        roles: { has: 'PROFESSOR' }
      },
      select: { nome: true }
    });

    if (!professor) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Professor não encontrado ou não autorizado' 
      });
    }

    return res.json({
      valid: true,
      professorNome: professor.nome,
      clienteId: cliente.id,
      clienteNome: cliente.nome,
      message: 'Convite válido'
    });

  } catch (error) {
    console.error('Erro ao validar convite:', error);
    return res.status(500).json({ 
      valid: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

exports.rotateInviteCode = async (req, res) => {
  const { clienteId, roles } = req.user;
  if (!roles.includes('ADMIN')) return res.status(403).json({ message: 'Permissão negada' });

  const code = crypto.randomBytes(8).toString('hex');
  await prisma.cliente.update({ where: { id: clienteId }, data: { inviteCode: code } });
  res.json({ inviteCode: code });
};

// Novo método para buscar academias e professores disponíveis
exports.searchAcademiasProfessores = async (req, res) => {
  const { q = '' } = req.query;

  try {
    // Buscar academias que possuem professores
    const academias = await prisma.cliente.findMany({
      where: {
        usuarios: {
          some: {
            roles: { has: 'PROFESSOR' }
          }
        },
        nome: {
          contains: q,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        nome: true,
        usuarios: {
          where: {
            roles: { has: 'PROFESSOR' }
          },
          select: {
            id: true,
            nome: true,
            email: true,
            roles: true
          }
        }
      }
    });

    // Formatar resposta
    const resultado = academias.map(academia => ({
      academiaId: academia.id,
      academiaNome: academia.nome,
      professores: academia.usuarios.map(prof => ({
        id: prof.id,
        nome: prof.nome,
        email: prof.email,
        roles: prof.roles
      }))
    }));

    res.json({
      academias: resultado,
      total: resultado.length
    });

  } catch (error) {
    console.error('Erro ao buscar academias:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor' 
    });
  }
};
