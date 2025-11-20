// src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const { connection } = require('../database');
const Usuario = require('../models/Usuario');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// authMiddleware: valida token, exige role e verifica suspensão (para não-admins)
async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token ausente' });
  }

  const token = auth.replace('Bearer ', '').trim();
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  // exigir role no payload — evita tokens antigos/maiores problemas
  if (!payload || !payload.role) {
    return res.status(401).json({ error: 'Token mal formado: role ausente' });
  }

  req.user = payload; // { id, email, role, ... }

  // Se não for admin, verificar se usuário existe e se está suspenso
  if (payload.role !== 'admin') {
    const user = await Usuario.findByPk(payload.id);
    if (!user) return res.status(401).json({ error: 'Usuário não existe' });
    if (user.suspended) return res.status(403).json({ error: 'Conta suspensa. Contate o administrador.' });
  }

  return next();
}

// adminOnly: apenas role === 'admin' continua
function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado: admin apenas' });
  }
  next();
}

module.exports = { authMiddleware, adminOnly };
