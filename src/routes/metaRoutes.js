// src/routes/metaRoutes.js
const { Router } = require('express');
const controller = require('../controllers/metaController');
const { autenticarUsuario, somenteAdmin } = require('../middlewares/auth');

const routes = Router();

// progresso & claim
routes.get('/usuario/:usuario_id', autenticarUsuario, controller.progressoPorUsuario); // list progress (user or admin)

// público: listar metas
routes.get('/', controller.listar);
routes.get('/:id', controller.obter);

// admin: CRUD
routes.post('/', autenticarUsuario, somenteAdmin, controller.criar);
routes.put('/:id', autenticarUsuario, somenteAdmin, controller.atualizar);
routes.delete('/:id', autenticarUsuario, somenteAdmin, controller.deletar);

module.exports = routes;
