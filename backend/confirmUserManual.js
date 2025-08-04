require('dotenv').config();
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

(async () => {
  try {
    const updatedUser = await prisma.usuario.update({
      where: { id: '4336c395-0c08-4741-a1e2-1514b28fee87' },
      data: {
        emailConfirmado: true,
        tokenConfirmacao: null,
        tokenExpiraEm: null
      }
    });
    console.log('✅ Usuário confirmado:', updatedUser);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();