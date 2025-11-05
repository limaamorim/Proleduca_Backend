// src/routes/indicacaoRoutes.js
const { Router } = require('express');
const indicacaoController = require('../controllers/indicacaoController');
const { authMiddleware, adminOnly } = require('../middlewares/auth');
const { createIndicacaoRules } = require('../middlewares/validators');


const routes = Router();

routes.post('/', createIndicacaoRules, indicacaoController.criar);
routes.get('/', indicacaoController.listar);
routes.get('/:id', indicacaoController.obter);

// rota para validar -> agora protegida por admin
routes.post('/:id/validar', authMiddleware, adminOnly, indicacaoController.validar);

module.exports = routes;
