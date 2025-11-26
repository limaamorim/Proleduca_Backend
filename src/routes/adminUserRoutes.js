// src/routes/adminUserRoutes.js
const { Router } = require('express');
const adminUserController = require('../controllers/adminUserController');
const { autenticarUsuario, somenteAdmin } = require('../middlewares/auth');

const routes = Router();

// todas as rotas aqui protegidas por adminOnly
routes.use(autenticarUsuario, somenteAdmin);
routes.get('/', adminUserController.listar); 
routes.get('/:id', adminUserController.obter); 
routes.patch('/:id/suspender', adminUserController.suspender);
routes.delete('/:id', adminUserController.deletar);        

module.exports = routes;
