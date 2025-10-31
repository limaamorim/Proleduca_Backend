const { Router } = require('express');
const indicacaoController = require('../controllers/indicacaoController');

const routes = Router();

routes.post('/', indicacaoController.criar);
routes.get('/', indicacaoController.listar);
routes.get('/:id', indicacaoController.obter);


routes.post('/:id/validar', indicacaoController.validar);

module.exports = routes;