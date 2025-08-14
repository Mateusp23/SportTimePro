// src/controllers/alunoProfessorController.js
const prisma = require('../config/db');

/**
 * Helpers
 */
function isAdmin(user) {
  return user?.roles?.includes('ADMIN');
}
function isProfessor(user) {
  return user?.roles?.includes('PROFESSOR');
}
function isAluno(user) {
  return user?.roles?.includes('ALUNO');
}

/**
 * POST /api/professores/:professorId/alunos/:alunoId
 * Vincula um aluno a um professor (escopo por clienteId).
 * Permissões: ADMIN (qualquer professor) ou PROF (apenas a si mesmo).
 */
exports.linkAlunoProfessor = async (req, res) => {
  const { professorId, alunoId } = req.params;
  const { clienteId, userId, roles } = req.user;

  try {
    if (!isAdmin(req.user) && !(isProfessor(req.user) && userId === professorId)) {
      return res.status(403).json({ message: 'Permissão negada.' });
    }

    const [prof, aluno] = await Promise.all([
      prisma.usuario.findFirst({ where: { id: professorId, clienteId } }),
      prisma.usuario.findFirst({ where: { id: alunoId, clienteId } }),
    ]);

    if (!prof || !prof.roles.includes('PROFESSOR')) {
      return res.status(404).json({ message: 'Professor não encontrado neste cliente.' });
    }
    if (!aluno || !aluno.roles.includes('ALUNO')) {
      return res.status(404).json({ message: 'Aluno não encontrado neste cliente.' });
    }

    const vinculo = await prisma.alunoProfessor.create({
      data: { clienteId, professorId, alunoId },
    });

    res.status(201).json({ message: 'Vínculo criado com sucesso.', vinculo });
  } catch (err) {
    // Unique constraint (já existe)
    if (err?.code === 'P2002') {
      return res.status(409).json({ message: 'Vínculo já existe.' });
    }
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE /api/professores/:professorId/alunos/:alunoId
 * Desvincula um aluno de um professor.
 * Permissões: ADMIN (qualquer professor) ou PROF (apenas a si mesmo).
 */
exports.unlinkAlunoProfessor = async (req, res) => {
  const { professorId, alunoId } = req.params;
  const { clienteId, userId } = req.user;

  try {
    if (!isAdmin(req.user) && !(isProfessor(req.user) && userId === professorId)) {
      return res.status(403).json({ message: 'Permissão negada.' });
    }

    const del = await prisma.alunoProfessor.deleteMany({
      where: { clienteId, professorId, alunoId },
    });

    if (del.count === 0) {
      return res.status(404).json({ message: 'Vínculo não encontrado.' });
    }
    res.json({ message: 'Vínculo removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/professores/:professorId/alunos?q=&page=&pageSize=
 * Lista alunos de um professor com busca/paginação.
 * Permissões: ADMIN (qualquer professor) ou PROF (apenas a si mesmo).
 */
exports.listAlunosDoProfessor = async (req, res) => {
  const { professorId } = req.params;
  const { clienteId, userId } = req.user;
  const q = (req.query.q || '').trim();
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100);

  try {
    if (!isAdmin(req.user) && !(isProfessor(req.user) && userId === professorId)) {
      return res.status(403).json({ message: 'Permissão negada.' });
    }

    const where = {
      clienteId,
      professorId,
      aluno: q
        ? {
          OR: [
            { nome: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        }
        : undefined,
    };

    const [total, rows] = await Promise.all([
      prisma.alunoProfessor.count({ where }),
      prisma.alunoProfessor.findMany({
        where,
        include: { aluno: { select: { id: true, nome: true, email: true } } },
        orderBy: { criadoEm: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    res.json({
      page,
      pageSize,
      total,
      items: rows.map((r) => r.aluno),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/alunos/:alunoId/professores?q=&page=&pageSize=
 * Lista professores de um aluno (útil para a visão do aluno).
 * Permissões:
 *  - ALUNO: apenas para si mesmo (alunoId === userId)
 *  - ADMIN/PROF: qualquer aluno do mesmo cliente
 */
exports.listProfessoresDoAluno = async (req, res) => {
  const { alunoId } = req.params;
  const { clienteId, userId } = req.user;
  const q = (req.query.q || '').trim();
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100);

  try {
    if (isAluno(req.user) && userId !== alunoId) {
      return res.status(403).json({ message: 'Você só pode ver seus próprios professores.' });
    }

    const where = {
      clienteId,
      alunoId,
      professor: q
        ? {
          OR: [
            { nome: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        }
        : undefined,
    };

    const [total, rows] = await Promise.all([
      prisma.alunoProfessor.count({ where }),
      prisma.alunoProfessor.findMany({
        where,
        include: { professor: { select: { id: true, nome: true, email: true } } },
        orderBy: { criadoEm: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    res.json({
      page,
      pageSize,
      total,
      items: rows.map((r) => r.professor),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
