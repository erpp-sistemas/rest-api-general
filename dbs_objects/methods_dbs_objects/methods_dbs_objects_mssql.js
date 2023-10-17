import { Sequelize } from "sequelize";
import { get_pagos_validos_restAPI } from "../../schemas/queries_restAPI_mssql.js";
import { get_pagos_validos_cizcalli } from "../../schemas/queries_cizcalli_mssql.js";
import { get_all_records } from "../../schemas/queries_global.js";

/**
 * ================================================================================================================================
 *                              Aquí se definen todos los métodos que pueden compartir los objetos de las db´s de SQL SERVER
 * ================================================================================================================================ 
*/

/**
 * @autor David Demetrio López Paz
 * @fecha_creacion 18 de Agosto del 2023
 * @definición conección a una db de SQL SERVER
 * @param info
*/

export const coneccion_db_mssql = info => ({
    connection_sql_server() {
        const connection = new Sequelize(info.nombre_db, process.env.SQL_SERVER_USER, process.env.SQL_SERVER_PASSWORD, {
            host: process.env.SQL_SERVER_IP,
            dialect: "mssql",
            dialectOptions: {
                options: {
                    requestTimeout: 0
                }
            }
        });
    
        return connection;
    } 
});


/**
 * @autor David Demetrio López Paz
 * @fecha_creacion 22 de Agosto del 2023
 * @definicion Obtien los datos de pagos válidos del store procedure "sp_getPagoValidoByIdPlazaIdServicio"
 *             que está almacenado en la db restAPI
 * @param info
*/
export const pagos_validos_from_restAPI = info => ({
    async get_pagos_validos_from_restAPI() {
        try {
            const pagos_validos = await get_pagos_validos_restAPI(info);
            return pagos_validos;
        } catch (error) {
            console.log(error);
        }
    }
});


/**
 * @autor David Demetrio López Paz
 * @fecha_creacion 22 de Agosto del 2023
 * @definicion Obtien los datos de pagos válidos del store procedure "sp_consulta_pago_valido"
 *             que está almacenado en la db sero_cuautitlan_izcalli
 * @param info
*/
export const pagos_validos_from_cizcalli = info => ({
    async get_pagos_validos_from_cizcalli() {
        try {
            const pagos_validos = await get_pagos_validos_cizcalli(info);
            return pagos_validos;
        } catch (error) {
            console.log(error);
        }
    }
});

export const obtener_cat_tareas = info => ({
    async get_cat_tareas() {
        try {
            const data = {
                connection_db: info.coneccion_db,
                table_name: info.tabla_cat_tarea
            };
            const get_cat_tareas = await get_all_records(data);
            return get_cat_tareas;
        } catch (error) {
            console.log(error);
        }
    }
});