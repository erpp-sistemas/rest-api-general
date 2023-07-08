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
    grupo_usuario_fecha_creacion: {
        type: DataTypes.STRING                  /* Desde el modelo se especifica como STRING, pero al momento de ser agregado a la DB, 
                                                se guarda como DATETIME.
                                                Para MSSQL no se puede especificar type: DataTypes.DATE, manda error. Por eso
                                                se escribe en STRING */
    },
    grupo_usuario_fecha_modificacion: {
        type: DataTypes.STRING
    },
    grupo_usuario_status: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false,
    freezeTableName: true
});

export const lista_grupo_usuarios = async () => {
    try {
        const [grupo_usuarios, metadata] = await sequelize.query(`
            SELECT
                grupo_usuario.grupo_usuario_id,
                grupo_usuario.grupo_usuario_fecha_creacion,
                grupo_usuario.grupo_usuario_nombre,
                COUNT(usuario.usuario_id) AS total_usuarios,
                IIF(grupo_usuario.grupo_usuario_status = 'A', 'Activo', 'Inactivo') AS grupo_usuario_status
            FROM grupo_usuario
            LEFT JOIN usuario
                ON grupo_usuario.grupo_usuario_id = usuario.grupo_usuario_id
            WHERE
                grupo_usuario.grupo_usuario_status = 'A' AND
                (
                    usuario.usuario_status = 'A' OR
                    usuario.usuario_status IS NULL
                )
            GROUP BY
                grupo_usuario.grupo_usuario_id,
                grupo_usuario.grupo_usuario_fecha_creacion,
                grupo_usuario.grupo_usuario_nombre,
                grupo_usuario.grupo_usuario_status
            ORDER BY grupo_usuario.grupo_usuario_fecha_creacion;
        `);
        return grupo_usuarios;
    } catch (error) {
        console.log(error);
    }
} 