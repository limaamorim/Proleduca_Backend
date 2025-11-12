// src/middlewares/validators.js
const { body, validationResult, param, query } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const createUserRules = [
  body('nome').isString().notEmpty(),
  body('telefone').isString().notEmpty(),
  body('email').isEmail(),
  body('cpf').isString().notEmpty(),
  body('senha').isString().isLength({ min: 6 }),
  handleValidation
];

const createIndicacaoRules = [
  body('usuario_id').isInt().notEmpty(),
  body('indicado_email').optional().isEmail(),
  handleValidation
];

module.exports = { createUserRules, createIndicacaoRules };
