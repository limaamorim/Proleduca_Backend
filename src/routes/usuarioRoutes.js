const { Router } = require('express');
const usuarioController = require('../controllers/usuarioController');

const routes = Router();

routes.post('/', usuarioController.criar);
routes.get('/', usuarioController.listar);
routes.put('/:id', usuarioController.atualizar);
routes.delete('/:id', usuarioController.deletar);

module.exports = routes;
