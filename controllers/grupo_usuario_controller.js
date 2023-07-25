import { validationResult } from 'express-validator';
// Helpers
import { obtener_hora_local } from "../helpers/fechas.js";
// Modelos
import { Grupo_usuario, lista_grupo_usuarios_total_usuarios } from "../models/Grupo_usuario.js";
import { permisos_acciones_by_grupo_usuario } from '../helpers/permisos.js';
import { Modulo, get_vistas } from '../models/modulo.js';
import { Permiso_modulo, get_permisos_modulos } from '../models/permiso_modulo.js';
import { get_subvistas } from '../models/submodulo.js';
import { Permiso_submodulo, get_permisos_submodulos } from '../models/permiso_submodulo.js';
import { Cat_entidad } from '../models/cat_entidad.js';
import { Cat_accion } from '../models/cat_accion.js';
import { Permiso_accion_entidad } from '../models/permiso_accion_entidad.js';

export const vista_grupo_usuario = async (req, res, next) => {
    try {
        const { session } = req;

        const grupos_usuarios = await lista_grupo_usuarios_total_usuarios();

        const data_use = {
            cat_entidad_id: 1,
            grupo_usuario_id: session.grupo_usuario_id
        };
        const permisos_acciones = await permisos_acciones_by_grupo_usuario(data_use);

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
        const data = {
            base_url: process.env.BASE_URL,
            permisos_acciones: permisos_acciones,
            grupos_usuario: cat_grupos_usuario
        };
        res.render("grupo_usuario/grupo_usuario", data);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

export const vista_permisos_grupo_usuario = async (req, res, next) => {
    try {
        const cat_acciones = await Cat_accion.findAll({
            where: { cat_accion_status: 'A' },
            order: [['cat_accion_id']]
        });

        const data = {
            base_url: process.env.BASE_URL,
            cat_acciones: cat_acciones
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
        const { body } = req;

        const cat_grupo_usuario = await Grupo_usuario.findAll({
            where: { grupo_usuario_status: 'A' },
            order: [['grupo_usuario_id']]
        });

        const data_grupo_usuario = {
            grupo_usuario_id: body.grupo_usuario_id
        };

        const vistas = await get_vistas(); 
        const subvistas = await get_subvistas();
        const permiso_vistas = await get_permisos_modulos(data_grupo_usuario);
        const permisos_subvistas = await get_permisos_submodulos(data_grupo_usuario);

        /**
         * Permisos vistas
        */
        let vistas_permiso = [];

        for (const vista of vistas) {
            const [tiene_permiso_vista] = permiso_vistas.filter(permiso_vista => permiso_vista.modulo.modulo_id == vista.modulo_id);
           
            if (!tiene_permiso_vista) {
               vista.dataValues.checked = '';
            } else {
                vista.dataValues.checked = 'checked';
            }
            
            vista.dataValues.submodulos = [];

            vistas_permiso = [...vistas_permiso, vista];
        }

        for (const subvista of subvistas) {
            const [tiene_permiso_subvista] = permisos_subvistas
                .filter(permiso_subvista => permiso_subvista.submodulo.submodulo_id == subvista.submodulo_id);
            
            if (!tiene_permiso_subvista) {
                subvista.dataValues.checked = '';
            } else {
                subvista.dataValues.checked = 'checked';
            }

            const modulo_encontrado = vistas_permiso.find(vista => vista.modulo_id == subvista.modulo_id);
            if (!modulo_encontrado) continue;
            modulo_encontrado.dataValues.submodulos = [...modulo_encontrado.dataValues.submodulos, subvista];
        }

        /** 
         * Permisos acciones entidades
        */
        const cat_entidades_found = await Cat_entidad.findAll({
            where: { cat_entidad_status: 'A' },
            order: [['cat_entidad_id']]
        });

        const cat_acciones = await Cat_accion.findAll({
            where: { cat_accion_status: 'A' },
            order: [['cat_accion_id']]
        });

        const permisos_accion_entidad = await Permiso_accion_entidad.findAll({
            where: {
                grupo_usuario_id: body.grupo_usuario_id,
                permiso_accion_entidad_status: 'A'
            },
            order: [['cat_entidad_id'], ['cat_accion_id']]
        });

        const cat_entidades = cat_entidades_found.map(cat_entidad => {
            cat_entidad.dataValues.acciones = []
            return cat_entidad;
        });

        for (const cat_entidad of cat_entidades) {
            for (const cat_accion of cat_acciones) {
                const permiso_accion_entidad = permisos_accion_entidad
                    .filter(permiso_accion_entidad =>
                        permiso_accion_entidad.cat_entidad_id == cat_entidad.cat_entidad_id && permiso_accion_entidad.cat_accion_id == cat_accion.cat_accion_id);

                if (permiso_accion_entidad.length > 0) {
                    const obj = {
                        cat_accion_id: cat_accion.cat_accion_id,
                        cat_accion_nombre: cat_accion.cat_accion_nombre,
                        cat_accion_status: cat_accion.cat_accion_status,
                        checked: 'checked'
                    };

                    const index = cat_entidades.findIndex(cat_entidad_e => cat_entidad_e.cat_entidad_id == cat_entidad.cat_entidad_id);
                    cat_entidades[index].dataValues.acciones.push(obj);
                } else {
                    const obj = {
                        cat_accion_id: cat_accion.cat_accion_id,
                        cat_accion_nombre: cat_accion.cat_accion_nombre,
                        cat_accion_status: cat_accion.cat_accion_status,
                        checked: ''
                    };
                    const index = cat_entidades.findIndex(cat_entidad_e => cat_entidad_e.cat_entidad_id == cat_entidad.cat_entidad_id);
                    cat_entidades[index].dataValues.acciones.push(obj);
                }
            }            
        }

        const data = {
            cat_grupo_usuario,
            grupo_usuario_id: body.grupo_usuario_id,
            vistas: vistas_permiso,
            permisos_acciones: cat_entidades
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

export const editar_permiso_vistas = async (req, res, next) => {
    try {
        const { body } = req;

        const permisos_vistas_edit = JSON.parse(body.permisos_vistas);
        const permisos_subvistas_edit = JSON.parse(body.permisos_subvistas);

        const all_permisos_vistas_activas = await Permiso_modulo.findAll({
            where: {
                grupo_usuario_id: body.grupo_usuario_id,
                permiso_modulo_status: 'A'
            }
        });

        const all_permisos_subvistas_activas = await Permiso_submodulo.findAll({
            where: {
                grupo_usuario_id: body.grupo_usuario_id,
                permiso_submodulo_status: 'A'
            }
        });

        /**
         * Eliminar o desactivar los permisos a vistas
        */
        for (const permiso_vista of all_permisos_vistas_activas) {
            const esta_vista = permisos_vistas_edit.some(permiso_vista_edit => permiso_vista_edit.modulo_id == permiso_vista.modulo_id);
            /**
             * De las vistas que si estén, ir eliminándolas del array @permisos_vistas_edit
             * para que este quede solo con los elementos que hay que agregar a la tabla permisos_vistas
            */
            if (esta_vista) {
                const indice_encontrado = permisos_vistas_edit
                    .findIndex(permiso_vista_encontrado => permiso_vista_encontrado.modulo_id == permiso_vista.modulo_id);
                // Eliminar del array @permisos_vistas_edit el @indice_encontrado
                permisos_vistas_edit.splice(indice_encontrado, 1);
            } else {
                // Desactivar vista
                await Permiso_modulo.update({
                    permiso_modulo_status: 'I'
                }, { where: { grupo_usuario_id: body.grupo_usuario_id, modulo_id: permiso_vista.modulo_id } });
            }
        }
       
        /**
         * Eliminar o desactivar los permisos a subvistas
        */
        for (const permiso_subvista of all_permisos_subvistas_activas) {
            const esta_subvista = permisos_subvistas_edit.some(permiso_subvista_edit => permiso_subvista_edit.submodulo_id == permiso_subvista.submodulo_id);

            if (esta_subvista) {
                const indice_encontrado = permisos_subvistas_edit
                    .findIndex(permiso_subvista_encontrado => permiso_subvista_encontrado.submodulo_id == permiso_subvista.submodulo_id);
                // Eliminar del array @permisos_subvistas_edit el @indice_encontrado
                permisos_subvistas_edit.splice(indice_encontrado, 1);
            } else {
                // Desactivar subvista
                await Permiso_submodulo.update({
                    permiso_submodulo_status: 'I'
                }, { where: { grupo_usuario_id: body.grupo_usuario_id, submodulo_id: permiso_subvista.submodulo_id } });
            }
        }

        // Crear los nuevos permisos a vistas
        for (const permiso_vista of permisos_vistas_edit) {
            const [permiso_modulo, crear] = await Permiso_modulo.findOrCreate({
                where: { grupo_usuario_id: body.grupo_usuario_id, modulo_id: permiso_vista.modulo_id },
                defaults: {
                    modulo_id: permiso_vista.modulo_id,
                    grupo_usuario_id: body.grupo_usuario_id,
                    permiso_modulo_status: 'A'
                }
            });

            if (!permiso_modulo) continue;
            await Permiso_modulo.update({
                permiso_modulo_status: 'A'
            }, { where: { grupo_usuario_id: body.grupo_usuario_id, modulo_id: permiso_modulo.modulo_id } });
        }

        // Crear los nuevos permisos a subvistas
        for (const permiso_subvista of permisos_subvistas_edit) {
            const [permiso_submodulo, crear] = await Permiso_submodulo.findOrCreate({
                where: { grupo_usuario_id: body.grupo_usuario_id, submodulo_id: permiso_subvista.submodulo_id },
                defaults: {
                    submodulo_id: permiso_subvista.submodulo_id,
                    grupo_usuario_id: body.grupo_usuario_id,
                    permiso_submodulo_status: 'A'
                }
            });

            if (!permiso_submodulo) continue;
            await Permiso_submodulo.update({
                permiso_submodulo_status: 'A'
            }, { where: { grupo_usuario_id: body.grupo_usuario_id, submodulo_id: permiso_submodulo.submodulo_id } });
        }

        res.status(200).send({ msg: '¡Cambios guardados!' });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

export const editar_permiso_accion_entidad = async (req, res, next) => {
    try {
        const { body } = req;
        const permisos_accion_entidad = JSON.parse(body.permisos_accion_entidad);

        const permisos_acciones_grupo_usuario = await Permiso_accion_entidad.findAll({
            where: {
                grupo_usuario_id: body.grupo_usuario_id,
                permiso_accion_entidad_status: 'A'
            }
        }); 

        for (const permiso_accion_entidad_encontrado of permisos_acciones_grupo_usuario) {
            const esta_permiso_accion_entidad = permisos_accion_entidad
                .some(permiso_accion_entidad => permiso_accion_entidad.cat_accion_id == permiso_accion_entidad_encontrado.cat_accion_id && permiso_accion_entidad.cat_entidad_id == permiso_accion_entidad_encontrado.cat_entidad_id); 
            
            if (esta_permiso_accion_entidad) {
                const indice_encontrado = permisos_accion_entidad
                    .findIndex(permiso_accion_entidad_e => permiso_accion_entidad_e.cat_accion_id == permiso_accion_entidad_encontrado.cat_accion_id && permiso_accion_entidad_e.cat_entidad_id == permiso_accion_entidad_encontrado.cat_entidad_id)   
                permisos_accion_entidad.splice(indice_encontrado, 1);
            } else {
                // Desactivar permiso
                await Permiso_accion_entidad.update({
                    permiso_accion_entidad_status: 'I'
                }, {
                    where: {
                        grupo_usuario_id: body.grupo_usuario_id,
                        cat_accion_id: permiso_accion_entidad_encontrado.cat_accion_id,
                        cat_entidad_id: permiso_accion_entidad_encontrado.cat_entidad_id
                    }
                });
            }
        }

        for (const permiso_accion_entidad_e of permisos_accion_entidad) {
            const [permiso_accion_entidad, crear] = await Permiso_accion_entidad.findOrCreate({
                where: {
                    grupo_usuario_id: body.grupo_usuario_id,
                    cat_accion_id: permiso_accion_entidad_e.cat_accion_id,
                    cat_entidad_id: permiso_accion_entidad_e.cat_entidad_id
                },
                defaults: {
                    cat_accion_id: permiso_accion_entidad_e.cat_accion_id,
                    cat_entidad_id: permiso_accion_entidad_e.cat_entidad_id,
                    grupo_usuario_id: body.grupo_usuario_id,
                    permiso_accion_entidad_status: 'A'
                }
            });

            if (!permiso_accion_entidad) continue;
            
            await Permiso_accion_entidad.update({
                permiso_accion_entidad_status: 'A'
            }, {
                where: {
                    cat_accion_id: permiso_accion_entidad_e.cat_accion_id,
                    cat_entidad_id: permiso_accion_entidad_e.cat_entidad_id,
                    grupo_usuario_id: body.grupo_usuario_id
                }
            });
        }

        res.status(200).send({ msg: '¡Cambios guardados!' });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}