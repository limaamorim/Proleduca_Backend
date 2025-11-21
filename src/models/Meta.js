// src/models/Meta.js
const { DataTypes } = require('sequelize');
const { connection } = require('../database');

const Meta = connection.define('metas', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING(200), allowNull: false },
  descricao: { type: DataTypes.TEXT },
  tipo_periodicidade: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'unica' },
  alvo_indicacoes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  recompensa: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0.00 },
  ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  inicio_validade: { type: DataTypes.DATE, allowNull: true },
  fim_validade: { type: DataTypes.DATE, allowNull: true },
  criado_em: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  atualizado_em: { type: DataTypes.DATE }
}, {
  timestamps: false,
  tableName: 'metas'
});

module.exports = Meta;
