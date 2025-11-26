const { DataTypes } = require('sequelize');
const { connection } = require('../database');

const Usuario = connection.define('usuarios', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING(100), allowNull: false },
  telefone: { type: DataTypes.STRING(20), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  cpf: { type: DataTypes.STRING(14), allowNull: false, unique: true },
  data_nascimento: { type: DataTypes.DATEONLY, allowNull: true },
  senha_hash: { type: DataTypes.STRING(255), allowNull: false },
  link_indicacao: { type: DataTypes.STRING(255), allowNull: true, unique: true },

  // CAMPOS DA RECUPERAÇÃO DE SENHA
  reset_code: { type: DataTypes.STRING, allowNull: true },
  reset_expires: { type: DataTypes.DATE, allowNull: true },

  suspenso: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'suspended' },
  criado_em: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  atualizado_em: { type: DataTypes.DATE }
}, {
  timestamps: false
});

module.exports = Usuario;
