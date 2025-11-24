// src/routes/adminRoutes.js
const { Router } = require('express');
const adminController = require('../controllers/adminController');
const { autenticarUsuario, somenteAdmin } = require('../middlewares/auth');

const routes = Router();

// proteção: apenas admin pode criar/listar/atualizar/deletar admins
//routes.post('/', authMiddleware, adminOnly, adminController.criar);
routes.post('/', adminController.criar);
routes.get('/', autenticarUsuario, somenteAdmin, adminController.listar);
routes.put('/:id', autenticarUsuario, somenteAdmin, adminController.atualizar);
routes.delete('/:id', autenticarUsuario, somenteAdmin, adminController.deletar);


module.exports = routes;

