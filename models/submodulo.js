import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

export const Submodulo = sequelize.define('submodulo', {
    submodulo_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    submodulo_nombre: {
        type: DataTypes.STRING
    },
    submodulo_ruta_url: {
        type: DataTypes.STRING
    },
    modulo_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'modulo',
            key: 'modulo_id'
        }
    },
    submodulo_status: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false,
    freezeTableName: true
});