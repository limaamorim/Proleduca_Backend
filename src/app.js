const express = require('express');
const cors = require('cors'); 
require('./database'); 
const dotenv = require('dotenv');

// Importação de rotas
const configRoutes = require('./routes/configGamificacaoRoutes');
const authRoutes = require('./routes/authRoutes'); 
const usuarioRoutes = require('./routes/usuarioRoutes'); 
const rankingRoutes = require('./routes/rankingRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const indicacaoRoutes = require('./routes/indicacaoRoutes');
const impactoRoutes = require('./routes/impactoRoutes');
const metaRoutes = require('./routes/metaRoutes');
const gamificacaoRoutes = require('./routes/gamificacaoRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');

// Importação dos limiters
const { generalLimiter, authLimiter } = require('./middlewares/rateLimiter');

const app = express();
dotenv.config();

// Middlewares base
app.use(cors());
app.use(express.json());

// ============================================================
//  Rota inicial
// ============================================================
app.get('/', (req, res) => {
    res.status(200).send({ message: 'Amigo Edu API v1.0 está no ar! 🚀' });
});

// ============================================================
//  Rotas de autenticação (com limiter próprio)
// ============================================================
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1/auth', authRoutes);

// ============================================================
//  Aplica limiter geral no restante
// ============================================================
app.use(generalLimiter);

// ============================================================
//  Demais rotas
// ============================================================
app.use('/api/v1/usuarios', usuarioRoutes);
app.use('/api/v1/ranking', rankingRoutes);
app.use('/api/v1/admins', adminRoutes);
app.use('/api/v1/admins/users', adminUserRoutes);
app.use('/api/v1/indicacoes', indicacaoRoutes);
app.use('/api/v1/impactos', impactoRoutes);
app.use('/api/v1/metas', metaRoutes);
app.use('/api/v1/gamificacao', gamificacaoRoutes);
app.use('/api/v1/config', configRoutes);

module.exports = app;
