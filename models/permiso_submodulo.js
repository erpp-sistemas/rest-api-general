import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";
import { Submodulo } from "./submodulo.js";
import { Grupo_usuario } from "./Grupo_usuario.js";

export const Permiso_submodulo = sequelize.define('permiso_submodulo', {
    permiso_submodulo_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    submodulo_id :{
        type: DataTypes.INTEGER,
        references: {
            model: 'submodulo',
            key:'submodulo_id'
        }
    },
    grupo_usuario_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'grupo_usuario',
            key: 'grupo_usuario_id'
        }
    },
    permiso_submodulo_status: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false,
    freezeTableName: true
});

// Relations
Permiso_submodulo.belongsTo(Submodulo, { foreignKey: 'submodulo_id' });
Permiso_submodulo.belongsTo(Grupo_usuario, { foreignKey: 'grupo_usuario_id' });

export const get_permisos_submodulos = async data => {
    try {
        const permisos_submodulos = await Permiso_submodulo.findAll({
            include: [
                {
                    model: Submodulo,
                    required: true,
                    where: { submodulo_status: 'A' }
                }
            ],
            where: {
                grupo_usuario_id: data.grupo_usuario_id,
                permiso_submodulo_status: 'A'
            },
            order: [['submodulo_id']]
        });

        return permisos_submodulos;
    } catch (error) {
        console.log(error);
    }
}