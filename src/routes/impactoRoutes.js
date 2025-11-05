const { Router } = require('express');
const impactoController = require('../controllers/impactoController');

const routes = Router();

routes.get('/usuario/:usuario_id', impactoController.obterPorUsuario);

module.exports = routes;
