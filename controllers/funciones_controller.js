import moment from "moment/moment.js";
import { connection_postgresql } from "../config/db_postgresql.js";
import { connection_sql_server } from "../config/db_sql_server.js";

// Schemas
import { max_data_about_table, structure_table } from "../public/schemas/qr_selects_postgresql.js";

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
            db_name: process.env.SQL_SERVER_DB_CENTRAL
        };
        const connection = connection_sql_server(data_connection);
        await connection.authenticate();

        // Obtener catálogo de plazas
        const [plazas, metadata] = await connection.query(`
            SELECT * FROM plaza
            WHERE
                plaza.activo = 1 AND
                plaza.nombre != 'Demo'
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

        const data = {
            plazas: plazas,
            servicios: servicios
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
            db_name: process.env.SQL_SERVER_DB_API,
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

const actualizar_carta_invitacion_naucalpan = async body => {
    try {
        // Conección a la DB de Naucalpan
        const db_name_postgresql = process.env.POSTGRESQL_DB_NAUCALPAN;
        // Conexión a la db resApi de MSSQL y a la db de postgresql
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

        // Si no hay registros, retorna el siguiente mensaje
        if (registros_carta_invitacion.length < 1) {
            return { msg: 'No hay datos para actualizar' };
        }

        // Selecciona las tablas ha actualizar
        const table_name_domestico = body.servicio_id == 1
            ? process.env.SQL_SERVER_TABLE_CRT_INVITACION_DA
            : body.servicio_id == 2
                ? process.env.SQL_SERVER_TABLE_CRT_INVITACION_DP
                    : undefined;
        
        const table_name_comercial = body.servicio_id == 1
            ? process.env.SQL_SERVER_TABLE_CRT_INVITACION_CA
            : body.servicio_id == 2
                ? process.env.SQL_SERVER_TABLE_CRT_INVITACION_CP
                    : undefined;
        
        /**
         * Obtener los campos de cada una de las tablas a actualizar
        */
        let data_connection_postgresql = {
            table_name: table_name_domestico,
            connection_postgresQL: connection_postgresQL
        }
        // Campos de la tabla doméstico en postgresql
        const fields_table_domestico = await structure_table(data_connection_postgresql);
        data_connection_postgresql = { ...data_connection_postgresql, table_name: table_name_comercial };     
        // Campos de la tabla comercial en postgresql
        const fields_table_comercial = await structure_table(data_connection_postgresql);

        // DESTRUCTURING DE LOS CAMPOS de las tabals de postgresql
        const [fecha_captura_table_domestico] = fields_table_domestico.filter(field => field.ordinal_position == 17);
        const [id_table_domestico] = fields_table_domestico.filter(field => field.ordinal_position == 1);
        const [fecha_captura_table_comercial] = fields_table_comercial.filter(field => field.ordinal_position == 17);
        const [id_table_comercial] = fields_table_domestico.filter(field => field.ordinal_position == 1);        

        /**
         * Seleccionar las fechas Máximas de dichas tablas en Postgresql
        */
        data_connection_postgresql = {
            ...data_connection_postgresql,
            table_name: table_name_domestico,
            field_fecha_captura: fecha_captura_table_domestico.column_name,
            field_id: id_table_domestico.column_name,
        };                  
        const [max_data_table_domestico] = await max_data_about_table(data_connection_postgresql);
        const max_date_table_domestico = Date.parse(max_data_table_domestico.max_fecha_captura); 
        // let max_id_table_domestico = parseInt(max_data_table_domestico.max_id) + 1;
        let max_id_table_domestico = 1;

    
        data_connection_postgresql = {
            ...data_connection_postgresql,
            table_name: table_name_comercial,
            field_fecha_captura: fecha_captura_table_comercial.column_name,
            field_id: id_table_comercial.column_name,
        };                  
        const [max_data_table_comercial] = await max_data_about_table(data_connection_postgresql);
        const max_date_table_comercial = Date.parse(max_data_table_comercial.max_fecha_captura); 
        // let max_id_table_comercial = parseInt(max_data_table_comercial.max_id) + 1;
        let max_id_table_comercial = 1;

        const registros_carta_invitacion_domestico = registros_carta_invitacion.filter(registro => {
            const servicio_padron_comercial = registro.tipo_servicio_padron.toLowerCase().includes('comercial');
            const servicio_padron_equipamiento = registro.tipo_servicio_padron.toLowerCase().includes('equipamiento');
            const servicio_padron_industrial = registro.tipo_servicio_padron.toLowerCase().includes('industrial');
            // const fecha_captura_registro = Date.parse(registro[`${fecha_captura_table_domestico.column_name}`]);

            if (!servicio_padron_comercial && !servicio_padron_equipamiento && !servicio_padron_industrial) {
                return registro;
            }
            /* if (fecha_captura_registro > max_date_table_domestico & !servicio_padron_comercial && !servicio_padron_equipamiento && !servicio_padron_industrial) {
                return registro;
            } */
        }); 

        // Datos a insertar en la tabla carta invitación comercial de postgresql
        const registros_carta_invitacion_comercial = registros_carta_invitacion.filter(registro => {
            // const fecha_captura_registro = Date.parse(registro[`${fecha_captura_table_comercial.column_name}`]);
            const servicio_padron_comercial = registro.tipo_servicio_padron.toLowerCase().includes('comercial');
            
            if (servicio_padron_comercial) {
                return registro;
            }
            /* if (fecha_captura_registro > max_date_table_comercial && servicio_padron_comercial) {
                return registro;
            } */
        });

        let values_to_insert_domestico = [],
            values_to_insert_comercial = [];

        //Obtener los registros a insertar en la tabla de domestico de Naucalpan
        for (const registro of registros_carta_invitacion_domestico) {
            let row = [];

            for (const field of fields_table_domestico) {
                if (field.ordinal_position == 1) {
                    row = [...row, max_id_table_domestico++];
                    continue;
                }

                if (field.ordinal_position == 29) continue;

                if (!registro[field.column_name]) {
                    row = [...row, 'NULL'];
                    continue;
                }

                if (field.ordinal_position == 21) {
                    const fecha_corte_format = moment(registro[field.column_name]).add(1, 'day').format('YYYY-MM-DD 00:00:00');
                    row = [...row, `'${fecha_corte_format}'`];
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

        //Obtener los registros a insertar en la tabla de comercial de Naucalpan
        for (const registro of registros_carta_invitacion_comercial) {
            let row = [];
            for (const field of fields_table_comercial) {
                if (field.ordinal_position == 1) {
                    row = [...row, max_id_table_comercial++];
                    continue;
                }

                if (field.ordinal_position == 29) continue;

                if (!registro[field.column_name]) {
                    row = [...row, 'NULL'];
                    continue;
                }

                if (field.ordinal_position == 21) {
                    const fecha_corte_format = moment(registro[field.column_name]).add(1, 'day').format('YYYY-MM-DD 00:00:00');
                    row = [...row, `'${fecha_corte_format}'`];
                    continue;
                }

                if (typeof registro[field.column_name] === 'string') {
                    row = [...row, `'${registro[field.column_name]}'`];
                    continue;
                }
                
                row = [...row, registro[`${field.column_name}`]];
            }

            values_to_insert_comercial = [...values_to_insert_comercial, `(${row.join(',')})`];
        }

        /**
         * Ingresar @values_to_insert_domestico y @values_to_insert_comercial
         * a sus tablas correspondientes en postgresql 
        */
        let columns_name_structure_table_domestico = [],
            columns_name_structure_table_comercial = [];
        // Obtiene los nombres de los campos de la tabla domestico de manera dinámica
        for (const field  of fields_table_domestico) {
            if (field.ordinal_position == 29) continue;
            columns_name_structure_table_domestico.push(`"${field.column_name}"`);
        }

        // Obtiene los nombres de los campos de la tabla comercial de manera dinámica        
        for (const field  of fields_table_comercial) {
            if (field.ordinal_position == 29) continue;
            columns_name_structure_table_comercial.push(`"${field.column_name}"`);
        }

        await connection_postgresQL.query(`
            INSERT INTO ${table_name_domestico} (${columns_name_structure_table_domestico.join(',')})
            VALUES ${values_to_insert_domestico.join(',')}
        `);

        await connection_postgresQL.query(`
            INSERT INTO ${table_name_comercial} (${columns_name_structure_table_comercial.join(',')})
            VALUES ${values_to_insert_comercial.join(',')}
        `);

        // Agregar el campo geom a los datos previamente insertados en postgresql
        await connection_postgresQL.query(`update ${table_name_domestico} set geom = ST_SetSRID(ST_MakePoint(longitud, latitud), 4326) where latitud > 0`);
        await connection_postgresQL.query(`update ${table_name_comercial} set geom = ST_SetSRID(ST_MakePoint(longitud, latitud), 4326) where latitud > 0`);
        

        // Cerrar conexiones a baases de datos
        await connection_msql.close();
        await connection_postgresQL.close();

        return { msg: '¡Datos actualizados!' };
    } catch (error) {
        console.log(error);
        return error;
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
            result = await actualizar_carta_invitacion_naucalpan(body);
        }

        res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}