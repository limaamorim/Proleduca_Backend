// src/models/Gamificacao.js
const { DataTypes } = require('sequelize');
const connection = require('../database');

const Gamificacao = connection.define('gamificacao', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  nivel: { type: DataTypes.INTEGER, defaultValue: 1 },
  pontos: { type: DataTypes.INTEGER, defaultValue: 0 },
  metas_batidas: { type: DataTypes.INTEGER, defaultValue: 0 },
  criado_em: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  atualizado_em: { type: DataTypes.DATE }
}, {
  timestamps: false,
  tableName: 'gamificacao'
});

module.exports = Gamificacao;