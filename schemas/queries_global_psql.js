/**
 * @description Obtiene la fecha máxima de una tabla
 * @param {*} data 
 * @returns 
*/
export const get_fecha_max = async data => {
    try {
        const { coneccion_db } = data;
        const [fecha_max, metadata] = await coneccion_db.query(`
            SELECT
                MAX("${data.fecha_c}") AS max_fecha
            FROM ${data.nombre_tabla};
        `);

        return fecha_max;         
    } catch (error) {
        console.log(error);
    }
}

/**
 * @description Obtiene el id máxima de una tabla
 * @param {*} data 
 * @returns 
*/
export const get_id_max = async data => {
    try {
        const { coneccion_db } = data;
        const [id_max, metadata] = await coneccion_db.query(`
            SELECT
                MAX("${data.id_nombre}") AS max_id
            FROM ${data.nombre_tabla};
        `);

        return id_max;         
    } catch (error) {
        console.log(error);
    }
}

/**
 * @description Obtiene la estrcutura de una tabla
 * @param {*} data 
 * @returns 
*/
export const get_schema_tabla = async data => {
    try {
        const { coneccion_db } = data;
        const [estructura_tabla, metadata] = await coneccion_db.query(`
            SELECT
                *
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE table_name = '${data.nombre_tabla}'
            ORDER BY "ordinal_position"
        `);

        return estructura_tabla;         
    } catch (error) {
        console.log(error);
    }
}

/**
 * @author David Demetrio Lopez Paz
 * @date_creation 07 de Sepetimbre del 2023
 * @description Función que elimina datos correspondientes a una fecha actual
 */
export const eliminar_datos_fecha_actual = async data => {
    try {
        const { coneccion_db } = data;
        await coneccion_db.query(`
            DELETE FROM ${data.nombre_tabla}
            WHERE "${data.nombre_columna}" >= '${data.fecha_actual}'
        `);
    } catch (error) {
        console.log(error);
    }
}