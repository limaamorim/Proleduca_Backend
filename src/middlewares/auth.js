// src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const { connection } = require('../database');
const Usuario = require('../models/Usuario'); // model

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token ausente' });
  }
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;

    // Se for user, checa se não está suspenso no banco
    if (payload.role === 'user') {
      const user = await Usuario.findByPk(payload.id);
      if (!user) return res.status(401).json({ error: 'Usuário não existe' });
      if (user.suspended) return res.status(403).json({ error: 'Conta suspensa. Contate o administrador.' });
    }

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado: admin apenas' });
  }
  next();
}

module.exports = { authMiddleware, adminOnly };
