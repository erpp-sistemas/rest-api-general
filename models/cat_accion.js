import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

export const Cat_accion = sequelize.define('cat_accion', {
    cat_accion_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    cat_accion_nombre: {
        type: DataTypes.STRING
    },
    cat_accion_status: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false,
    freezeTableName: true
});