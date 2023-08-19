import { Sequelize } from "sequelize";
import {} from "dotenv/config";


/**
 * ================================================================================================================================
 *                              Aquí se definen todos los métodos que pueden compartir las clases de las db´s de SQL SERVER
 * ================================================================================================================================ 
*/

/**
 * @autor David Demetrio López Paz
 * @fecha_creacion 18 de Agosto del 2023
 * @definición conección a una db de SQL SERVER
 * @param info
*/
const coneccion_db_mssql = info => ({
    connection_sql_server() {
        const connection = new Sequelize(info.nombre_db, process.env.SQL_SERVER_USER, process.env.SQL_SERVER_PASSWORD, {
            host: process.env.SQL_SERVER_IP,
            dialect: 'mssql',
            dialectOptions: {
                requestTimeout: 10000000
            },
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            options: {
                instanceName: 'SQLEXPRESS',
                encrypt: false,
                trustServerCertificate: true,
                requestTimeout: 10000000
            }
        });
    
        return connection;
    } 
});


/**
 * ================================================================================================================================
 *                              Aquí se define todas las bases de datos de la empresa ERPP ques se obtienen de SQL SERVER 
 * ================================================================================================================================ 
*/

/**
 * @autor David Demetrio López Paz
 * @fecha_creacion 18 de Agosto del 2023
 * @definición Clase para la db restAPI de SQL SERVER
 * @param { nombre_db }
*/
export const Mssql_db_restAPI = data => {
    const { nombre_db } = data;
    
    let info = {
        nombre_db
    };
    
    return Object.assign(
        coneccion_db_mssql(info)
    );
}

/**
 * @autor David Demetrio López Paz
 * @fecha_creacion 18 de Agosto del 2023
 * @definición Clase para la db sero_cuautitlan_izcalli de SQL SERVER
 * @param { nombre_db }
*/
export const Mssql_db_cuautitlan_izcalli = data => {
    const { nombre_db, obj_conexion_db } = data;
    
    let info = {
        nombre_db,
        obj_conexion_db
    };

    return Object.assign(
        connection_sql_server(info)
    );
}

/**
 * @autor David Demetrio López Paz
 * @fecha_creacion 18 de Agosto del 2023
 * @definición Clase para la db sero_naucalpan de SQL SERVER
 * @param { nombre_db }
*/
export const Mssql_db_naucalpan = data => {
    const { nombre_db, obj_conexion_db } = data;
    
}

/**
 * @autor David Demetrio López Paz
 * @fecha_creacion 18 de Agosto del 2023
 * @definición Clase para la db sero_zinacantepec de SQL SERVER
 * @param { nombre_db }
*/
export const Mssql_db_zinacantepec = data => {
    const { nombre_db, obj_conexion_db } = data;

}