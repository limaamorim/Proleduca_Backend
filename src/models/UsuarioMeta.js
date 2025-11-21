const { DataTypes } = require('sequelize');
const { connection } = require('../database');

const UsuarioMeta = connection.define('usuario_metas', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  meta_id: { type: DataTypes.INTEGER, allowNull: false },
  progresso_indicacoes: { type: DataTypes.INTEGER, defaultValue: 0 },
  completado: { type: DataTypes.BOOLEAN, defaultValue: false },
  recebido: { type: DataTypes.BOOLEAN, defaultValue: false },
  ganho: { type: DataTypes.DECIMAL(12,2), defaultValue: 0.00 },
  ganho_creditado: { type: DataTypes.BOOLEAN, defaultValue: false }, // novo
  periodo_inicio: { type: DataTypes.DATE, allowNull: true },
  periodo_fim: { type: DataTypes.DATE, allowNull: true },
  criado_em: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  atualizado_em: { type: DataTypes.DATE }
}, {
  timestamps: false,
  tableName: 'usuario_metas',
  indexes: [
    { unique: true, fields: ['usuario_id','meta_id'] }
  ]
});

module.exports = UsuarioMeta;
