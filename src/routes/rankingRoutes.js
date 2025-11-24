// src/routes/rankingRoutes.js
const { Router } = require('express');
const controller = require('../controllers/rankingController');

const routes = Router();

routes.get('/diario', controller.diario);
routes.get('/semanal', controller.semanal);
routes.get('/mensal', controller.mensal);
routes.get('/todos', controller.todos);

module.exports = routes;
