import { Sequelize } from "sequelize";
import moment from "moment";
import {
    eliminar_datos_fecha_actual,
    get_fecha_max,
    get_id_max,
    get_schema_tabla
} from "../../schemas/queries_global_psql.js";

export const coneccion_db_psql = info => ({
    connection_postgresql() {
        const connection = new Sequelize(info.nombre_db, process.env.POSTGRESQL_USER, process.env.POSTGRESQL_PASSWORD, {
            host: process.env.POSTGRESQL_IP,
            dialect: 'postgres'
        });
    
        return connection;
    }
});

export const get_nombres_tablas_agua_naucalpan = () => {
    return {
        nombre_tabla_domestico: process.env.SQL_SERVER_TABLE_CRT_INVITACION_DA,
        nombre_tabla_comercial: process.env.SQL_SERVER_TABLE_CRT_INVITACION_CA,
        // nombre_tabla_industrial:   descomentar en caso de que exista una tabla en PSQL de este tipo
        // nombre_tabla_equipamiento: descomentar en caso de que exista una tabla en PSQL de este tipo
    }
}

export const obtener_nombres_tablas_naucalpan = fn => fn();

export const actualizar_datos_tablas = () => ({
    actualizar_datos_actuales() {
        // Actualizar datos de tabla domestico agua
        // Actualizar datos de tabla comercial agua
    }
});

export const get_estructura_tabla_domestico = info => ({
    async estructura_tabla_domestico() {
        try {
            const data = {
                coneccion_db: info.coneccion_db,
                nombre_tabla: info.nombre_tabla_domestico
            };
            const estructura_tabla = await get_schema_tabla(data);
            return estructura_tabla;
        } catch (error) {
            console.log(error);
        }
    }
});

export const get_estructura_tabla_comercial = info => ({
    async estructura_tabla_comercial() {
        try {
            const data = {
                coneccion_db: info.coneccion_db,
                nombre_tabla: info.nombre_tabla_comercial
            }
            const estructura_tabla = await get_schema_tabla(data);
            return estructura_tabla;
        } catch (error) {
            console.log(error);
        }
    }
});

export const get_estructura_tabla_embargo_precautorio = info => ({
    async estructura_tabla_embargo_precautorio() {
        try {
            const data = {
                coneccion_db: info.coneccion_db,
                nombre_tabla: info.tabla_embargo_precautorio
            };
            const estructura_tabla = await get_schema_tabla(data);
            return estructura_tabla;
        } catch (error) {
            console.log(error);
        }
    }
});

export const get_insert_into_col_domestico = () => ({
    insert_into_columnas_nombre_domestico(estructura_tabla_domestico) {
        let columns_name_structure_table_domestico = [];
        for (const field  of estructura_tabla_domestico) {
            if (field.ordinal_position == 29) continue;
            columns_name_structure_table_domestico.push(`"${field.column_name}"`);
        }

        return columns_name_structure_table_domestico;
    }
});

export const get_insert_into_col_comercial = () => ({
    insert_into_columnas_nombre_comercial(estructura_tabla_comercial) {
        let columns_name_structure_table_comercial = [];
        for (const field  of estructura_tabla_comercial) {
            if (field.ordinal_position == 29) continue;
            columns_name_structure_table_comercial.push(`"${field.column_name}"`);
        }

        return columns_name_structure_table_comercial;
    }
});

/**
 * @author David Demetrio Lopez Paz
 * @date_creation 07 de Septiembre del 2023
 * @description Solo elimna los datos correspondientes a la fecha actual
*/
export const elimina_datos_fecha_actual_domestico = info => ({
    async eliminar_datos_fecha_actual_domestico({ fecha_actual, nombre_columna }) {
        try {
            const data = {
                coneccion_db: info.coneccion_db,
                nombre_tabla: info.nombre_tabla_domestico,
                nombre_columna: nombre_columna,
                fecha_actual: fecha_actual
            };
            await eliminar_datos_fecha_actual(data);
        } catch (error) {
            console.log(error);
        }
    }
});

/**
 * @author David Demetrio Lopez Paz
 * @date_creation 07 de Septiembre del 2023
 * @description Solo elimna los datos correspondientes a la fecha actual
*/
export const elimina_datos_fecha_actual_comercial = info => ({
    async eliminar_datos_fecha_actual_comercial({ fecha_actual, nombre_columna }) {
        try {
            const data = {
                coneccion_db: info.coneccion_db,
                nombre_tabla: info.nombre_tabla_comercial,
                nombre_columna: nombre_columna,
                fecha_actual: fecha_actual
            };
            await eliminar_datos_fecha_actual(data);
        } catch (error) {
            console.log(error);
        }
    }
});

/**
 * @author David Demetrio Lopez Paz
 * @date_creation 07 de Septiembre del 2023
 * @description Obtiene los valores máximos de fechas captura de las tablas doméstico
 *              y comercial. La fecha minima entre dichas tablas tomando en cuenta sus
 *              valores máximos (fmin_relacionada). Y los valores máximos de ids de dichas tablas
*/
export const valores_maximos_y_fmin_relacionada = info => ({
    async get_valores_maximos_y_fmin_relacionada(data) {
        try {
            const {
                nombre_columna_domestico_f,
                nombre_columna_comercial_f,
                nombre_columna_domestico_id,
                nombre_columna_comercial_id
            } = data;

            const data_domestico = {
                coneccion_db: info.coneccion_db,
                fecha_c: nombre_columna_domestico_f,
                nombre_tabla: info.nombre_tabla_domestico,
                id_nombre: nombre_columna_domestico_id
            };
            const data_comercial = {
                coneccion_db: info.coneccion_db,
                fecha_c: nombre_columna_comercial_f,
                nombre_tabla: info.nombre_tabla_comercial,
                id_nombre: nombre_columna_comercial_id
            };

            const [fecha_max_domestico_arr, fecha_max_comercial_arr] = await Promise.all([
                get_fecha_max(data_domestico),
                get_fecha_max(data_comercial),
            ]);

            // Sino se encuentra una fecha_max ingresada por default toma 2022-01-01
            const fecha_max_domestico = fecha_max_domestico_arr[0].max_fecha || '2022-01-01';
            const fecha_max_comercial = fecha_max_comercial_arr[0].max_fecha || '2022-01-01';
            
            // Obteniendo la fecha min relacionada de las fecha_max encontradas en cada tabla
            const fechas_obj = [
                {
                    fecha_max_string: fecha_max_domestico,
                    fecha_max_type_date: Date.parse(fecha_max_domestico)
                },
                {
                    fecha_max_string: fecha_max_comercial,
                    fecha_max_type_date: Date.parse(fecha_max_comercial)
                }
            ];
            
            const fecha_min_encontrada_type_date = Math.min(Date.parse(fecha_max_domestico), Date.parse(fecha_max_comercial));
            const [fecha_min_encontrada_obj] = fechas_obj.filter(fecha => fecha.fecha_max_type_date == fecha_min_encontrada_type_date) 
            const fecha_min_encontrada = fecha_min_encontrada_obj.fecha_max_string;


            // Obtener los ids de las tablas
            const [id_max_domestico_arr, id_max_comercial_arr] = await Promise.all([
                get_id_max(data_domestico),
                get_id_max(data_comercial),
            ]);
            let max_id_domestico = id_max_domestico_arr[0].max_id || 1;
            let max_id_comercial = id_max_comercial_arr[0].max_id || 1;

            return {
                fecha_max_domestico: fecha_max_domestico,
                fecha_max_comercial: fecha_max_comercial,
                fecha_min_encontrada: fecha_min_encontrada,
                max_id_domestico: max_id_domestico,
                max_id_comercial: max_id_comercial
            }
        } catch (error) {
            console.log(error);
        }
    }
});

export const actualiza_registros_carta_invitacion_domestico = info => ({
    async actualizar_registros_carta_invitacion_domestico(data_values) {
        try {
            const { coneccion_db } = info;
            let {
                cartas_invitaciones,
                fecha_max_domestico,
                estructura_tabla_domestico,
                max_id_domestico,
                columns_name_structure_table_domestico,
                column_name_fecha_captura
            } = data_values;

            let values_to_insert_domestico = [];
            
            // Filtrar datos de Domestico
            const registros_carta_invitacion_domestico = cartas_invitaciones.filter(registro => {
                const servicio_padron_comercial = registro.tipo_servicio_padron.toLowerCase().includes('comercial');
                const servicio_padron_equipamiento = registro.tipo_servicio_padron.toLowerCase().includes('equipamiento');
                const servicio_padron_industrial = registro.tipo_servicio_padron.toLowerCase().includes('industrial');
                const fecha_captura_registro = registro[column_name_fecha_captura];
    
                if (fecha_captura_registro > fecha_max_domestico && !servicio_padron_comercial && !servicio_padron_equipamiento && !servicio_padron_industrial) {
                    return registro;
                }
            });

            if (registros_carta_invitacion_domestico.length < 1) return;

            for (const registro of registros_carta_invitacion_domestico) {
                let row = [];
    
                for (const field of estructura_tabla_domestico) {
                    if (field.ordinal_position == 1) {
                        row = [...row, max_id_domestico++];
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

            await coneccion_db.query(`
                INSERT INTO ${info.nombre_tabla_domestico} (${columns_name_structure_table_domestico.join(',')})
                VALUES ${values_to_insert_domestico.join(',')}
            `);

            await coneccion_db.query(`update ${info.nombre_tabla_domestico} set geom = ST_SetSRID(ST_MakePoint(longitud, latitud), 4326) where latitud > 0`);
        } catch (error) {
            console.log(error);
        }
    }
});

export const actualiza_registros_carta_invitacion_comercial = info => ({
    async actualizar_registros_carta_invitacion_comercial(data_values) {
        try {
            const { coneccion_db } = info;
            
            let {
                cartas_invitaciones,
                fecha_max_comercial,
                estructura_tabla_comercial,
                max_id_comercial,
                columns_name_structure_table_comercial,
                column_name_fecha_captura
            } = data_values;

            let values_to_insert_comercial = [];

            // Filtrar datos de Comercial
            const registros_carta_invitacion_comercial = cartas_invitaciones.filter(registro => {
                const servicio_padron_comercial = registro.tipo_servicio_padron.toLowerCase().includes('comercial');
                const fecha_captura_registro = registro[column_name_fecha_captura];
                
                if (fecha_captura_registro > fecha_max_comercial && servicio_padron_comercial) {
                    return registro;
                }
            });

            if (registros_carta_invitacion_comercial.length < 1) return;

            for (const registro of registros_carta_invitacion_comercial) {
                let row = [];
                for (const field of estructura_tabla_comercial) {
                    if (field.ordinal_position == 1) {
                        row = [...row, max_id_comercial++];
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

            await coneccion_db.query(`
                INSERT INTO ${info.nombre_tabla_comercial} (${columns_name_structure_table_comercial.join(',')})
                VALUES ${values_to_insert_comercial.join(',')}
            `);
            await coneccion_db.query(`update ${info.nombre_tabla_comercial} set geom = ST_SetSRID(ST_MakePoint(longitud, latitud), 4326) where latitud > 0`);
        } catch (error) {
            console.log(error);
        }
    }
});

export const get_insert_into_col_table_embargoPrecautorio = () => ({
    insert_into_columnas_table_embargoPrecautorio(estructura_tabla) {
        let columns_name_structure_table = [];
        for (const field  of estructura_tabla) {
            if (field.ordinal_position == 2) continue;
            columns_name_structure_table.push(`"${field.column_name}"`);
        }

        return columns_name_structure_table;
    }
});

/**
 * @author David Demetrio Lopez Paz
 * @date_creation 07 de Septiembre del 2023
 * @description Solo elimna los datos correspondientes a la fecha actual
*/
export const elimina_datos_fecha_actual_embargoPrecautorio = info => ({
    async eliminar_datos_fecha_actual_embargoPrecautorio({ fecha_actual, nombre_columna }) {
        try {
            const data = {
                coneccion_db: info.coneccion_db,
                nombre_tabla: info.tabla_embargo_precautorio,
                nombre_columna: nombre_columna,
                fecha_actual: fecha_actual
            };

            await info.coneccion_db.query(`
            DELETE FROM "${data.nombre_tabla}"
            WHERE "${data.nombre_columna}" >= '${data.fecha_actual}'
        `);
        } catch (error) {
            console.log(error);
        }
    }
});

export const valores_max_min_embargoPrecautorio = info => ({
    async get_valores_max_min_embargoPrecautorio(data) {
        try {
            const data_embargoPrecautorio = {
                coneccion_db: info.coneccion_db,
                fecha_c: data.nombre_columna_embargoPrecautorio_f,
                nombre_tabla: info.tabla_embargo_precautorio,
                id_nombre: data.nombre_columna_idPk
            };

            const [fecha_max_embargoPrecautorio] = await info.coneccion_db.query(`
                SELECT
                    MAX("${data_embargoPrecautorio.fecha_c}") AS max_fecha
                FROM "${data_embargoPrecautorio.nombre_tabla}";
            `);
            // Sino se encuentra una fecha_max ingresada por default toma 2022-01-01
            let fecha_max = fecha_max_embargoPrecautorio[0].max_fecha || '2022-01-01';
            const fecha_parseada = moment(fecha_max, 'YYYY-MM-DD');
            const fecha_agregar_un_dia_mas = fecha_parseada.add(1, 'days');
            fecha_max = fecha_agregar_un_dia_mas.format('YYYY-MM-DD');

            // Obtener el id max de la tabla
            const [id_max] = await info.coneccion_db.query(`
                SELECT
                    MAX("${data_embargoPrecautorio.id_nombre}") AS max_id
                FROM "${data_embargoPrecautorio.nombre_tabla}";
            `);
            let max_id = id_max[0].max_id || 1;

            return {
                last_date: fecha_max,
                max_id: max_id
            }
        } catch (error) {
            console.log(error);
        }
    }
});

export const actualiza_registros_embargoPrecautorio = info => ({
    async actualizar_registros_embargoPrecautorio(data_values) {
        try {
            const { coneccion_db } = info;
            let {
                cartas_invitaciones,
                fecha_max,
                estructura_tabla,
                max_id,
                columns_name_structure,
                column_name_fecha_captura,
                cat_tareas
            } = data_values;

            let values_to_insert = [];

            // Obtener la columna de la estructura de la tabla que representa el campo "cuenta"
            const [column_cuenta] = estructura_tabla.filter(columna => columna.ordinal_position == 3);
            // Obtener las lat y long de tabla Predios Valdios 2023
            const get_cuentas_predios_valdios = cartas_invitaciones.map(registro => `'${registro[column_cuenta.column_name]}'`);
            // Obtener el nombre de la tarea 23
            const [tarea] = cat_tareas.filter(cat_tarea => cat_tarea.id_tarea == 23);

            const [cuentas_predios_valdios, metadata] = await coneccion_db.query(`
                SELECT
                    *
                FROM "${info.tabla_predios_valdios}"
                WHERE cuenta IN (${get_cuentas_predios_valdios.join(',')});
            `);
            
            for (const registro of cartas_invitaciones) {
                let row = [];
    
                for (const field of estructura_tabla) {
                    if (field.ordinal_position == 1) {
                        row = [...row, max_id++];
                        continue;
                    }
    
                    if (field.ordinal_position == 2) continue;
                    
                    // Lat
                    if (field.ordinal_position == 23) {
                        const [predio_valdio] = cuentas_predios_valdios.filter(cuenta => cuenta.cuenta == registro[column_cuenta.column_name]);
                        row = [...row, predio_valdio.latitud];
                        continue;
                    };
                    
                    // Long
                    if (field.ordinal_position == 24) {
                        const [predio_valdio] = cuentas_predios_valdios.filter(cuenta => cuenta.cuenta == registro[column_cuenta.column_name]);
                        row = [...row, predio_valdio.longitud];
                        continue;
                    };
                   
                    // IdTarea
                    if (field.ordinal_position == 31) {
                        row = [...row, `'${tarea.nombre}'`];
                        continue;
                    };

                    if (!registro[field.column_name]) {
                        row = [...row, `' '`];
                        continue;
                    }
    
                    if (field.ordinal_position == 22) {
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
    
                values_to_insert = [...values_to_insert, `(${row.join(',')})`];
            }

            await coneccion_db.query(`
                INSERT INTO "${info.tabla_embargo_precautorio}" (${columns_name_structure.join(',')})
                VALUES ${values_to_insert.join(',')}
            `);

            await coneccion_db.query(`update "${info.tabla_embargo_precautorio}" set geom = ST_SetSRID(ST_MakePoint(longitud, latitud), 4326) where latitud > 0`);
        } catch (error) {
            console.log(error);
        }
    }
});