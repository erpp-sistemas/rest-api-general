/**
 * ================================================================================================================================
 *                              Aquí se definen todos los queries, incluyendo los store_procedures, de la db cuautitlán izcalli
 *                                                             almacenada en MSSQL
 * ================================================================================================================================ 
*/
export const get_pagos_validos_cizcalli = async data => {
    try {
        const { coneccion_db } = data;

        const [pagos_validos, metadata] = await coneccion_db.query(`
            sp_consulta_pago_valido
                ${data.servicio_id},
                '${data.ids_procesos}',
                ${data.dias},
                '${data.fecha_inicio}',
                '${data.fecha_fin}',
                1;
        `);

        return pagos_validos;
    } catch (error) {
        console.log(error);
    }
}