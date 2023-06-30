import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export const Usuario = sequelize.define('usuario', {
    usuario_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    usuario_nombre_usuario: {
        type: DataTypes.STRING
    },
    usuario_nombre: {
        type: DataTypes.STRING
    },
    usuario_apellidos: {
        type: DataTypes.STRING        
    },
    usuario_direccion: {
        type: DataTypes.STRING
    },
    usuario_email: {
        type: DataTypes.STRING
    },
    usuario_password: {
        type: DataTypes.STRING
    },
    usuario_password_crypt: {
        type: DataTypes.STRING
    },
    grupo_usuario_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'grupo_usuario',
            key: 'grupo_usuario_id'
        }
    },
    usuario_status: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false,
    freezeTableName: true
});