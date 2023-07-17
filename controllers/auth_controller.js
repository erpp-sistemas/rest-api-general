import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
// Modelos
import { Usuario, get_datos_usuario } from '../models/Usuario.js';
import { get_permisos_modulos } from '../models/permiso_modulo.js';
import { get_permisos_submodulos } from '../models/permiso_submodulo.js';

export const login = async (req, res, next) => {
    try {
        // Validaciones express-validator
        const [errores_validacion] = validationResult(req).array();
        if (errores_validacion) {
            return res.status(400).send({ error: errores_validacion });
        }

        const { body } = req;
        const usuario = await Usuario.findOne({ where: { usuario_nombre_usuario: body.usuario_nombre, usuario_status: 'A'} });
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
            usuario_cargo: usuario.usuario_cargo,
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

export const logout = async (req, res, next) => {
    try {
        req.session.destroy();
        res.status(200).send({ msg: 'Sesión cerrada con éxito' });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

export const get_datos_sidebar = async (req, res, next) => {
    try {
        const { body } = req;

        const data_body = { usuario_id: body.usuario_id };
        const usuario = await get_datos_usuario(data_body);
        
        /**
         * Obtener los datos para armar la sección
         * del sidebar
        */
        const data_permisos = { grupo_usuario_id: usuario[0].grupo_usuario_id };
        const permisos_modulos = await get_permisos_modulos(data_permisos);
        const permisos_submodulos = await get_permisos_submodulos(data_permisos);
        
        // Armar sidebar seccionado por permisos            
        let secciones_sidebar = [];
        
        /**
         * Cada uno de los modulos a los que tiene permiso accesar el usuario,
         * se insertan en @const secciones_sidebar
        */
        permisos_modulos.forEach(permiso_modulo => {
            const { modulo } = permiso_modulo;
            modulo.dataValues.submodulos = [];
            secciones_sidebar = [...secciones_sidebar, modulo.dataValues];
        });

        permisos_submodulos.forEach(permiso_submodulo => {
            const { submodulo } = permiso_submodulo;
            // Se filtra el módulo al que pertenece el submodulo
            const modulo = secciones_sidebar.find(modulo => modulo.modulo_id == submodulo.modulo_id);
            // Dicho modulo encontrado, se obtiene la propiedad submodulos,
            // para agregar los submodulos a los q pertenecen a dicho modulo 
            modulo.submodulos = [...modulo.submodulos, submodulo];
        });

        const data = { usuario, secciones_sidebar };

        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}