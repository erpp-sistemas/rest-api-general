import { check } from "express-validator";
import bcrypt from 'bcrypt';
import { Usuario } from "../models/Usuario.js";

export const login_validation = [
    check('usuario_nombre')
        .custom(async (value, { req }) => {
            const { body } = req;
            const usuario = await Usuario.findOne({
                where: {
                    usuario_nombre_usuario: value.trim(),
                    usuario_status: "A"
                }
            });
            if (!usuario) {
                throw new Error('El usuario no está registrado en el sistema. Intente con otro.');
            }
            
            const mismas_passwords = await bcrypt.compare(body.usuario_password, usuario.usuario_password);
            if (!mismas_passwords) {
                throw new Error('La contraseña es incorrecta.');
            }
        })
];