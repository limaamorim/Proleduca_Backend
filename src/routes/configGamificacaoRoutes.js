// src/routes/configRoutes.js
const { Router } = require('express');
const controller = require('../controllers/configGameficacaoController');
const { authMiddleware, adminOnly } = require('../middlewares/auth.js');

const routes = Router();

routes.get('/', authMiddleware, adminOnly, controller.listar);
routes.put('/:chave', authMiddleware, adminOnly, controller.upsert);

module.exports = routes;
