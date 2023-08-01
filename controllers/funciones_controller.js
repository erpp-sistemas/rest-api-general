import moment from "moment/moment.js";
import { connection_postgresql } from "../config/db_postgresql.js";
import { connection_sql_server } from "../config/db_sql_server.js";

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
            res.status(200).send({ msg_data_not_current: 'No hay datos por actualizar' });
            // intentalo más tarde
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