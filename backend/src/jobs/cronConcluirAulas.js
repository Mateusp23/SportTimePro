const cron = require('node-cron');
const prisma = require('../config/db');

// Roda de hora em hora
cron.schedule('0 * * * *', async () => {
  console.log('🔄 Executando job de conclusão de aulas (de hora em hora)...');

  try {
    const agora = new Date();

    const agendamentos = await prisma.agendamento.updateMany({
      where: {
        status: 'ATIVO',
        aula: {
          dataHoraFim: { lt: agora }
        }
      },
      data: {
        status: 'CONCLUIDO'
      }
    });

    console.log(`✅ ${agendamentos.count} agendamentos concluídos.`);
  } catch (error) {
    console.error('❌ Erro no job de conclusão:', error.message);
  }
});
