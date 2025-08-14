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
