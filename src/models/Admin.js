const { DataTypes } = require('sequelize');
const { connection } = require('../database');


const Admin = connection.define('admins', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: {type: DataTypes.STRING(100), allowNull: false },
    email: {type: DataTypes.STRING(150), allowNull: false, unique: true },
    senha_hash: {type: DataTypes.STRING(255), allowNull: false },
    criado_em: {type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    timestamps: false
});

module.exports = Admin;
