// src/models/Impacto.js
const { DataTypes } = require('sequelize');
const connection = require('../database/index').connection;

const Impacto = connection.define('impactos', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  indicacoes_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  bolsas_concedidas: { type: DataTypes.INTEGER, defaultValue: 0 },
  renda_gerada: { type: DataTypes.DECIMAL(12,2), defaultValue: 0.00 },
  familias_ajudadas: { type: DataTypes.INTEGER, defaultValue: 0 },
  detalhes: { type: DataTypes.JSONB, defaultValue: [] },
  criado_em: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  atualizado_em: { type: DataTypes.DATE }
}, {
  timestamps: false,
  tableName: 'impactos'
});

module.exports = Impacto;
