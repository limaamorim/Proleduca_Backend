const { Router } = require('express');
const usuarioController = require('../controllers/usuarioController');
const { validacaoCriarUsuario } = require('../middlewares/validators');

const routes = Router();

routes.post('/', validacaoCriarUsuario, usuarioController.criar);
routes.get('/', usuarioController.listar);
routes.put('/:id', usuarioController.atualizar);
routes.get('/:id', usuarioController.obter);

module.exports = routes;
