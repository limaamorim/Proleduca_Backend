// src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const { connection } = require('../database');
const Usuario = require('../models/Usuario');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Middleware de autenticação: valida token, checa role e verifica suspensão
async function autenticarUsuario(req, res, next) {
  const auth = req.headers.authorization || '';

  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não informado.' });
  }

  const token = auth.replace('Bearer ', '').trim();

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido.' });
  }

  if (!payload?.role) {
    return res.status(401).json({ error: 'Token inválido: cargo (role) ausente.' });
  }

  req.user = payload;

  // Usuários comuns — verificar suspensão
  if (payload.role !== 'admin') {
    const usuario = await Usuario.findByPk(payload.id);

    if (!usuario)
      return res.status(401).json({ error: 'Usuário não encontrado.' });

    const usuarioSuspenso = (typeof usuario.suspenso !== 'undefined') ? usuario.suspenso : usuario.suspended;
      if (usuarioSuspenso) return res.status(403).json({ error: 'Conta suspensa. Contate o administrador.' });
  }

  return next();
}

// Apenas administradores
function somenteAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
}

module.exports = { autenticarUsuario, somenteAdmin };
