import moment from "moment/moment.js";
import { connection_postgresql } from "../config/db_postgresql.js";
import { connection_sql_server } from "../config/db_sql_server.js";

// Schemas
import { dates_about_table, delete_rows_from_table, max_data_about_table, structure_table } from "../schemas/qr_selects_postgresql.js";
import { Mssql_db_cuautitlan_izcalli, Mssql_db_restAPI } from "../dbs_objects/dbs_objects_mssql.js";
import { Psql_db_cuautitlan_izcalli, Psql_db_naucalpan } from "../dbs_objects/dbs_objects_psql.js";
import { get_pagos_validos_by_idPlaza_idServicio_agua } from "../store_procedures/pagos_validos_mssql.js";
import { get_nombres_tablas_agua_naucalpan, obtener_nombres_tablas_naucalpan } from "../dbs_objects/methods_dbs_objects/methods_dbs_objects_psql.js";
import { get_fecha_max_captura_comercial_agua_nau, get_fecha_max_captura_domestio_agua_nau } from "../schemas/queries_naucalpan_psql.js";
import { get_fecha_max, get_id_max } from "../schemas/queries_global_psql.js";
import { get_cartas_invitaciones } from "../schemas/queries_restAPI_mssql.js";

export const vista_funciones_interno = async (req, res, next) => {
    try {
        const data = {
            base_url: process.env.BASE_URL
        };
        
        res.render("funciones/funciones_interno", data);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

export const vista_funciones_externo = async (req, res, next) => {
    try {
        const data = {
            base_url: process.env.BASE_URL
        };

        res.render("funciones/funciones_externo", data);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

export const get_catalogos = async (req, res, next) => {
    try {
        // Conecction SQL SERVER
        const data_connection = {
            nombre_db: process.env.SQL_SERVER_DB_CENTRAL
        };
        const connection = connection_sql_server(data_connection);
        await connection.authenticate();

        // Obtener catálogo de plazas
        const [plazas, metadata] = await connection.query(`
            SELECT * FROM plaza
            WHERE
                plaza.activo = 1 AND
                plaza.id_plaza NOT IN (3,5)
            ORDER BY plaza.nombre
        `);

        // Obtener catalogo de servicios
        const [servicios, ] = await connection.query(`
            SELECT * FROM servicio
            WHERE
                servicio.activo = 1 AND
                (
                    servicio.nombre LIKE '%predio%' OR
                    servicio.nombre LIKE '%agua%'
                )
            ORDER BY servicio.nombre;
        `);
        
        // Obtener catalogo de procesos
        const [procesos, ] = await connection.query(`
            SELECT * FROM proceso
            WHERE proceso.activo = 1 
            ORDER BY proceso.nombre;
        `);

        const data = {
            plazas: plazas,
            servicios: servicios,
            procesos: procesos
        };

        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

export const actualizar_adeudo_rezago = async (req, res, next) => {
    try {
        const { body } = req;
        
        const db_name_postgresql =
            body.plaza_id == '1' ? process.env.POSTGRESQL_DB_ZINACANTEPEC :
            body.plaza_id == '2' ? process.env.POSTGRESQL_DB_CIZCALLI :
            body.plaza_id == '4' ? process.env.POSTGRESQL_DB_NAUCALPAN : '';

        const table_name = body.servicio_id == 1
            ? process.env.SQL_SERVER_TABLE_REZ_AGUA
            : body.servicio_id == 2
                ? process.env.SQL_SERVER_TABLE_REZ_PREDIO
                : '';
        
        const data_connection = {
            nombre_db: process.env.SQL_SERVER_DB_API,
            db_name_postgresql: db_name_postgresql
        };

        // Conecction SQL SERVER
        const connection_msql = connection_sql_server(data_connection);
        await connection_msql.authenticate();

        // Conecction POSTGRESS
        const connection_postgresQL = connection_postgresql(data_connection);
        await connection_postgresQL.authenticate();

        // Obtener datos de Adeudo Rezago
        const [adeudos_rezago, metadata] = await connection_msql.query(`
            execute sp_getPadronRezagoByIdPlaza ${body.plaza_id}, ${body.servicio_id};
        `);

        if (adeudos_rezago.length < 1) {
            res.status(200).send({ msg: 'No hay datos para actualizar' });
            return;
        }

        /**
         * Ir generando el id autoincrement al insertar los datos en postgresql
        */
        let values_to_insert = [];
        const [id, ] = await connection_postgresQL.query(`SELECT MAX(id)+1 AS id FROM ${table_name}`);
        let id_count = id[0].id ? id[0].id: 1;

        for (const padron_agua_rezago of adeudos_rezago) {
            const fecha_corte_format = moment(padron_agua_rezago.fecha_corte).add(1, 'day').format('YYYY-MM-DD 00:00:00');
            const value_insert = `(${id_count}, '${padron_agua_rezago.cuenta}', '${padron_agua_rezago.clave_catastral}', '${padron_agua_rezago.propietario}','${padron_agua_rezago.tipo_servicio}', '${padron_agua_rezago.calle}', '${padron_agua_rezago.colonia}', '${padron_agua_rezago.poblacion}','${padron_agua_rezago.num_zona}', ${padron_agua_rezago.total}, '${fecha_corte_format}', ${padron_agua_rezago.latitud},${padron_agua_rezago.longitud})`;
            values_to_insert = [...values_to_insert, value_insert];
            id_count ++;
        }
        const values_to_insert_concat = values_to_insert.join(',');
        // Truncate table
        await connection_postgresQL.query(`TRUNCATE ${table_name};`);
        // Insertar los nuevos datos
        await connection_postgresQL.query(`
            INSERT INTO ${table_name}(id, cuenta, clave_catastral, propietario, tipo_servicio, calle, colonia, poblacion, zona, total, fecha_corte, latitud, longitud)
            VALUES ${values_to_insert_concat}
        `);

        // Agregar el camop geom a los datos insertados
        await connection_postgresQL.query(`update ${table_name} set geom = ST_SetSRID(ST_MakePoint(longitud, latitud), 4326) where latitud > 0`);

        // Cerrar conexiones a baases de datos
        await connection_msql.close();
        await connection_postgresQL.close();

        res.status(200).send({ msg: '¡Datos actualizados!' });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

const actualizar_carta_invitacion_izcalli = async body => {
    try {
        const db_name_postgresql = process.env.POSTGRESQL_DB_CIZCALLI;
        const data_connection = {
            db_name: process.env.SQL_SERVER_DB_API,
            db_name_postgresql: db_name_postgresql
        };

        // Conecction SQL SERVER
        const connection_msql = connection_sql_server(data_connection);
        await connection_msql.authenticate();
 
        // Conecction POSTGRESQL
        const connection_postgresQL = connection_postgresql(data_connection);
        await connection_postgresQL.authenticate();

        // Obtener datos de carta Invitacion
        const [registros_carta_invitacion, metadata] = await connection_msql.query(`
            execute sp_getRegistroCartaInvitacion ${body.plaza_id}, ${body.servicio_id}, '${body.fecha_inicio}', '${body.fecha_fin}';
        `);

        if (registros_carta_invitacion.length < 1) {
            return { msg: 'No hay datos para actualizar' };
        }

        /**
         * Selecciona las tablas ha actualizar datos
        */
        const table_name_domestica = body.servicio_id == 1
            ? process.env.SQL_SERVER_TABLE_CRT_INVITACION_DA
            : body.servicio_id == 2
                ? process.env.SQL_SERVER_TABLE_CRT_INVITACION_DP
                    : undefined;
        
        const table_name_comercial = body.servicio_id == 1
            ? process.env.SQL_SERVER_TABLE_CRT_INVITACION_CA
            : body.servicio_id == 2
                ? process.env.SQL_SERVER_TABLE_CRT_INVITACION_CP
                    : undefined;
        
        const table_name_industrial = body.servicio_id == 1
            ? undefined
            : body.servicio_id == 2
                ? process.env.SQL_SERVER_TABLE_CRT_INVITACION_IP
                    : undefined;

        /**
         * Seleccionar las fechas Máximas de dichas tablas en Postgresql
        */
        const max_data_table_domestico =  await connection_postgresQL.query(`
            SELECT
                MAX("fechaCaptura") AS max_fechaCaptura,
                MAX("id") AS max_id
            FROM ${table_name_domestica};`
        );
        
        const max_data_table_comercial =  await connection_postgresQL.query(`
            SELECT
                MAX("fechaCaptura") AS max_fechaCaptura,
                MAX("id") AS max_id
            FROM ${table_name_comercial};`
        );
        
        const max_data_table_industrial =
            table_name_industrial ?
                await connection_postgresQL.query(`
                    SELECT
                        MAX("fechaCaptura") AS max_fechaCaptura,
                        MAX("id") AS max_id
                    FROM ${table_name_industrial};`
                )
            : undefined;

        /**
         * Para Izcalli, agrupar los registros
         * por doméstico (media, popular, habitacional),
         * comercial e industrial
        */
        let values_to_insert_domestico = [],
            values_to_insert_comercial = [],
            values_to_insert_industrial = [];

        const fecha_captura_max_domestico = Date.parse(max_data_table_domestico[0][0].max_fechacaptura);
        const fecha_captura_max_comercial = Date.parse(max_data_table_comercial[0][0].max_fechacaptura);
        const fecha_captura_max_industrial = max_data_table_industrial ? Date.parse(max_data_table_industrial[0][0].max_fechacaptura) : undefined;

        const carta_invitacion_domestico = registros_carta_invitacion.filter(registro_carta_invitacion => {
            const fecha_captura_registro = Date.parse(registro_carta_invitacion.fechaCaptura);

            const tipo_servicio_padron = registro_carta_invitacion.tipo_servicio_padron.toLowerCase();
            
            const servicio_domestico_media = tipo_servicio_padron.includes('media');
            const servicio_domestico_popular = tipo_servicio_padron.includes('popular');
            const servicio_domestico_habitacional = tipo_servicio_padron.includes('habitacional');

            if (fecha_captura_registro > fecha_captura_max_domestico && (servicio_domestico_media || servicio_domestico_popular || servicio_domestico_habitacional)) {
                return registro_carta_invitacion;
            }
        });
        

        let id_domestico = max_data_table_domestico[0][0].max_id;

        for (const registro of carta_invitacion_domestico) {
            const fecha_corte_format = registro.fecha_corte ? moment(registro.fecha_corte).add(1, 'day').format('YYYY-MM-DD 00:00:00') : registro.fecha_corte;
            const value_insert = `(${id_domestico}, '${registro.cuenta}', '${registro.persona_atiende}', '${registro.tipo_servicio_padron}','${registro.tipo_servicio}', '${registro.giro}', ${registro.numero_niveles}, '${registro.color_fachada}','${registro.color_puerta}', '${registro.referencia}', '${registro.tipo_predio}', '${registro.entre_calle1}', '${registro.entre_calle2}', '${registro.observaciones}', '${registro.lecturaMedidor}', '${registro.gestor}', '${registro.fechaCaptura}', '${registro.servicio}', '${registro.estatus_predio}', ${registro.saldo_actual}, '${fecha_corte_format}', ${registro.latitud}, ${registro.longitud}, '${registro.Foto1}', '${registro.Foto2}', '${registro.Foto3}', '${registro.Foto4}', '${registro.Foto5}')`;
            values_to_insert_domestico = [...values_to_insert_domestico, value_insert];
            id_domestico ++;
        }        
        
        // const carta_invitacion_comercial 
        const carta_invitacion_comercial = registros_carta_invitacion.filter(registro_carta_invitacion => {
            const fecha_captura_registro = Date.parse(registro_carta_invitacion.fechaCaptura);

            const tipo_servicio_padron = registro_carta_invitacion.tipo_servicio_padron.toLowerCase();
            const servicio_comercial = tipo_servicio_padron.includes('comercial');

            if (fecha_captura_registro > fecha_captura_max_comercial  && servicio_comercial) {
                return registro_carta_invitacion;
            }
        });

        let id_comercial = max_data_table_comercial[0][0].max_id;
        for (const registro of carta_invitacion_comercial) {
            const fecha_corte_format = registro.fecha_corte ? moment(registro.fecha_corte).add(1, 'day').format('YYYY-MM-DD 00:00:00') : registro.fecha_corte;
            const value_insert = `(${id_domestico}, '${registro.cuenta}', '${registro.persona_atiende}', '${registro.tipo_servicio_padron}','${registro.tipo_servicio}', '${registro.giro}', ${registro.numero_niveles}, '${registro.color_fachada}','${registro.color_puerta}', '${registro.referencia}', '${registro.tipo_predio}', '${registro.entre_calle1}', '${registro.entre_calle2}', '${registro.observaciones}', '${registro.lecturaMedidor}', '${registro.gestor}', '${registro.fechaCaptura}', '${registro.servicio}', '${registro.estatus_predio}', ${registro.saldo_actual}, '${fecha_corte_format}', ${registro.latitud}, ${registro.longitud}, '${registro.Foto1}', '${registro.Foto2}', '${registro.Foto3}', '${registro.Foto4}', '${registro.Foto5}')`;
            values_to_insert_comercial = [...values_to_insert_comercial, value_insert];
            id_comercial ++;
        } 

        if (table_name_industrial) {
            // const carta_invitacion_industrial
            const carta_invitacion_industrial = registros_carta_invitacion.filter(registro_carta_invitacion => {
                const fecha_captura_registro = Date.parse(registro_carta_invitacion.fechaCaptura);
    
                const tipo_servicio_padron = registro_carta_invitacion.tipo_servicio_padron.toLowerCase();
                const servicio_industrial = tipo_servicio_padron.includes('industrial');
    
                if (fecha_captura_registro > fecha_captura_max_industrial && servicio_industrial) {
                    return registro_carta_invitacion;
                }
            });
    
            let id_industrial = max_data_table_industrial[0][0].max_id;
            for (const registro of carta_invitacion_industrial) {
                const fecha_corte_format = registro.fecha_corte ? moment(registro.fecha_corte).add(1, 'day').format('YYYY-MM-DD 00:00:00') : registro.fecha_corte;
                const value_insert = `(${id_domestico}, '${registro.cuenta}', '${registro.persona_atiende}', '${registro.tipo_servicio_padron}','${registro.tipo_servicio}', '${registro.giro}', ${registro.numero_niveles}, '${registro.color_fachada}','${registro.color_puerta}', '${registro.referencia}', '${registro.tipo_predio}', '${registro.entre_calle1}', '${registro.entre_calle2}', '${registro.observaciones}', '${registro.lecturaMedidor}', '${registro.gestor}', '${registro.fechaCaptura}', '${registro.servicio}', '${registro.estatus_predio}', ${registro.saldo_actual}, '${fecha_corte_format}', ${registro.latitud}, ${registro.longitud}, '${registro.Foto1}', '${registro.Foto2}', '${registro.Foto3}', '${registro.Foto4}', '${registro.Foto5}')`;
                values_to_insert_industrial = [...values_to_insert_industrial, value_insert];
                id_industrial ++;
            }
            
            /* await connection_postgresQL.query(`
                INSERT INTO ${table_name_industrial} (id, cuenta, persona_atiende, tipo_servicio_padron, tipo_servicio, giro, numero_niveles, color_fachada, color_puerta, referencia, tipo_predio, entre_calle1, entre_calle2, observaciones, "lecturaMedidor", gestor, "fechaCaptura", servicio, estatus_predio, saldo_actual, fecha_corte, latitud, longitud, "Foto1", "Foto2", "Foto3", "Foto4", "Foto5")
                VALUES ${values_to_insert_industrial.join(',')}
            `); */

            /* if (values_to_insert_industrial.length > 0) {
                await connection_postgresQL.query(`update ${table_name_industrial} set geom = ST_SetSRID(ST_MakePoint(longitud, latitud), 4326) where latitud > 0`);                
            } */

        }

        // Insert valores en las tablas
        if (values_to_insert_domestico.length > 0) {
            await connection_postgresQL.query(`
                INSERT INTO ${table_name_domestica} (id, cuenta, persona_atiende, tipo_servicio_padron, tipo_servicio, giro, numero_niveles, color_fachada, color_puerta, referencia, tipo_predio, entre_calle1, entre_calle2, observaciones, "lecturaMedidor", gestor, "fechaCaptura", servicio, estatus_predio, saldo_actual, fecha_corte, latitud, longitud, "Foto1", "Foto2", "Foto3", "Foto4", "Foto5")
                VALUES ${values_to_insert_domestico.join(',')}
            `);
        }

        if (values_to_insert_comercial.length > 0) {
            await connection_postgresQL.query(`
                INSERT INTO ${table_name_comercial} (id, cuenta, persona_atiende, tipo_servicio_padron, tipo_servicio, giro, numero_niveles, color_fachada, color_puerta, referencia, tipo_predio, entre_calle1, entre_calle2, observaciones, "lecturaMedidor", gestor, "fechaCaptura", servicio, estatus_predio, saldo_actual, fecha_corte, latitud, longitud, "Foto1", "Foto2", "Foto3", "Foto4", "Foto5")
                VALUES ${values_to_insert_comercial.join(',')}
            `);
        }

        await connection_postgresQL.query(`update ${table_name_domestica} set geom = ST_SetSRID(ST_MakePoint(longitud, latitud), 4326) where latitud > 0`);
        await connection_postgresQL.query(`update ${table_name_comercial} set geom = ST_SetSRID(ST_MakePoint(longitud, latitud), 4326) where latitud > 0`);

        // Cerrar conexiones a baases de datos
        await connection_msql.close();
        await connection_postgresQL.close();

        return { msg: '¡Datos actualizados!' };
    } catch (error) {
        console.log(error);
    }
}

const actualiza_carta_invitacion_naucalpan = async body => {
    try {
        /**
         * Obtener las tablas PSQL de la que se estarán actualizando datos
         * de cuerdo al id de servicio seleccionado.
        */
        const nombres_tablas = body.servicio_id == 1 ? obtener_nombres_tablas_naucalpan(get_nombres_tablas_agua_naucalpan) : '';

        /**
         * almacena los datos traidos del body, con el tipo de dato correspondiente,
         * ya q desde el fetch se pude alterar el tipo de dato
        */
        const data_dbs = {
            servicio_id: parseInt(body.servicio_id),
            plaza_id: parseInt(body.plaza_id),
            fecha_fin: body.fecha_fin,
            nombre_tabla_domestico: nombres_tablas.nombre_tabla_domestico,
            nombre_tabla_comercial: nombres_tablas.nombre_tabla_comercial
        };


        // Objetos de conección a bases de datos
        let coneccion_mssql_db_restAPI = Mssql_db_restAPI(data_dbs);
        let coneccion_psql_db_naucalpan = Psql_db_naucalpan(data_dbs);

        // coneccion a db restAPI SQL SERVER
        const coneccion_restAPI_obj = coneccion_mssql_db_restAPI.connection_sql_server();
        await coneccion_restAPI_obj
            .authenticate()
            .then(() => { console.log('--------------- Conección establecida con restAPI mssql') })
            .catch(error => { console.log(error) });

        // Conexion a DB de Naucalpan PSQL
        const coneccion_psql_naucalpan_obj = coneccion_psql_db_naucalpan.connection_postgresql();        
        await coneccion_psql_naucalpan_obj
            .authenticate()
            .then(() => { console.log('--------------- Conección establecidad con Naucalpan PSQL') })
            .catch(error => { console.log(error) });

        /**
         * Agregar a los objetos de bases de datos las conecciones de las mismas
        */
        coneccion_mssql_db_restAPI = Mssql_db_restAPI({...data_dbs, coneccion_db: coneccion_restAPI_obj });
        coneccion_psql_db_naucalpan = Psql_db_naucalpan({...data_dbs, coneccion_db: coneccion_psql_naucalpan_obj });

        /**
         * Obtener estructuras de las tablas,
         * ambas funciones (coneccion_psql_db_naucalpan.estructura_tabla_domestico() y
         * coneccion_psql_db_naucalpan.estructura_tabla_comercial(), se ejecutan al mismo tiempo
        */
        const [estructura_tabla_domestico, estructura_tabla_comercial] = await Promise.all([
            coneccion_psql_db_naucalpan.estructura_tabla_domestico(),
            coneccion_psql_db_naucalpan.estructura_tabla_comercial()
        ]);
        // Destructuring de algunos campos de las estructuras de las tablas doméstico y comercial
        const [columna_fcaptura_domes] = estructura_tabla_domestico.filter(columna => columna.ordinal_position == 17);
        const [columna_fcaptura_comer] = estructura_tabla_comercial.filter(columna => columna.ordinal_position == 17); 
        const [columna_id_domes] = estructura_tabla_domestico.filter(columna => columna.ordinal_position == 1);
        const [columna_id_comer] = estructura_tabla_comercial.filter(columna => columna.ordinal_position == 1); 


        /**
         * Obtener los insert into de las tablas de doméstico y comercial
        */
        const columns_name_structure_table_domestico = coneccion_psql_db_naucalpan.insert_into_columnas_nombre_domestico(estructura_tabla_domestico); 
        const columns_name_structure_table_comercial = coneccion_psql_db_naucalpan.insert_into_columnas_nombre_comercial(estructura_tabla_comercial);

        /**
         * Si body.fecha_fin >= fecha actual,
         * actualizar solo los datos de esa fecha actual
        */
        const fecha_actual = moment().format('YYYY-MM-DD');
        if (body.fecha_fin >= fecha_actual) {
            await Promise.all([
                coneccion_psql_db_naucalpan.eliminar_datos_fecha_actual_domestico({
                    fecha_actual: fecha_actual,
                    nombre_columna: columna_fcaptura_domes.column_name
                }),
                coneccion_psql_db_naucalpan.eliminar_datos_fecha_actual_comercial({
                    fecha_actual: fecha_actual,
                    nombre_columna: columna_fcaptura_comer.column_name
                })
            ]);
        }


        /**
         * Obtener los valores máximos y fecha_min_encontrada
        */
        const data_for_values_max = {
            nombre_columna_domestico_f: columna_fcaptura_domes.column_name,
            nombre_columna_comercial_f: columna_fcaptura_comer.column_name,
            nombre_columna_domestico_id: columna_id_domes.column_name,
            nombre_columna_comercial_id: columna_id_comer.column_name
        };
        const values_max = await coneccion_psql_db_naucalpan.get_valores_maximos_y_fmin_relacionada(data_for_values_max);

        // OBTENER LOS REGISTROS DE CARTA INVITACION
        const data_carta_invitacion = {
            coneccion_db: coneccion_restAPI_obj,
            plaza_id: data_dbs.plaza_id,
            servicio_id: data_dbs.servicio_id,
            fecha_inicio: values_max.fecha_min_encontrada,
            fecha_fin: data_dbs.fecha_fin
        };
        const cartas_invitaciones = await get_cartas_invitaciones(data_carta_invitacion);
        if (cartas_invitaciones.length < 1) {
            return { msg: 'No hay datos para actualizar' };
        }


        const data_tabla_domestico = {
            cartas_invitaciones: cartas_invitaciones,
            fecha_max_domestico: values_max.fecha_max_domestico,
            estructura_tabla_domestico: estructura_tabla_domestico,
            max_id_domestico: values_max.max_id_domestico,
            columns_name_structure_table_domestico: columns_name_structure_table_domestico,
            column_name_fecha_captura: columna_fcaptura_domes.column_name
        };
        const data_tabla_comercial = {
            cartas_invitaciones: cartas_invitaciones,
            fecha_max_comercial: values_max.fecha_max_comercial,
            estructura_tabla_comercial: estructura_tabla_comercial,
            max_id_comercial: values_max.max_id_comercial,
            columns_name_structure_table_comercial: columns_name_structure_table_comercial,
            column_name_fecha_captura: columna_fcaptura_comer.column_name
        };
        // Actualizar datos en tablas domestico y comercial al mismo tiempo
        await Promise.all([
            coneccion_psql_db_naucalpan.actualizar_registros_carta_invitacion_domestico(data_tabla_domestico),
            coneccion_psql_db_naucalpan.actualizar_registros_carta_invitacion_comercial(data_tabla_comercial)
        ]);
    
        // Cerrar conexiones a baases de datos
        await coneccion_restAPI_obj.close();
        await coneccion_psql_naucalpan_obj.close();

        return { msg: '¡Datos actualizados!' };
    } catch (error) {
        console.log(error);
    }
}

export const actualizar_carta_invitacion = async (req, res, next) => {
    try {
        const { body } = req;

        let result = '';
        if (body.plaza_id == 2) {
            result = await actualizar_carta_invitacion_izcalli(body);
        }

        if (body.plaza_id == 4) {
            result = await actualiza_carta_invitacion_naucalpan(body);
        }

        res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

const actualizar_datos_fecha_actual = async data => {
    try {
        const {
            connection_postgresQL,
            nombre_campo_fecha_pago_domestico,
            nombre_campo_fecha_pago_comercial,
            nombre_campo_fecha_pago_industrial,
            table_name_domestico,
            table_name_comercial,
            table_name_industrial,
            fecha_actual
        } = data;

        if (table_name_domestico) {
            const data_sql = {
                connection_postgresQL: connection_postgresQL,
                table_name: table_name_domestico,
                nombre_campo_fecha_pago: nombre_campo_fecha_pago_domestico,
                fecha_actual: fecha_actual
            };
            await delete_rows_from_table(data_sql);
        }

        if (table_name_comercial) {
            const data_sql = {
                connection_postgresQL: connection_postgresQL,
                table_name: table_name_domestico,
                nombre_campo_fecha_pago: nombre_campo_fecha_pago_comercial,
                fecha_actual: fecha_actual
            };
            await delete_rows_from_table(data_sql);
        }

        if (table_name_industrial) {
            const data_sql = {
                connection_postgresQL: connection_postgresQL,
                table_name: table_name_domestico,
                nombre_campo_fecha_pago: nombre_campo_fecha_pago_industrial,
                fecha_actual: fecha_actual
            };
            await delete_rows_from_table(data_sql);
        }
    } catch (error) {
        console.log(error);
    }
}

const actualizar_pagos_validos_izcalli = async body => {
    try {
        /**
         * almacena los datos traidos del body, con el tipo de dato correspondiente,
         * ya q desde el fetch se pude alterar el tipo de dato
        */
        const data_dbs = {
            servicio_id: parseInt(body.servicio_id),
            plaza_id: parseInt(body.plaza_id),
            dias: parseInt(body.dias),
            ids_procesos: body.ids_procesos,
            // fecha_inicio: body.fecha_inicio,
            fecha_fin: body.fecha_fin
        };

        // Objetos de conección a bases de datos
        let coneccion_mssql_db_restAPI = Mssql_db_restAPI(data_dbs);
        let coneccion_psql_db_cuautitlan_izcalli = Psql_db_cuautitlan_izcalli(data_dbs);
        let coneccion_mssql_db_cuautitlan_izcalli = Mssql_db_cuautitlan_izcalli(data_dbs);
        
        // coneccion a db restAPI SQL SERVER
        const coneccion_restAPI_obj = coneccion_mssql_db_restAPI.connection_sql_server();
        await coneccion_restAPI_obj
            .authenticate()
            .then(() => { console.log('--------------- Conección establecida con restAPI mssql') })
            .catch(error => { console.log(error) });

        // Conexion a DB de cuautitlán izcalli PSQL
        const coneccion_psql_cuautitlan_izcalli_obj = coneccion_psql_db_cuautitlan_izcalli.connection_postgresql();        
        await coneccion_psql_cuautitlan_izcalli_obj
            .authenticate()
            .then(() => { console.log('--------------- Conección establecidad con CIZCALLI PSQL') })
            .catch(error => { console.log(error) });
        
        // Conección a DB de cuautitlan izcalli MSSQL
        const coneccion_mssql_cuautitlan_izcalli_obj = coneccion_mssql_db_cuautitlan_izcalli.connection_sql_server();        
        await coneccion_mssql_cuautitlan_izcalli_obj
            .authenticate()
            .then(() => { console.log('--------------- Conección establcida con CIZCALLI MSSQL') })
            .catch(error => { console.log(error) });

        /**
         * Agregar a los objetos de coneccion, las conecciones de las bases de datos
        */
        coneccion_mssql_db_restAPI = Mssql_db_restAPI({...data_dbs, coneccion_db: coneccion_restAPI_obj });
        coneccion_mssql_db_cuautitlan_izcalli = Mssql_db_cuautitlan_izcalli({...data_dbs, coneccion_db: coneccion_mssql_cuautitlan_izcalli_obj});
        coneccion_psql_db_cuautitlan_izcalli = Psql_db_cuautitlan_izcalli({...data_dbs, coneccion_db: coneccion_psql_cuautitlan_izcalli_obj});

        // OBTENER PAGOS VALIDOS
        const pagos_validos = data_dbs.servicio_id == 1
            ? await coneccion_mssql_db_restAPI.get_pagos_validos_from_restAPI()
            : await coneccion_mssql_db_cuautitlan_izcalli.get_pagos_validos_from_cizcalli(); 
        console.log("pagos_validos -------------------------->", pagos_validos.length);


        /* const db_name_postgresql = process.env.POSTGRESQL_DB_CIZCALLI;
        const data_connection = {
            nombre_db: process.env.SQL_SERVER_DB_API,
            db_name_postgresql: db_name_postgresql
        };

        // Conecction SQL SERVER
        // const connection_mssql_db_restAPI = connection_sql_server(data_connection);
        await connection_mssql_db_restAPI.authenticate();
        
        // Conecction POSTGRESQL
        const connection_postgresQL = connection_postgresql(data_connection);
        await connection_postgresQL.authenticate();
        // console.log("connection_mssql_db_restAPI ---------------->", connection_mssql_db_restAPI);
        // console.log("connection_postgresQL ---------------->", connection_postgresQL); */











    //     // Obtener datos de carta Invitacion
    //     const [pagos_validos, metadata] = await connection_mssql_db_restAPI.query(`
    //         sp_getPagoValidoByIdPlazaIdServicio ${body.plaza_id}, ${body.servicio_id}, '1,2,3,4,5,6,7,8', 120, '${body.fecha_inicio}', '${body.fecha_fin}', 1;
    //     `);

    //     if (pagos_validos.length < 1) {
    //         return { msg: 'No hay datos para actualizar' };
    //     }

    //     /**
    //      * Selecciona las tablas ha actualizar datos
    //     */
    //     const table_name_domestico = body.servicio_id == 1
    //         ? process.env.SQL_SERVER_TABLE_PV_DA
    //         : body.servicio_id == 2
    //             ? undefined 
    //                 : undefined;
        
    //     const table_name_comercial = body.servicio_id == 1
    //         ? process.env.SQL_SERVER_TABLE_PV_CA
    //         : body.servicio_id == 2
    //             ?   undefined
    //                 : undefined;
        
    //     const table_name_industrial = body.servicio_id == 1
    //         ? undefined
    //         : body.servicio_id == 2
    //             ? process.env.SQL_SERVER_TABLE_PV_P
    //                 : undefined;

    //     let data_sql = {
    //         connection_postgresQL: connection_postgresQL,
    //         table_name: table_name_domestico
    //     };

    //     /**
    //      * Obtener las estructuras de las tablas PSQL
    //     */
    //     const estructura_table_domestico = table_name_domestico ? await structure_table(data_sql) : undefined;
    //     const nombre_campo_fecha_pago_domestico = table_name_domestico
    //         ? estructura_table_domestico.filter(campo_tabla => campo_tabla.ordinal_position == 17)[0].column_name : undefined;
    //     const nombre_campo_id_domestico = table_name_domestico
    //         ? estructura_table_domestico.filter(campo_tabla => campo_tabla.ordinal_position == 1)[0].column_name : undefined;


    //     data_sql = {...data_sql, table_name: table_name_comercial};
    //     const estructura_table_comercial = table_name_comercial ? await structure_table(data_sql): undefined;
    //     const nombre_campo_fecha_pago_comercial = table_name_comercial
    //         ? estructura_table_comercial.filter(campo_tabla => campo_tabla.ordinal_position == 17)[0].column_name : undefined;
    //     const nombre_campo_id_comercial = table_name_comercial
    //         ? estructura_table_comercial.filter(campo_tabla => campo_tabla.ordinal_position == 1)[0].column_name : undefined;


    //     data_sql = {...data_sql, table_name: table_name_industrial};
    //     const estructura_table_predio = table_name_industrial ? await structure_table(data_sql) : undefined;
    //     const nombre_campo_fecha_pago_industrial = table_name_industrial
    //         ? estructura_table_predio.filter(campo_tabla => campo_tabla.ordinal_position == 17)[0].column_name: undefined;


    //     const fecha_actual = moment().format('YYYY-MM-DD');
    //     /**
    //      * Valida que la ultima fecha de ingreso, si es la actual
    //      * entonces actualizar los datos en la tablas
    //     */
    //     if (fecha_actual == body.fecha_fin) {
    //         const data = {
    //             connection_postgresQL: connection_postgresQL,
    //             fecha_actual: fecha_actual,
    //             nombre_campo_fecha_pago_domestico: nombre_campo_fecha_pago_domestico,
    //             nombre_campo_fecha_pago_comercial: nombre_campo_fecha_pago_comercial,
    //             nombre_campo_fecha_pago_industrial: nombre_campo_fecha_pago_industrial,
    //             table_name_domestico: table_name_domestico,
    //             table_name_comercial: table_name_comercial,
    //             table_name_industrial: table_name_industrial
    //         };
    //         await actualizar_datos_fecha_actual(data);
    //     }

    //     /**
    //      * Obtener las fechas de pago, agrupadas por fecha_de_pago
    //      * de cada una de las tablas
    //     */
    //     data_sql =  {
    //         connection_postgresQL: connection_postgresQL,
    //         table_name: table_name_domestico,
    //         nombre_campo_fecha_pago: nombre_campo_fecha_pago_domestico
    //     };
    //     const dates_table_domestico = table_name_domestico ? await dates_about_table(data_sql) : undefined;

    //     data_sql =  {
    //         connection_postgresQL: connection_postgresQL,
    //         table_name: table_name_comercial,
    //         nombre_campo_fecha_pago: nombre_campo_fecha_pago_comercial
    //     };
    //     const dates_table_comercial = table_name_comercial ? await dates_about_table(data_sql) : undefined; 
        
    //     data_sql =  {
    //         connection_postgresQL: connection_postgresQL,
    //         table_name: table_name_industrial,
    //         nombre_campo_fecha_pago: nombre_campo_fecha_pago_industrial
    //     };
    //     const dates_table_preido = table_name_industrial ? await dates_about_table(data_sql): undefined;


    //     /**
    //      * Separar datos por pagos domesticos, comercial y de predio
    //     */
    //     const pagos_validos_domestico = pagos_validos.filter(registro_pago => {
    //         const fecha_pago = moment(registro_pago[nombre_campo_fecha_pago_domestico]).format('YYYY-MM-DD');

    //         const tipo_servicio = registro_pago.tipo_de_servicio.toLowerCase();
    //         const servicio_domestico_media = tipo_servicio.includes('media');
    //         const servicio_domestico_popular = tipo_servicio.includes('popular');
    //         const servicio_domestico_habitacional = tipo_servicio.includes('habitacional');

    //         const fechas = dates_table_domestico.filter(fecha_tabla => fecha_tabla[nombre_campo_fecha_pago_domestico] == fecha_pago);
    //         // const fechas = dates_table_domestico.filter(fecha_tabla => moment(fecha_tabla[nombre_campo_fecha_pago_domestico]).format('YYYY-MM-DD') == fecha_pago);
    //         if (fechas.length == 0 && (servicio_domestico_media || servicio_domestico_popular || servicio_domestico_habitacional)) {
    //             return registro_pago;
    //         }
    //     });
    //     const pagos_validos_comercial = pagos_validos.filter(registro_pago => {
    //         const fecha_pago = moment(registro_pago[nombre_campo_fecha_pago_comercial]).format('YYYY-MM-DD');

    //         const tipo_servicio = registro_pago.tipo_de_servicio.toLowerCase();
    //         const servicio_domestico_comercial = tipo_servicio.includes('comercial');

    //         const fechas = dates_table_comercial.filter(fecha_tabla => fecha_tabla[nombre_campo_fecha_pago_comercial] == fecha_pago);

    //         if (fechas.length == 0 && servicio_domestico_comercial) {
    //             return registro_pago;
    //         }
    //     });

    //     // const pagos_validos_predio

    //     /**
    //      * Obtener datos máximos de las tablas
    //     */
    //     data_sql = {
    //         connection_postgresQL: connection_postgresQL,
    //         table_name: table_name_domestico,
    //         field_fecha_captura: nombre_campo_fecha_pago_domestico,
    //         field_id: nombre_campo_id_domestico
    //     };
    //     const [max_data_table_domestico] = table_name_domestico ? await max_data_about_table(data_sql) : undefined;
    //     let max_id_table_domestico = parseInt(max_data_table_domestico.max_id) + 1;

    //     data_sql = {
    //         connection_postgresQL: connection_postgresQL,
    //         table_name: table_name_comercial,
    //         field_fecha_captura: nombre_campo_fecha_pago_comercial,
    //         field_id: nombre_campo_id_comercial
    //     };
    //     const [max_data_table_comercial] = table_name_comercial ? await max_data_about_table(data_sql) : undefined;
    //     let max_id_table_comercial = parseInt(max_data_table_domestico.max_id) + 1;


    //     /**
    //     * Crear los insert into columns de las tablas
    //    */
    //     let columns_name_structure_table_domestico = [],
    //         columns_name_structure_table_comercial = [],
    //         values_to_insert_domestico = [],
    //         values_to_insert_comercial = [];

    //     // Obtiene los nombres de los campos de la tabla domestico de manera dinámica
    //     for (const field  of estructura_table_domestico) {
    //         if (field.ordinal_position == 31) continue;
    //         columns_name_structure_table_domestico.push(`"${field.column_name}"`);
    //     }
        
    //     for (const field  of estructura_table_comercial) {
    //         if (field.ordinal_position == 31) continue;
    //         columns_name_structure_table_comercial.push(`"${field.column_name}"`);
    //     }


    //     /**
    //      * Crear el insert into values de las tablas
    //     */
    //     for (const registro of pagos_validos_domestico) {
    //         let row = [];

    //         for (const field of estructura_table_domestico) {
    //             if (field.ordinal_position == 1) {
    //                 row = [...row, max_id_table_domestico++];
    //                 continue;
    //             }

    //             if (field.ordinal_position == 31) continue;

    //             if (!registro[field.column_name]) {
    //                 row = [...row, 'NULL'];
    //                 continue;
    //             }

    //             if (field.ordinal_position == 17) {
    //                 const fecha_pago_format = moment(registro[field.column_name]).format('YYYY-MM-DD');
    //                 row = [...row, `'${fecha_pago_format}'`];
    //                 continue;
    //             }

    //             if (typeof registro[field.column_name] === 'string') {
    //                 row = [...row, `'${registro[field.column_name]}'`];
    //                 continue;
    //             }

    //             row = [...row, registro[field.column_name]];
    //         }

    //         values_to_insert_domestico = [...values_to_insert_domestico, `(${row.join(',')})`];
    //     } 
        
    //     for (const registro of pagos_validos_comercial) {
    //         let row = [];

    //         for (const field of estructura_table_comercial) {
    //             if (field.ordinal_position == 1) {
    //                 row = [...row, max_id_table_comercial++];
    //                 continue;
    //             }

    //             if (field.ordinal_position == 31) continue;

    //             if (!registro[field.column_name]) {
    //                 row = [...row, 'NULL'];
    //                 continue;
    //             }

    //             if (field.ordinal_position == 17) {
    //                 const fecha_pago_format = moment(registro[field.column_name]).format('YYYY-MM-DD');
    //                 row = [...row, `'${fecha_pago_format}'`];
    //                 continue;
    //             }

    //             if (typeof registro[field.column_name] === 'string') {
    //                 row = [...row, `'${registro[field.column_name]}'`];
    //                 continue;
    //             }

    //             row = [...row, registro[field.column_name]];
    //         }

    //         values_to_insert_comercial = [...values_to_insert_comercial, `(${row.join(',')})`];
    //     }


    //     /**
    //      * Insertar datos en la db PSQL
    //     */
    //     if (values_to_insert_domestico.length < 0) {
    //         await connection_postgresQL.query(`
    //             INSERT INTO ${table_name_domestico} (${columns_name_structure_table_domestico.join(',')})
    //             VALUES ${values_to_insert_domestico.join(',')}
    //         `);
    //     }

    //     if (values_to_insert_comercial.length < 0) {
    //         await connection_postgresQL.query(`
    //             INSERT INTO ${table_name_comercial} (${columns_name_structure_table_comercial.join(',')})
    //             VALUES ${values_to_insert_comercial.join(',')}
    //         `);
    //     }

    //     // Agregar el campo geom a los datos previamente insertados en postgresql
    //     await connection_postgresQL.query(`update ${table_name_domestico} set geom = ST_SetSRID(ST_MakePoint(longitud, latitud), 4326) where latitud > 0`);
    //     await connection_postgresQL.query(`update ${table_name_comercial} set geom = ST_SetSRID(ST_MakePoint(longitud, latitud), 4326) where latitud > 0`);
        

    //     // Cerrar conexiones a baases de datos
    //     await connection_mssql_db_restAPI.close();
    //     await connection_postgresQL.close();

    //     return { msg: '¡Datos actualizados!' };

    } catch (error) {
        console.log(error);
    }
}

export const actualizar_pagos_validos_izcalli_c = async (req, res, next) => {
    try {
        const db_name_postgresql = process.env.POSTGRESQL_DB_CIZCALLI;
        const data_connection = {
            nombre_db: process.env.SQL_SERVER_DB_API,
            db_name_postgresql: db_name_postgresql
        };

        // Conecction SQL SERVER
        const connection_mssql_db_restAPI = connection_sql_server(data_connection);
        await connection_mssql_db_restAPI.authenticate();
        
        // Conecction POSTGRESQL
        const connection_postgresQL = connection_postgresql(data_connection);
        await connection_postgresQL.authenticate();

        // Obtener datos de carta Invitacion
        const [pagos_validos, metadata] = await connection_mssql_db_restAPI.query(`
            sp_getPagoValidoByIdPlazaIdServicio 2, 1, '1,2,3,4,5,6,7,8', 120, '2023-02-01', '2023-08-22', 1;
        `);

        if (pagos_validos.length < 1) {
            return { msg: 'No hay datos para actualizar' };
        }

        /**
         * Selecciona las tablas ha actualizar datos
        */
        const table_name_domestico = 1 == 1
            ? process.env.SQL_SERVER_TABLE_PV_DA
            : 1 == 2
                ? undefined 
                    : undefined;
        
        const table_name_comercial = 1 == 1
            ? process.env.SQL_SERVER_TABLE_PV_CA
            : 1 == 2
                ?   undefined
                    : undefined;
        
        const table_name_industrial = 1 == 1
            ? undefined
            : 1 == 2
                ? process.env.SQL_SERVER_TABLE_PV_P
                    : undefined;

        let data_sql = {
            connection_postgresQL: connection_postgresQL,
            table_name: table_name_domestico
        };

        /**
         * Obtener las estructuras de las tablas PSQL
        */
        const estructura_table_domestico = table_name_domestico ? await structure_table(data_sql) : undefined;
        const nombre_campo_fecha_pago_domestico = table_name_domestico
            ? estructura_table_domestico.filter(campo_tabla => campo_tabla.ordinal_position == 17)[0].column_name : undefined;
        const nombre_campo_id_domestico = table_name_domestico
            ? estructura_table_domestico.filter(campo_tabla => campo_tabla.ordinal_position == 1)[0].column_name : undefined;


        data_sql = {...data_sql, table_name: table_name_comercial};
        const estructura_table_comercial = table_name_comercial ? await structure_table(data_sql): undefined;
        const nombre_campo_fecha_pago_comercial = table_name_comercial
            ? estructura_table_comercial.filter(campo_tabla => campo_tabla.ordinal_position == 17)[0].column_name : undefined;
        const nombre_campo_id_comercial = table_name_comercial
            ? estructura_table_comercial.filter(campo_tabla => campo_tabla.ordinal_position == 1)[0].column_name : undefined;


        data_sql = {...data_sql, table_name: table_name_industrial};
        const estructura_table_predio = table_name_industrial ? await structure_table(data_sql) : undefined;
        const nombre_campo_fecha_pago_industrial = table_name_industrial
            ? estructura_table_predio.filter(campo_tabla => campo_tabla.ordinal_position == 17)[0].column_name: undefined;


        const fecha_actual = moment().format('YYYY-MM-DD');
        /**
         * Valida que la ultima fecha de ingreso, si es la actual
         * entonces actualizar los datos en la tablas
        */
        if (fecha_actual == '2023-08-22') {
            const data = {
                connection_postgresQL: connection_postgresQL,
                fecha_actual: fecha_actual,
                nombre_campo_fecha_pago_domestico: nombre_campo_fecha_pago_domestico,
                nombre_campo_fecha_pago_comercial: nombre_campo_fecha_pago_comercial,
                nombre_campo_fecha_pago_industrial: nombre_campo_fecha_pago_industrial,
                table_name_domestico: table_name_domestico,
                table_name_comercial: table_name_comercial,
                table_name_industrial: table_name_industrial
            };
            await actualizar_datos_fecha_actual(data);
        }

        /**
         * Obtener las fechas de pago, agrupadas por fecha_de_pago
         * de cada una de las tablas
        */
        data_sql =  {
            connection_postgresQL: connection_postgresQL,
            table_name: table_name_domestico,
            nombre_campo_fecha_pago: nombre_campo_fecha_pago_domestico
        };
        const dates_table_domestico = table_name_domestico ? await dates_about_table(data_sql) : undefined;

        data_sql =  {
            connection_postgresQL: connection_postgresQL,
            table_name: table_name_comercial,
            nombre_campo_fecha_pago: nombre_campo_fecha_pago_comercial
        };
        const dates_table_comercial = table_name_comercial ? await dates_about_table(data_sql) : undefined; 
        
        data_sql =  {
            connection_postgresQL: connection_postgresQL,
            table_name: table_name_industrial,
            nombre_campo_fecha_pago: nombre_campo_fecha_pago_industrial
        };
        const dates_table_preido = table_name_industrial ? await dates_about_table(data_sql): undefined;


        /**
         * Separar datos por pagos domesticos, comercial y de predio
        */
        const pagos_validos_domestico = pagos_validos.filter(registro_pago => {
            const fecha_pago = moment(registro_pago[nombre_campo_fecha_pago_domestico]).format('YYYY-MM-DD');

            const tipo_servicio = registro_pago.tipo_de_servicio.toLowerCase();
            const servicio_domestico_media = tipo_servicio.includes('media');
            const servicio_domestico_popular = tipo_servicio.includes('popular');
            const servicio_domestico_habitacional = tipo_servicio.includes('habitacional');

            const fechas = dates_table_domestico.filter(fecha_tabla => fecha_tabla[nombre_campo_fecha_pago_domestico] == fecha_pago);
            // const fechas = dates_table_domestico.filter(fecha_tabla => moment(fecha_tabla[nombre_campo_fecha_pago_domestico]).format('YYYY-MM-DD') == fecha_pago);
            if (fechas.length == 0 && (servicio_domestico_media || servicio_domestico_popular || servicio_domestico_habitacional)) {
                return registro_pago;
            }
        });
        const pagos_validos_comercial = pagos_validos.filter(registro_pago => {
            const fecha_pago = moment(registro_pago[nombre_campo_fecha_pago_comercial]).format('YYYY-MM-DD');

            const tipo_servicio = registro_pago.tipo_de_servicio.toLowerCase();
            const servicio_domestico_comercial = tipo_servicio.includes('comercial');

            const fechas = dates_table_comercial.filter(fecha_tabla => fecha_tabla[nombre_campo_fecha_pago_comercial] == fecha_pago);

            if (fechas.length == 0 && servicio_domestico_comercial) {
                return registro_pago;
            }
        });

        // const pagos_validos_predio

        /**
         * Obtener datos máximos de las tablas
        */
        data_sql = {
            connection_postgresQL: connection_postgresQL,
            table_name: table_name_domestico,
            field_fecha_captura: nombre_campo_fecha_pago_domestico,
            field_id: nombre_campo_id_domestico
        };
        const [max_data_table_domestico] = table_name_domestico ? await max_data_about_table(data_sql) : undefined;
        let max_id_table_domestico = parseInt(max_data_table_domestico.max_id) + 1;

        data_sql = {
            connection_postgresQL: connection_postgresQL,
            table_name: table_name_comercial,
            field_fecha_captura: nombre_campo_fecha_pago_comercial,
            field_id: nombre_campo_id_comercial
        };
        const [max_data_table_comercial] = table_name_comercial ? await max_data_about_table(data_sql) : undefined;
        let max_id_table_comercial = parseInt(max_data_table_domestico.max_id) + 1;


        /**
        * Crear los insert into columns de las tablas
       */
        let columns_name_structure_table_domestico = [],
            columns_name_structure_table_comercial = [],
            values_to_insert_domestico = [],
            values_to_insert_comercial = [];

        // Obtiene los nombres de los campos de la tabla domestico de manera dinámica
        for (const field  of estructura_table_domestico) {
            if (field.ordinal_position == 31) continue;
            columns_name_structure_table_domestico.push(`"${field.column_name}"`);
        }
        
        for (const field  of estructura_table_comercial) {
            if (field.ordinal_position == 31) continue;
            columns_name_structure_table_comercial.push(`"${field.column_name}"`);
        }


        /**
         * Crear el insert into values de las tablas
        */
        for (const registro of pagos_validos_domestico) {
            let row = [];

            for (const field of estructura_table_domestico) {
                if (field.ordinal_position == 1) {
                    row = [...row, max_id_table_domestico++];
                    continue;
                }

                if (field.ordinal_position == 31) continue;

                if (!registro[field.column_name]) {
                    row = [...row, 'NULL'];
                    continue;
                }

                if (field.ordinal_position == 17) {
                    const fecha_pago_format = moment(registro[field.column_name]).format('YYYY-MM-DD');
                    row = [...row, `'${fecha_pago_format}'`];
                    continue;
                }

                if (typeof registro[field.column_name] === 'string') {
                    row = [...row, `'${registro[field.column_name]}'`];
                    continue;
                }

                row = [...row, registro[field.column_name]];
            }

            values_to_insert_domestico = [...values_to_insert_domestico, `(${row.join(',')})`];
        } 
        
        for (const registro of pagos_validos_comercial) {
            let row = [];

            for (const field of estructura_table_comercial) {
                if (field.ordinal_position == 1) {
                    row = [...row, max_id_table_comercial++];
                    continue;
                }

                if (field.ordinal_position == 31) continue;

                if (!registro[field.column_name]) {
                    row = [...row, 'NULL'];
                    continue;
                }

                if (field.ordinal_position == 17) {
                    const fecha_pago_format = moment(registro[field.column_name]).format('YYYY-MM-DD');
                    row = [...row, `'${fecha_pago_format}'`];
                    continue;
                }

                if (typeof registro[field.column_name] === 'string') {
                    row = [...row, `'${registro[field.column_name]}'`];
                    continue;
                }

                row = [...row, registro[field.column_name]];
            }

            values_to_insert_comercial = [...values_to_insert_comercial, `(${row.join(',')})`];
        }


        /**
         * Insertar datos en la db PSQL
        */
        if (values_to_insert_domestico.length < 0) {
            await connection_postgresQL.query(`
                INSERT INTO ${table_name_domestico} (${columns_name_structure_table_domestico.join(',')})
                VALUES ${values_to_insert_domestico.join(',')}
            `);
        }

        if (values_to_insert_comercial.length < 0) {
            await connection_postgresQL.query(`
                INSERT INTO ${table_name_comercial} (${columns_name_structure_table_comercial.join(',')})
                VALUES ${values_to_insert_comercial.join(',')}
            `);
        }

        // Agregar el campo geom a los datos previamente insertados en postgresql
        await connection_postgresQL.query(`update ${table_name_domestico} set geom = ST_SetSRID(ST_MakePoint(longitud, latitud), 4326) where latitud > 0`);
        await connection_postgresQL.query(`update ${table_name_comercial} set geom = ST_SetSRID(ST_MakePoint(longitud, latitud), 4326) where latitud > 0`);
        

        // Cerrar conexiones a baases de datos
        await connection_mssql_db_restAPI.close();
        await connection_postgresQL.close();

        // return { msg: '¡Datos actualizados!' };
        res.json({ msg: "Datos actualizados" })
        // console.log("DONE");
    } catch (error) {
        console.log(error);
    }
}

export const actualizar_pagos_validos = async (req, res, next) => {
    try {
        const { body } = req;
        let result = '';
        if (body.plaza_id == 2) {
            result = await actualizar_pagos_validos_izcalli(body);
            // result = await actualizar_pagos_validos_izcalli_c(body);
        }

        /**
         * construir if para otras plazas, en caso de q tengan pagos válidos
        */

        res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

export const actualizar_datos_funciones = () => {
    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< ACTUALIZAR DATOS FUNCIONES >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
}