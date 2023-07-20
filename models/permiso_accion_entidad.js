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

export const permiso_accion_entidad_by_grupo_usuario = async data => {
    try {
        const [permisos_acciones, metadata] = await sequelize.query(`  
            SELECT
                IIF(permiso_accion_entidad.permiso_accion_entidad_status = 'A', '-', 'd-none') as mostrar_accion,
                LOWER(cat_accion.cat_accion_nombre) AS accion_nombre
            FROM permiso_accion_entidad
            JOIN cat_accion
                ON cat_accion.cat_accion_id = permiso_accion_entidad.cat_accion_id
            JOIN cat_entidad
                ON cat_entidad.cat_entidad_id = permiso_accion_entidad.cat_entidad_id
            WHERE
                permiso_accion_entidad.cat_entidad_id = ${data.cat_entidad_id} AND
                permiso_accion_entidad.grupo_usuario_id = ${data.grupo_usuario_id} AND
                permiso_accion_entidad.permiso_accion_entidad_status = 'A'
        `);
        return permisos_acciones;
    } catch (error) {
        console.log(error);
    }
}