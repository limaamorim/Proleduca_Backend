// src/routes/metaRoutes.js
const { Router } = require('express');
const controller = require('../controllers/metaController');
const { authMiddleware, adminOnly } = require('../middlewares/auth');

const routes = Router();

// progresso & claim
routes.get('/usuario/:usuario_id', authMiddleware, controller.progressoPorUsuario); // list progress (user or admin)

// público: listar metas
routes.get('/', controller.listar);
routes.get('/:id', controller.obter);

// admin: CRUD
routes.post('/', authMiddleware, adminOnly, controller.criar);
routes.put('/:id', authMiddleware, adminOnly, controller.atualizar);
routes.delete('/:id', authMiddleware, adminOnly, controller.deletar);

module.exports = routes;
