// src/routes/adminRoutes.js
const { Router } = require('express');
const adminController = require('../controllers/adminController');
const { authMiddleware, adminOnly } = require('../middlewares/auth');

const routes = Router();

// proteção: apenas admin pode criar/listar/atualizar/deletar admins
//routes.post('/', authMiddleware, adminOnly, adminController.criar);
routes.post('/', adminController.criar);
routes.get('/', authMiddleware, adminOnly, adminController.listar);
routes.put('/:id', authMiddleware, adminOnly, adminController.atualizar);
routes.delete('/:id', authMiddleware, adminOnly, adminController.deletar);


module.exports = routes;

