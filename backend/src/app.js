const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const planoRoutes = require('./routes/planoRoutes');
const unidadeRoutes = require('./routes/unidadeRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/planos', planoRoutes);
app.use('/api/unidades', unidadeRoutes);

module.exports = app;
