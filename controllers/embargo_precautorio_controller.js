import moment from "moment";
import { Mssql_db_cuautitlan_izcalli, Mssql_db_restAPI, Mssql_sero_central } from "../dbs_objects/dbs_objects_mssql.js";
import { Psql_db_cuautitlan_izcalli } from "../dbs_objects/dbs_objects_psql.js";
import { get_cartas_invitaciones_only_idTarea23 } from "../schemas/queries_restAPI_mssql.js";

export const actualizar_embargo_precautorio = async (req, res, next) => {
    try {
        const { body } = req;
        let result = '';

        if (body.plaza_id == 2) {
            result = await actualizar_embargo_precautorio_izcalli(body);
        }

        res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

const actualizar_embargo_precautorio_izcalli = async body => {
    try {
        /**
         * almacena los datos traidos del body, con el tipo de dato correspondiente,
         * ya q desde el fetch se pude alterar el tipo de dato
        */
        const data_dbs = {
            servicio_id: parseInt(body.servicio_id),
            plaza_id: parseInt(body.plaza_id),
            fecha_fin: body.fecha_fin,
            tabla_embargo_precautorio: process.env.SQL_SERVER_TABLE_EP,
            tabla_predios_valdios: process.env.SQL_SERVER_TABLE_PVALDIOSYEAR,
            tabla_cat_tarea: process.env.SQL_SERVER_TABLE_CTAREA
        };

        // Objetos de conección a bases de datos
        let coneccion_mssql_db_restAPI = Mssql_db_restAPI(data_dbs);
        let coneccion_psql_db_cuautitlan_izcalli = Psql_db_cuautitlan_izcalli(data_dbs);
        let coneccion_mssql_db_cuautitlan_izcalli = Mssql_db_cuautitlan_izcalli(data_dbs);
        let coneccion_mssql_db_sero_central= Mssql_sero_central(data_dbs);
        
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
        
        // Conección a DB de sero_central MSSQL
        const coneccion_mssql_sero_central_obj = coneccion_mssql_db_sero_central.connection_sql_server();        
        await coneccion_mssql_sero_central_obj
            .authenticate()
            .then(() => { console.log('--------------- Conección establcida con SERO_CENTRAL MSSQL') })
            .catch(error => { console.log(error) });

        /**
         * Agregar a los objetos de coneccion, las conecciones de las bases de datos
        */
        coneccion_mssql_db_restAPI = Mssql_db_restAPI({...data_dbs, coneccion_db: coneccion_restAPI_obj });
        coneccion_mssql_db_cuautitlan_izcalli = Mssql_db_cuautitlan_izcalli({...data_dbs, coneccion_db: coneccion_mssql_cuautitlan_izcalli_obj});
        coneccion_psql_db_cuautitlan_izcalli = Psql_db_cuautitlan_izcalli({...data_dbs, coneccion_db: coneccion_psql_cuautitlan_izcalli_obj});
        coneccion_mssql_db_sero_central = Mssql_sero_central({...data_dbs, coneccion_db: coneccion_mssql_sero_central_obj});
        
        /**
         * Obtener estructura de la tabla Embargo_Precautorio
        */
        const estructura_tabla_embargo_precautorio = await coneccion_psql_db_cuautitlan_izcalli.estructura_tabla_embargo_precautorio();
        // Destructuring de algunos campos de la tabla
        const [columna_fcaptura] = estructura_tabla_embargo_precautorio.filter(columna => columna.ordinal_position == 18);
        const [columna_idPk] = estructura_tabla_embargo_precautorio.filter(columna => columna.ordinal_position == 1);
        /**
         * Obtener un string de los nombres de las columnas de la tabla
         * para un INSERT INTO
        */
        const columns_name_structure_table = coneccion_psql_db_cuautitlan_izcalli.insert_into_columnas_table_embargoPrecautorio(estructura_tabla_embargo_precautorio); 
        
        /**
         * Si body.fecha_fin >= fecha actual,
         * actualizar solo los datos de esa fecha actual
        */
        const fecha_actual = moment().format('YYYY-MM-DD');
        if (body.fecha_fin >= fecha_actual) {
            await coneccion_psql_db_cuautitlan_izcalli.eliminar_datos_fecha_actual_embargoPrecautorio({
                fecha_actual: fecha_actual,
                nombre_columna: columna_fcaptura.column_name
            })
        }
        /**
         * Obtener los valores máximos y fecha_min_encontrada
        */
         const data_for_values_max = {
            nombre_columna_embargoPrecautorio_f: columna_fcaptura.column_name,
            nombre_columna_idPk: columna_idPk.column_name
        };
    
        const values_max = await coneccion_psql_db_cuautitlan_izcalli.get_valores_max_min_embargoPrecautorio(data_for_values_max);

        // OBTENER LOS REGISTROS DE CARTA INVITACION
        const data_carta_invitacion = {
            coneccion_db: coneccion_restAPI_obj,
            plaza_id: data_dbs.plaza_id,
            servicio_id: data_dbs.servicio_id,
            fecha_inicio: values_max.last_date,
            fecha_fin: data_dbs.fecha_fin
        };

        const cartas_invitaciones = await get_cartas_invitaciones_only_idTarea23(data_carta_invitacion);
        
        if (cartas_invitaciones.length < 1) {
            return { msg: 'No hay datos para actualizar' };
        }

        // Obtener el nombre de la tareaid=23
        const cat_tareas = await coneccion_mssql_db_sero_central.get_cat_tareas();

        const data_tabla = {
            cartas_invitaciones: cartas_invitaciones,
            fecha_max: values_max.last_date,
            estructura_tabla: estructura_tabla_embargo_precautorio,
            max_id: values_max.max_id,
            columns_name_structure: columns_name_structure_table,
            column_name_fecha_captura: columna_fcaptura,
            cat_tareas: cat_tareas
        };

        // Actualizar datos en la tabla de Embargo Precautorio
        await coneccion_psql_db_cuautitlan_izcalli.actualizar_registros_embargoPrecautorio(data_tabla);

        // Cerrar conexiones a baases de datos
        await coneccion_restAPI_obj.close();
        await coneccion_psql_cuautitlan_izcalli_obj.close();
        await coneccion_mssql_cuautitlan_izcalli_obj.close();

        return { msg: '¡Datos actualizados!' };
    } catch (error) {
        console.log(error);
    }
}
