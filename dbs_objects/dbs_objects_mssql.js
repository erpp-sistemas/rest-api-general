// import {} from "dotenv/config";
import {
    coneccion_db_mssql,
    pagos_validos_from_cizcalli,
    pagos_validos_from_restAPI
} from "./methods_dbs_objects/methods_dbs_objects_mssql.js";

/**
 * ================================================================================================================================
 *                              Aquí se define todas las bases de datos de la empresa ERPP ques se obtienen de SQL SERVER 
 * ================================================================================================================================ 
*/

/**
 * @autor David Demetrio López Paz
 * @fecha_creacion 18 de Agosto del 2023
 * @definición Objeto para la db restAPI de SQL SERVER
 * @param { nombre_db }
*/
export const Mssql_db_restAPI = data => {
    data = {...data, nombre_db: process.env.SQL_SERVER_DB_API};
    
    return Object.assign(
        data,
        coneccion_db_mssql(data),
        pagos_validos_from_restAPI(data)
    );
}

/**
 * @autor David Demetrio López Paz
 * @fecha_creacion 18 de Agosto del 2023
 * @definición Objeto para la db sero_cuautitlan_izcalli de SQL SERVER
 * @param { nombre_db }
*/
export const Mssql_db_cuautitlan_izcalli = data => {
    data = {...data, nombre_db: process.env.SQL_SERVER_DB_CI};

    return Object.assign(
        data,
        coneccion_db_mssql(data),
        pagos_validos_from_cizcalli(data)
    );
}

/**
 * @autor David Demetrio López Paz
 * @fecha_creacion 18 de Agosto del 2023
 * @definición Objeto para la db sero_naucalpan de SQL SERVER
 * @param { nombre_db }
*/
export const Mssql_db_naucalpan = data => {
    const { nombre_db, obj_conexion_db } = data;
    
}

/**
 * @autor David Demetrio López Paz
 * @fecha_creacion 18 de Agosto del 2023
 * @definición Objeto para la db sero_zinacantepec de SQL SERVER
 * @param { nombre_db }
*/
export const Mssql_db_zinacantepec = data => {
    const { nombre_db, obj_conexion_db } = data;

}