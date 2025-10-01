const express = require('express');
const cors = require('cors'); 
//Apenas importando para garantir que a conexão com o BD seja inicializada
require('./database'); 

// Importando as rotas 
const authRoutes = require('./routes/auth.routes'); 

const app = express();

// Middlewares Globais
app.use(cors());
// Permite que o Express leia o corpo das requisições em formato JSON
app.use(express.json()); 

// Rota de teste simples para verificar se o servidor está no ar
app.get('/', (req, res) => {
    res.status(200).send({ message: 'Amigo Edu API v1.0 está no ar! 🚀' });
});

// Definição das Rotas de Autenticação (POST /api/v1/auth/cadastro, POST /api/v1/auth/login)
app.use('/api/v1/auth', authRoutes);

module.exports = app;