const { Router } = require('express');
const controller = require('../controllers/gamificacaoController');

const routes = Router();
routes.get('/usuario/:usuario_id', controller.obterPorUsuario);
routes.post('/:usuario_id/pontos', controller.adicionarPontos); // body: { pontos, origem, referencia_id }

module.exports = routes;