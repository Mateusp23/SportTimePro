const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const planoRoutes = require('./routes/planoRoutes');
const unidadeRoutes = require('./routes/unidadeRoutes');
const localRoutes = require('./routes/localRoutes');
const professorRoutes = require('./routes/professorRoutes');
const userRoutes = require('./routes/userRoutes');
const clientRoutes = require('./routes/clientRoutes');
const alunoRoutes = require('./routes/alunoRoutes');
const assinaturaRoutes = require('./routes/assinaturaRoutes');
const aulaRoutes = require('./routes/aulaRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');
const alunoProfessorRoutes = require('./routes/alunoProfessorRoutes');
const inviteRoutes = require('./routes/inviteRoutes');
const solicitacaoVinculoRoutes = require('./routes/solicitacaoVinculoRoutes');

const app = express();

// Configuração do CORS
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ strict: false }));

app.use('/api/auth', authRoutes);
app.use('/api/planos', planoRoutes);
app.use('/api/unidades', unidadeRoutes);
app.use('/api/locais', localRoutes);
app.use('/api/professores', professorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/assinaturas', assinaturaRoutes);
app.use('/api/aulas', aulaRoutes);
app.use('/api/agendamentos', agendamentoRoutes);  
app.use('/api', alunoProfessorRoutes);
app.use('/api', inviteRoutes);
app.use('/api/solicitacoes-vinculo', solicitacaoVinculoRoutes);

module.exports = app;
