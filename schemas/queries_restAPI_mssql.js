/**
 * ================================================================================================================================
 *                              Aquí se definen todos los queries, incluyendo los store_procedures, de la db retAPI
 * ================================================================================================================================ 
*/

export const get_pagos_validos_restAPI = async data => {
    try {
        const { coneccion_db } = data;
        const [pagos_validos, metadata] = await coneccion_db.query(`
            sp_getPagoValidoByIdPlazaIdServicio
                ${data.plaza_id},
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

export const get_cartas_invitaciones = async data => {
    try {
        const { coneccion_db } = data;
        const [cartas_invitaciones, metadata] = await coneccion_db.query(`
            sp_getRegistroCartaInvitacion
                ${data.plaza_id},
                ${data.servicio_id},
                '${data.fecha_inicio}',
                '${data.fecha_fin}'
        `);

        return cartas_invitaciones;
    } catch (error) {
        console.log(error);
    }
}