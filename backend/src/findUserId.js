require('dotenv').config();
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

(async () => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { email: 'mateuspaulart@gmail.com' },
      select: { id: true, nome: true, emailConfirmado: true }
    });

    if (user) {
      console.log("Usuário encontrado:", user);
    } else {
      console.log("Usuário não encontrado.");
    }
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();
