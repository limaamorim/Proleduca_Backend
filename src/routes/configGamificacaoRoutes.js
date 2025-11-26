// src/routes/configRoutes.js
const { Router } = require('express');
const controller = require('../controllers/configGamificacaoController');
const {  autenticarUsuario, somenteAdmin } = require('../middlewares/auth.js');

const routes = Router();

routes.get('/', autenticarUsuario, somenteAdmin, controller.listar);
routes.put('/:chave', autenticarUsuario, somenteAdmin, controller.configurar);

module.exports = routes;
