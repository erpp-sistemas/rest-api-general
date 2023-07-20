import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";
import { Modulo } from "./modulo.js";
import { Grupo_usuario } from "./Grupo_usuario.js";

export const Permiso_modulo = sequelize.define('permiso_modulo', {
    permiso_modulo_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    modulo_id :{
        type: DataTypes.INTEGER,
        references: {
            model: 'modulo',
            key:'modulo_id'
        }
    },
    grupo_usuario_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'grupo_usuario',
            key: 'grupo_usuario_id'
        }
    },
    permiso_modulo_status: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false,
    freezeTableName: true
});

// Relations
Permiso_modulo.belongsTo(Modulo, { foreignKey: 'modulo_id' });
Permiso_modulo.belongsTo(Grupo_usuario, { foreignKey: 'grupo_usuario_id' });

export const get_permisos_modulos = async data => {
    try {
        const permisos_modulos = await Permiso_modulo.findAll({
            include: [
                {
                    model: Modulo,
                    required: true,
                    where: { modulo_status: 'A' }
                }
            ],
            where: {
                grupo_usuario_id: data.grupo_usuario_id,
                permiso_modulo_status: 'A'
            },
            order:[['modulo_id']]
        });

        return permisos_modulos;
    } catch (error) {
        console.log(error);
    }
}