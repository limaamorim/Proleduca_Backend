// src/middlewares/validators.js
const { body, validationResult } = require('express-validator');

// Middleware para retornar erros de validação
const validarCampos = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
};

// Validação para criação de usuário
const validacaoCriarUsuario = [
  body('nome').isString().notEmpty().withMessage('Nome é obrigatório.'),
  body('telefone').isString().notEmpty().withMessage('Telefone é obrigatório.'),
  body('email').isEmail().withMessage('E-mail inválido.'),
  body('cpf').isString().notEmpty().withMessage('CPF é obrigatório.'),
  body('senha').isString().isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres.'),
  validarCampos
];

// Validação para criação de indicação
const validacaoCriarIndicacao = [
  body('usuario_id').isInt().notEmpty().withMessage('ID do usuário é obrigatório.'),
  body('indicado_email').optional().isEmail().withMessage('E-mail indicado inválido.'),
  validarCampos
];

module.exports = {
  validacaoCriarUsuario,
  validacaoCriarIndicacao
};
