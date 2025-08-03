const prisma = require('../config/db');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');

exports.registerCliente = async (req, res) => {
  const { nomeCliente, nomeAdmin, email, senha, roles } = req.body;
  try {
    const hash = await bcrypt.hash(senha, 10);

    const cliente = await prisma.cliente.create({
      data: {
        nome: nomeCliente,
        usuarios: {
          create: {
            nome: nomeAdmin,
            email,
            senhaHash: hash,
            roles: roles && roles.length > 0 ? roles : ['ADMIN']
          }
        }
      },
      include: { usuarios: true }
    });

    return res.json({
      message: 'Cliente e admin criados com sucesso',
      cliente
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    const user = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    const valid = await bcrypt.compare(senha, user.senhaHash);
    if (!valid) return res.status(401).json({ message: 'Senha inválida' });

    const token = generateToken(user);
    return res.json({ token, user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.registerAluno = async (req, res) => {
  const { code, nome, email, senha } = req.body;

  try {
    const cliente = await prisma.cliente.findFirst({
      where: { inviteCode: code }
    });

    if (!cliente) {
      return res.status(400).json({ message: 'Código de convite inválido.' });
    }

    const hash = await bcrypt.hash(senha, 10);

    const aluno = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash: hash,
        roles: ['ALUNO'],
        clienteId: cliente.id
      }
    });

    return res.json({
      message: 'Aluno cadastrado com sucesso',
      aluno
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }
    return res.status(500).json({ message: err.message });
  }
};

exports.registerAlunoViaInvite = async (req, res) => {
  const { nome, email, senha, inviteCode } = req.body;

  try {
    // Verificar se existe cliente com esse inviteCode
    const cliente = await prisma.cliente.findFirst({
      where: { inviteCode }
    });

    if (!cliente) {
      return res.status(400).json({ message: 'Código de convite inválido ou expirado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário com role ALUNO
    const aluno = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        roles: ['ALUNO'],
        clienteId: cliente.id
      }
    });

    res.status(201).json({ message: 'Aluno registrado com sucesso!', aluno });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};