import bcrypt from 'bcrypt';
import { obtener_hora_local } from "../helpers/fechas.js";
import { Grupo_usuario } from "../models/Grupo_usuario.js";
import { Usuario, get_datos_usuario, lista_usuarios_activos } from "../models/Usuario.js";

export const vista_usuarios = async (req, res, next) => {
    try {
        const cat_grupos_usuario = await Grupo_usuario.findAll({ where: { grupo_usuario_status: 'A' } });
        const data = {
            base_url: process.env.BASE_URL,
            cat_grupos_usuario: cat_grupos_usuario
        };
        res.render("usuarios/usuarios", data);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

export const get_registros_usuarios = async (req, res, next) => {
    try {
        const { body } = req;
        const pagina_actual = parseInt(body.pagina);
    
        /**
         * @const paginas_a_mostrar almacena el número de páginas
         * que se debe visualizar en la paginación.
        */
        const paginas_a_mostrar = 3;
        /**
            * @const pasos_retroceder almacena el número de pasos a retroceder
            * para obtener el límite inferior de la paginación.
        */
        const pasos_retroceder = 2;
        const registros_por_pagina = 8;
        const total_usuarios = await Usuario.count({ where: { usuario_status: 'A' } });
        const total_paginas = Math.ceil(parseFloat(total_usuarios) / registros_por_pagina);
       
        const indice_pagina = (pagina_actual * registros_por_pagina) - registros_por_pagina;

        const data_paginacion = { indice_pagina, registros_por_pagina };
        const usuarios = await lista_usuarios_activos(data_paginacion);

        /**
         * Obtener límite inferior y superior
        */
        let limite_superior = pagina_actual;
        let limite_inferior = 0;
        
        while ( limite_superior % paginas_a_mostrar != 0 ) { limite_superior ++ };

        limite_inferior = parseFloat(limite_superior) - pasos_retroceder;
        limite_superior = total_paginas < limite_superior ? total_paginas : limite_superior;
        
        const data = {
            usuarios,
            pagina_actual,
            total_paginas,
            limite_inferior,
            limite_superior
        };

        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

export const nuevo_usuario = async (req, res, next) => {
    try {
        const { body } = req;

        // Validar si el nombre de usuario ya existe en la DB
        const user = await Usuario.findOne({ where: { usuario_nombre_usuario: body.usuario_nombre_usuario, usuario_status: 'A' } });
        if (user) {
            res.status(400).send({ error: 'El usuario ya está registrado en el sistema. Intente con otro.' });
            return;
        }

        const fecha = obtener_hora_local();

        // Encriptar password
        const salt_rounds = 10;
        const password_crypt = await bcrypt.hash(body.usuario_password, salt_rounds);

        await Usuario.create({
            usuario_nombre_usuario: body.usuario_nombre_usuario,
            usuario_nombre: body.usuario_nombre,
            usuario_apellidos: body.usuario_apellidos,
            usuario_cargo: body.usuario_cargo,
            usuario_direccion: body.usuario_direccion,
            usuario_email: body.usuario_email,
            usuario_password: password_crypt,
            grupo_usuario_id: body.grupo_usuario_id,
            usuario_fecha_creacion: fecha,
            usuario_fecha_modificacion: fecha,
            usuario_status: 'A'
        });

        res.status(201).send({ msg: 'Nuevo usuario' });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

export const obtener_datos_usuario = async (req, res, next) => {
    try {
        const { body } = req;
        const data_body = { usuario_id: body.usuario_id };
        const usuario = await get_datos_usuario(data_body);
        const data = { usuario };
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

export const editar_usuario = async (req, res, next) => {
    try {
        const { body } = req;
        // Validar si el nombre de usuario ya existe en la DB
        const usuario = await Usuario.findOne({ where: { usuario_nombre_usuario: body.usuario_nombre_usuario, usuario_status: 'A' } });
        if (usuario && usuario.usuario_id != body.usuario_id) {
            res.status(400).send({ error: 'El usuario ya está registrado en el sistema. Intente con otro.' });
            return;
        }

        const fecha = obtener_hora_local();
        let datos_usuario = {
            usuario_nombre_usuario: body.usuario_nombre_usuario,
            usuario_nombre: body.usuario_nombre,
            usuario_apellidos: body.usuario_apellidos,
            usuario_cargo: body.usuario_cargo,
            usuario_direccion: body.usuario_direccion,
            usuario_email: body.usuario_email,
            grupo_usuario_id: body.grupo_usuario_id,
            usuario_fecha_modificacion: fecha
        };

        // Comprueba si la contraseña se va actualizar
        if (body.usuario_password != '') {
            // Encriptar password
            const salt_rounds = 10;
            const password_crypt = await bcrypt.hash(body.usuario_password, salt_rounds);
            datos_usuario = { ...datos_usuario, usuario_password: password_crypt };
        }

        await Usuario.update(datos_usuario, { where: { usuario_id: body.usuario_id } });
        res.status(200).send({ msg: '¡Cambios guardados!' });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

export const eliminar_usuario = async (req, res, next) => {
    try {
        const { body } = req;
        await Usuario.update({
            usuario_status: 'I'
        }, { where: { usuario_id: body.usuario_id } });

        res.status(200).send({ msg: '¡Eliminado!' });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}