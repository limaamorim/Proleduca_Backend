// src/models/ConfigGamificacao.js
const { DataTypes } = require('sequelize');
const { connection } = require('../database');


const ConfigGamificacao = connection.define('config_gamificacao', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  chave: { type: DataTypes.STRING, unique: true, allowNull: false },
  valor: { type: DataTypes.STRING, allowNull: false },
  atualizado_em: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: false,
  tableName: 'config_gamificacao'
});

module.exports = ConfigGamificacao;