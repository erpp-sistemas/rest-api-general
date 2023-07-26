import sequelize from "../config/db.js";
import { DataTypes, Op } from "sequelize";

export const Modulo = sequelize.define('modulo', {
    modulo_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    modulo_nombre: {
        type: DataTypes.STRING
    },
    modulo_ruta_url: {
        type: DataTypes.STRING
    },
    modulo_icon_url: {
        type: DataTypes.STRING
    },
    modulo_status: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false,
    freezeTableName: true
});

export const get_vistas = async () => {
    try {
        const vistas = await Modulo.findAll({
            where: {
                modulo_nombre: { [Op.ne]: 'Inicio' },
                modulo_status: 'A'
            },
            order: [['modulo_id']]
        });
        return vistas;
    } catch (error) {
        console.log(error);
    }
}