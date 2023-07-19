import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

export const Cat_entidad = sequelize.define('cat_entidad', {
    cat_entidad_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    cat_entidad_nombre: {
        type: DataTypes.STRING
    },
    cat_entidad_status: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false,
    freezeTableName: true
});