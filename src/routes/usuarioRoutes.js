const { Router } = require('express');
const usuarioController = require('../controllers/usuarioController');
const { createUserRules } = require('../middlewares/validators');

const routes = Router();

routes.post('/', createUserRules, usuarioController.criar);
routes.get('/', usuarioController.listar);
routes.put('/:id', usuarioController.atualizar);


module.exports = routes;
