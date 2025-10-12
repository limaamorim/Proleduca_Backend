const express = require('express');
const cors = require('cors'); 
require('./database'); 
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes'); 
const usuarioRoutes = require('./routes/usuarioRoutes'); 
const adminRoutes = require('./routes/adminRoutes'); 
const indicacaoRoutes = require('./routes/indicacaoRoutes');
const impactoRoutes = require('./routes/impactoRoutes');
const gamificacaoRoutes = require('./routes/gamificacaoRoutes');

const app = express();
dotenv.config()

app.use(cors());
app.use(express.json()); 

app.get('/', (req, res) => {
    res.status(200).send({ message: 'Amigo Edu API v1.0 está no ar! 🚀' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/usuarios', usuarioRoutes);
app.use('/api/v1/admins', adminRoutes);
app.use('/api/v1/indicacoes', indicacaoRoutes);
app.use('/api/v1/impactos', impactoRoutes);
app.use('/api/v1/gamificacao', gamificacaoRoutes);

module.exports = app;
