// src/routes/indicacaoRoutes.js
const { Router } = require('express');
const indicacaoController = require('../controllers/indicacaoController');
const { autenticarUsuario, somenteAdmin } = require('../middlewares/auth');
const { validacaoCriarIndicacao } = require('../middlewares/validators');


const routes = Router();

routes.post('/', validacaoCriarIndicacao, indicacaoController.criar);
routes.get('/', indicacaoController.listar);
routes.get('/:id', indicacaoController.obter);

// rota para validar -> agora protegida por admin
routes.post('/:id/validar', autenticarUsuario, somenteAdmin, indicacaoController.validar);

module.exports = routes;
