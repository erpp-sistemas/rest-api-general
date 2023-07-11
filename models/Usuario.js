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
    usuario_password_crypt: {
        type: DataTypes.STRING
    },
    grupo_usuario_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'grupo_usuario',
            key: 'grupo_usuario_id'
        }
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

export const lista_usuarios_activos = async () => {
    try {
        const [usuarios, metadata] = await sequelize.query(`  
            SELECT
                *,
                CONCAT_WS(' ', usuario.usuario_nombre, usuario.usuario_apellidos) AS nombre_completo
            FROM usuario
            WHERE usuario.usuario_status = 'A';
        `);
        return usuarios;
    } catch (error) {
        console.log(error);
    }
}