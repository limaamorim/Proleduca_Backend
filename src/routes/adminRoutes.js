const { Router } = require('express');
const adminController = require('../controllers/adminController');

const routes = Router();

routes.post('/', adminController.criar);
routes.get('/', adminController.listar);
routes.put('/:id', adminController.atualizar);
routes.delete('/:id', adminController.deletar);

module.exports = routes;
