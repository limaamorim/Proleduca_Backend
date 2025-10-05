const { DataTypes } = require('sequelize');
const connection = require('../database/index').connection;

//allowNull: Campos obrigatórios
//unique: Garante que o valor seja único no banco de dados


const Usuario = connection.define('usuarios', {
    id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    nome: { 
        type: DataTypes.STRING(100), 
        allowNull: false 
    },
    telefone: { 
        type: DataTypes.STRING(20), 
        allowNull: false 
    },
    email: { 
        type: DataTypes.STRING(150), 
        allowNull: false, 
        unique: true 
    },
    cpf: { 
        type: DataTypes.STRING(14), 
        allowNull: false, 
        unique: true 
    },
    idade: { 
        type: DataTypes.INTEGER, 
        allowNull: true 
    },
    senha_hash: { 
        type: DataTypes.STRING(255), 
        allowNull: false 
    },
    link_indicacao: { 
        type: DataTypes.STRING(255), 
        allowNull: true, 
        unique: true 
    },
    criado_em: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
    },
    atualizado_em: { 
        type: DataTypes.DATE 
    }
}, {
    timestamps: false
});

module.exports = Usuario;
