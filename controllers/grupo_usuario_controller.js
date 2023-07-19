import { validationResult } from 'express-validator';
// Helpers
import { obtener_hora_local } from "../helpers/fechas.js";
// Modelos
import { Grupo_usuario, lista_grupo_usuarios_total_usuarios } from "../models/Grupo_usuario.js";

export const vista_grupo_usuario = async (req, res, next) => {
    try {
        const grupos_usuarios = await lista_grupo_usuarios_total_usuarios();
        
        let cat_grupos_usuario = [];

        for (const grupo_usuario of grupos_usuarios) {
            const [existe_grupo_usuario] = cat_grupos_usuario.filter(cat_grupo_usuario => cat_grupo_usuario.grupo_usuario_id == grupo_usuario.grupo_usuario_id);
            if (!existe_grupo_usuario) {
                const obj_grupo_usuario = {
                    grupo_usuario_id: grupo_usuario.grupo_usuario_id,
                    grupo_usuario_fecha_creacion: grupo_usuario.grupo_usuario_fecha_creacion,
                    grupo_usuario_nombre: grupo_usuario.grupo_usuario_nombre,
                    total_usuarios: 0,
                    grupo_usuario_status: grupo_usuario.grupo_usuario_status
                };
                cat_grupos_usuario = [...cat_grupos_usuario, obj_grupo_usuario];
            }

            if (grupo_usuario.usuario_status != 'A') continue;

            const [grupo_usuario_encontrado] = cat_grupos_usuario.filter(cat_grupo_usuario => cat_grupo_usuario.grupo_usuario_id == grupo_usuario.grupo_usuario_id);
            grupo_usuario_encontrado.total_usuarios += 1;
        };
        const data = { base_url: process.env.BASE_URL, grupos_usuario: cat_grupos_usuario };
        res.render("grupo_usuario/grupo_usuario", data);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

export const vista_permisos_grupo_usuario = async (req, res, next) => {
    try {
        const data = {
            base_url: process.env.BASE_URL
        };

        res.render("grupo_usuario/permisos", data);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

export const permisos_by_grupo_usuario = async (req, res, next) => {
    try {
        const { session } = req;
        const cat_grupo_usuario = await Grupo_usuario.findAll({ where: { grupo_usuario_status: 'A' } });
        const data = {
            cat_grupo_usuario,
            grupo_usuario_id: session.grupo_usuario_id
        };

        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

export const guardar_nuevo_grupo_usuario = async (req, res, next) => {
    try {
        const { body } = req; 
        const fecha = obtener_hora_local();

        // Crea el nuevo grupo de usuario, solo si no se encuentra registrado en la DB
        const [, crear_grupo_usuario] = await Grupo_usuario.findOrCreate({
            where: { grupo_usuario_nombre: body.nombre_grupo_usuario, grupo_usuario_status: 'A' },
            defaults: {
                grupo_usuario_nombre: body.nombre_grupo_usuario,
                grupo_usuario_fecha_creacion: fecha,
                grupo_usuario_fecha_modificacion: fecha,
                grupo_usuario_status: 'A' 
            }
        });

        /**
         * Si el usuario ya se encuentra registrado,
         * manda el siguiente mensaje de alerta.
        */
        if (!crear_grupo_usuario) {
            res.send({ error: 'El grupo de usuario ya está registrado. Intente con otro nombre.' });
            return;
        }

        res.status(201).send({ msg: '¡Nuevo grupo de usuario!' });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

export const editar_grupo_usuario = async (req, res, next) => {
    try {
        // Validaciones
        const [errores_validacion] = validationResult(req).array();
        if (errores_validacion) {
            return res.status(400).send({ error: errores_validacion });
        }

        const { body } = req; 
        const fecha = obtener_hora_local();
        // Editar grupo usuario
        await Grupo_usuario.update({
            grupo_usuario_nombre: body.nombre_grupo_usuario,
            grupo_usuario_fecha_modificacion: fecha
        }, { where: { grupo_usuario_id: body.grupo_usuario_id } });

        res.status(200).send({ msg: '¡Cambios guardados!' });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

export const eliminar_grupo_usuario = async (req, res, next) => {
    try {
        // Validaciones
        const [errores_validacion] = validationResult(req).array();
        if (errores_validacion) {
            return res.status(400).send({ error: errores_validacion });
        }

        const { body } = req;
        const fecha = obtener_hora_local();
        // Deshabilitar grupo usuario
        await Grupo_usuario.update({
            grupo_usuario_fecha_modificacion: fecha,
            grupo_usuario_status: 'I'
        }, { where: { grupo_usuario_id: body.grupo_usuario_id } });

        res.status(200).send({ msg: '¡Eliminado!' });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}