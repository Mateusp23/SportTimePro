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

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/planos', planoRoutes);
app.use('/api/unidades', unidadeRoutes);
app.use('/api/locais', localRoutes);
app.use('/api/professores', professorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/client', clientRoutes);

module.exports = app;
