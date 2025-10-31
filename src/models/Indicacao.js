// src/models/Indicacao.js
const { DataTypes } = require('sequelize');
const connection = require('../database');

const Indicacao = connection.define('indicacoes', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  indicado_nome: { type: DataTypes.STRING(150) },
  indicado_email: { type: DataTypes.STRING(200) },
  data_indicacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  validada: { type: DataTypes.BOOLEAN, defaultValue: false },
  validada_em: { type: DataTypes.DATE, allowNull: true },
  criado_em: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  atualizado_em: { type: DataTypes.DATE },
}, {
  timestamps: false,
  tableName: 'indicacoes'
});

// hooks
Indicacao.beforeCreate((inst) => {
  inst.criado_em = inst.criado_em || new Date();
  inst.atualizado_em = new Date();
});

Indicacao.beforeUpdate((inst) => {
  inst.atualizado_em = new Date();
});

module.exports = Indicacao;
