import { check } from "express-validator";
import { Grupo_usuario } from "../models/Grupo_usuario.js";

export const validacion_existe_grupo_usuario = [
    check('nombre_grupo_usuario')
        .custom(async (value, { req }) => {
            const { body } = req;

            const grupo_usuario = await Grupo_usuario.findOne({
                where: {
                    grupo_usuario_nombre: value.trim(),
                    grupo_usuario_status: 'A'
                }
            });

            if (grupo_usuario && grupo_usuario.grupo_usuario_id != body.grupo_usuario_id) {
                throw new Error('El grupo de usuario ya existe en el sistema. Intente con otro nombre.');
            }
        })
];

export const validar_grupo_usuario_id = [
    check('grupo_usuario_id', 'El grupo_usuario_id es requerido').notEmpty()
];