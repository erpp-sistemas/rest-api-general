export const get_fecha_max_captura_domestio_agua_nau = async data => {
    try {
        const { coneccion_db } = data;
        const [fecha_max_captura_domestico, metadata] = await coneccion_db.query(`
            SELECT
                MAX("${data.fecha_captura}") AS max_fecha_captura
            FROM ${data.nombre_tabla};
        `);

        return fecha_max_captura_domestico;         
    } catch (error) {
        console.log(error);
    }
}

export const get_fecha_max_captura_comercial_agua_nau = async data => {
    try {
        const { coneccion_db } = data;
        const [fecha_max_captura_comercial, metadata] = await coneccion_db.query(`
            SELECT
                MAX("${data.fecha_captura}") AS max_fecha_captura
            FROM ${data.nombre_tabla};
        `);

        return fecha_max_captura_comercial;         
    } catch (error) {
        console.log(error);
    }
}