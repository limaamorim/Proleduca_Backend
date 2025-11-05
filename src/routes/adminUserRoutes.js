// src/routes/adminUserRoutes.js
const { Router } = require('express');
const adminUserController = require('../controllers/adminUserController');
const { authMiddleware, adminOnly } = require('../middlewares/auth');

const routes = Router();

// todas as rotas aqui protegidas por adminOnly
routes.use(authMiddleware, adminOnly);

routes.get('/', adminUserController.listar);               // GET /api/v1/admins/users
routes.get('/:id', adminUserController.obter);             // GET /api/v1/admins/users/:id
routes.patch('/:id/suspend', adminUserController.suspend); // PATCH /api/v1/admins/users/:id/suspend  body { suspended: true/false }
routes.delete('/:id', adminUserController.deletar);        // DELETE /api/v1/admins/users/:id

module.exports = routes;
