import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken'
// Modelos
import { Usuario } from '../models/Usuario.js';

export const login = async (req, res, next) => {
    try {
        // Validaciones express-validator
        const [errores_validacion] = validationResult(req).array();
        if (errores_validacion) {
            return res.status(400).send({ error: errores_validacion });
        }

        const { body } = req;
        const usuario = await Usuario.findOne({ where: { usuario_nombre_usuario: body.usuario_nombre} });

        // Generar JWT
        // El token expira en 1 día
        const jsonwebtoken = jwt.sign(
            {
                id: usuario.usuario_id,
                name: usuario.usuario_nombre_usuario
            },
            process.env.TOKEN_SECRET,
            { expiresIn: '86400s' }
        );
       
        // Iniciar sesión de usuario
        req.session.logged = true;
        req.session.usuario_id = usuario.usuario_id;
        req.session.grupo_usuario_id = usuario.grupo_usuario_id;
        
        const data = {
            usuario_id: usuario.usuario_id,
            usuario: usuario.usuario_nombre_usuario,
            usuario_nombre: usuario.usuario_nombre,
            usuario_apellidos: usuario.usuario_apellidos,
            grupo_usuario_id: usuario.grupo_usuario_id,
            token: jsonwebtoken
        };

        res.status(200).header('auth-token', jsonwebtoken).json({ data: data });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}