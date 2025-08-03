const app = require('./app');
const PORT = process.env.PORT || 3000;
require('./jobs/cronConcluirAulas');

app.listen(PORT, () => console.log(`🚀 SportTimePro API rodando na porta ${PORT}`));
