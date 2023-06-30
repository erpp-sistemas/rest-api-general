import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export const Grupo_usuario = sequelize.define('grupo_usuario', {
    grupo_usuario_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    grupo_usuario_nombre: {
        type: DataTypes.STRING
    },
    grupo_usuario_status: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false,
    freezeTableName: true
});