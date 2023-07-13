import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { Grupo_usuario } from "./Grupo_usuario.js";

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
    usuario_cargo: {
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
    grupo_usuario_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'grupo_usuario',
            key: 'grupo_usuario_id'
        }
    },
    usuario_fecha_creacion: {
        type: DataTypes.STRING
    },
    usuario_fecha_modificacion: {
        type: DataTypes.STRING
    },
    usuario_status: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false,
    freezeTableName: true
});

// Relaciones
Usuario.belongsTo(Grupo_usuario, { foreignKey: 'grupo_usuario_id' });

export const get_datos_usuario = async data => {
    try {
        const [usuario, metadata] = await sequelize.query(`  
            SELECT
                usuario.usuario_id,
                usuario.usuario_nombre_usuario,
                usuario.usuario_nombre,
                usuario.usuario_apellidos,
                usuario.usuario_cargo,
                usuario.usuario_direccion,
                usuario.usuario_email,
                usuario.grupo_usuario_id
            FROM usuario
            WHERE usuario.usuario_id = ${data.usuario_id};
        `);
        return usuario;
    } catch (error) {
        console.log(error);
    }
}

export const lista_usuarios_activos = async data => {
    try {
        const [usuarios, metadata] = await sequelize.query(`  
            SELECT
                *,
                CONCAT_WS(' ', usuario.usuario_nombre, usuario.usuario_apellidos) AS nombre_completo
            FROM usuario
            JOIN grupo_usuario
                ON grupo_usuario.grupo_usuario_id = usuario.grupo_usuario_id
            WHERE usuario.usuario_status = 'A'
            ORDER BY usuario.usuario_fecha_creacion DESC
			OFFSET ${data.pagina_actual - 1} ROWS FETCH NEXT ${data.registros_por_pagina} ROWS ONLY;
        `);
        return usuarios;
    } catch (error) {
        console.log(error);
    }
}