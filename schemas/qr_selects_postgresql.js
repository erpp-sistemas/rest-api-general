export const structure_table = async data => {
    try {
        const { connection_postgresQL, table_name } = data;

        const [table_fields, metadata] = await connection_postgresQL.query(`
            SELECT
                *
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE table_name = '${table_name}'
            ORDER BY "ordinal_position";
        `);
        return table_fields;
    } catch (error) {
        console.log(error);
    }
}

export const max_data_about_table = async data => {
    try {
        const { connection_postgresQL, table_name, field_fecha_captura, field_id } = data;

        const [table_fields, metadata] = await connection_postgresQL.query(`
            SELECT
                MAX("${field_fecha_captura}") AS max_fecha_captura,
                MAX("${field_id}") AS max_id
            FROM ${table_name};
        `);
        
        return table_fields;
    } catch (error) {
        console.log(error);
    }
}

export const delete_rows_from_table = async data => {
    try {
        const { connection_postgresQL, table_name, nombre_campo_fecha_pago, fecha_actual } = data;

        await connection_postgresQL.query(`
            DELETE FROM ${table_name}
            WHERE "${nombre_campo_fecha_pago}" = '${fecha_actual}';
        `);
    } catch (error) {
        console.log(error);
    }
}

export const dates_about_table = async data => {
    try {
        const { connection_postgresQL, table_name, nombre_campo_fecha_pago } = data;

        const [dates, metadata] =  await connection_postgresQL.query(`
            SELECT 
                DISTINCT("${nombre_campo_fecha_pago}")
            FROM ${table_name}
            GROUP BY "${nombre_campo_fecha_pago}"
            ORDER BY "${nombre_campo_fecha_pago}";
        `);

        return dates;
    } catch (error) {
        console.log(error);
    }
}