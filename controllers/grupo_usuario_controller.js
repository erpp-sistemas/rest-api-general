import { validationResult } from 'express-validator';
// Helpers
import { obtener_hora_local } from "../helpers/fechas.js";
// Modelos
import { Grupo_usuario, lista_grupo_usuarios } from "../models/Grupo_usuario.js";

export const vista_grupo_usuario = async (req, res, next) => {
    try {
        const grupos_usuario = await lista_grupo_usuarios();
        const data = { base_url: process.env.BASE_URL, grupos_usuario };
        res.render("grupo_usuario/grupo_usuario", data);
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