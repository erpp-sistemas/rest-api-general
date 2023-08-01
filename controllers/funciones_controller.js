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


        
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}