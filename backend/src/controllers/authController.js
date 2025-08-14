const prisma = require('../config/db');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');
const emailService = require('../utils/emailService');

exports.register = async (req, res) => {
  const { nome, email, senha, academiaId } = req.body;

  try {
    // Verificar se o email já existe
    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }

    // Se academiaId foi fornecido, verificar se existe
    let clienteId = null;
    if (academiaId) {
      const academia = await prisma.cliente.findUnique({
        where: { id: academiaId }
      });
      if (!academia) {
        return res.status(400).json({ message: 'Academia não encontrada.' });
      }
      clienteId = academia.id;
    }

    const hash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash: hash,
        roles: ['ALUNO'],
        clienteId: clienteId,
        emailConfirmado: true // Alunos não precisam confirmar email
      }
    });

    // Gerar token JWT
    const token = generateToken(usuario);

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      token,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        roles: usuario.roles,
        clienteId: usuario.clienteId
      }
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

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
            roles: roles && roles.length > 0 ? roles : ['ADMIN'],
            emailConfirmado: false
          }
        }
      },
      include: { usuarios: true }
    });

    // ✅ Gerar token JWT
    const token = generateToken(cliente.usuarios[0]);

    // ✅ Enviar e-mail com link de confirmação
    await emailService.sendConfirmationEmail(email, token);

    return res.json({
      message: 'Cliente e admin criados com sucesso. Confirme seu e-mail para ativar a conta.',
      cliente
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (!usuario.emailConfirmado) {
      return res.status(403).json({ message: "Confirme seu e-mail para acessar a conta." });
    }

    const valid = await bcrypt.compare(senha, usuario.senhaHash);
    if (!valid) return res.status(401).json({ message: "Senha inválida" });

    const token = generateToken(usuario);
    return res.json({ token, user: usuario });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.registerAluno = async (req, res) => {
  const { nome, email, senha, inviteCode, professorId } = req.body;

  try {
    // Validar o convite primeiro
    const cliente = await prisma.cliente.findFirst({
      where: { inviteCode }
    });

    if (!cliente) {
      return res.status(400).json({ message: 'Código de convite inválido.' });
    }

    // Verificar se o professor existe e pertence ao mesmo cliente
    const professor = await prisma.usuario.findFirst({
      where: {
        id: professorId,
        clienteId: cliente.id,
        roles: { has: 'PROFESSOR' }
      }
    });

    if (!professor) {
      return res.status(400).json({ message: 'Professor não encontrado ou não autorizado.' });
    }

    // Verificar se o email já existe no cliente
    const usuarioExistente = await prisma.usuario.findFirst({
      where: { email, clienteId: cliente.id }
    });
    
    if (usuarioExistente) {
      return res.status(400).json({ message: 'Este e-mail já está registrado nesta academia.' });
    }

    const hash = await bcrypt.hash(senha, 10);

    // Criar o aluno
    const aluno = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash: hash,
        roles: ['ALUNO'],
        clienteId: cliente.id,
        emailConfirmado: true // Alunos não precisam confirmar email
      }
    });

    // Criar o vínculo aluno-professor
    await prisma.alunoProfessor.create({
      data: {
        alunoId: aluno.id,
        professorId: professor.id,
        clienteId: cliente.id
      }
    });

    return res.json({
      message: 'Aluno cadastrado com sucesso e vinculado ao professor',
      aluno: {
        id: aluno.id,
        nome: aluno.nome,
        email: aluno.email
      }
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }
    console.error('Erro ao registrar aluno:', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.registerAlunoViaInvite = async (req, res) => {
  const { nome, email, senha, inviteCode } = req.body;

  try {
    const cliente = await prisma.cliente.findFirst({
      where: { inviteCode }
    });

    if (!cliente) {
      return res.status(400).json({ message: 'Código de convite inválido ou expirado.' });
    }

    const usuarioExistente = await prisma.usuario.findFirst({
      where: { email, clienteId: cliente.id }
    });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'Este e-mail já está registrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpira = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const aluno = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        roles: ['ALUNO'],
        clienteId: cliente.id,
        tokenConfirmacao: token,
        tokenExpiraEm: tokenExpira
      }
    });

    const confirmLink = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;
    await enviarEmail({
      to: email,
      subject: "Confirme seu e-mail - SportTimePro",
      html: `
        <p>Olá ${nome},</p>
        <p>Clique no link abaixo para confirmar seu e-mail:</p>
        <a href="${confirmLink}">${confirmLink}</a>
      `
    });

    res.status(201).json({ message: 'Aluno registrado. Verifique seu e-mail para confirmar.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.confirmarEmail = async (req, res) => {
  const { token } = req.query;

  try {
    // ✅ Verifica JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Atualiza usuário como confirmado
    await prisma.usuario.update({
      where: { id: decoded.userId },
      data: {
        emailConfirmado: true
      }
    });

    res.json({ message: 'E-mail confirmado com sucesso!' });
  } catch (error) {
    res.status(400).json({ message: 'Token inválido ou expirado.' });
  }
};

exports.resendConfirmationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // Verifica se usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Se já está confirmado, não reenvia
    if (usuario.emailConfirmado) {
      return res.status(400).json({ message: 'E-mail já confirmado.' });
    }

    // Gera novo token
    const token = jwt.sign(
      { userId: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Envia novo e-mail
    await emailService.sendConfirmationEmail(email, token);

    res.json({ message: 'Novo link de confirmação enviado para o e-mail.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  const { userId } = req.user;
  
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        roles: true,
        clienteId: true,
        emailConfirmado: true,
        criadoEm: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
