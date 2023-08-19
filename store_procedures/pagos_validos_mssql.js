export const get_pagos_validos_by_idPlaza_idServicio_agua = async data => {
    try {
        const {
            coneccion_db,
            plaza_id,
            servicio_id,
            ids_procesos,
            dias,
            fecha_inicio,
            fecha_fin
        } = data;

        const [pagos_validos, metadata] = await coneccion_db.query(`
            sp_getPagoValidoByIdPlazaIdServicio
                ${plaza_id},
                ${servicio_id},
                ${ids_procesos},
                ${dias},
                '${fecha_inicio}',
                '${fecha_fin}',
                1
            ;
        `);

        return pagos_validos;
    } catch (error) {
        console.log(error);
    }
}

// export const get_pagos_validos_by_idPlaza_idServicio_agua =