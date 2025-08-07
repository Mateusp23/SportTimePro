const prisma = require('../config/db');

exports.isProfessorUnavailable = async (professorId, inicio, fim) => {
  return await prisma.indisponibilidadeProfessor.findFirst({
    where: {
      professorId,
      OR: [
        {
          dataInicio: { lte: new Date(inicio) },
          dataFim: { gte: new Date(inicio) }
        },
        {
          dataInicio: { lte: new Date(fim) },
          dataFim: { gte: new Date(fim) }
        }
      ]
    }
  });
};
