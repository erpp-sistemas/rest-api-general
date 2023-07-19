import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

export const Permiso_accion_entidad = sequelize.define('permiso_accion_entidad', {
    permiso_accion_entidad_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    cat_accion_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'cat_accion',
            key: 'cat_accion_id'
        }
    },
    cat_entidad_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'cat_entidad',
            key: 'cat_entidad_id'
        }
    },
    grupo_usuario_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'grupo_usuario',
            key: 'grupo_usuario_id'
        }
    },
    permiso_accion_entidad_status: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false,
    freezeTableName: true
});