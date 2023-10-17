import {
    actualiza_registros_carta_invitacion_comercial,
    actualiza_registros_carta_invitacion_domestico,
    actualiza_registros_embargoPrecautorio,
    coneccion_db_psql,
    elimina_datos_fecha_actual_comercial,
    elimina_datos_fecha_actual_domestico,
    elimina_datos_fecha_actual_embargoPrecautorio,
    get_estructura_tabla_comercial,
    get_estructura_tabla_domestico,
    get_estructura_tabla_embargo_precautorio,
    get_insert_into_col_comercial,
    get_insert_into_col_domestico,
    get_insert_into_col_table_embargoPrecautorio,
    valores_max_min_embargoPrecautorio,
    valores_maximos_y_fmin_relacionada
} from "./methods_dbs_objects/methods_dbs_objects_psql.js";


export const Psql_db_cuautitlan_izcalli = data => {
    data = {...data, nombre_db: process.env.POSTGRESQL_DB_CIZCALLI};

    return Object.assign(
        data,
        coneccion_db_psql(data),
        get_estructura_tabla_embargo_precautorio(data),
        get_insert_into_col_table_embargoPrecautorio(),
        elimina_datos_fecha_actual_embargoPrecautorio(data),
        valores_max_min_embargoPrecautorio(data),
        actualiza_registros_embargoPrecautorio(data)
    )
}

export const Psql_db_naucalpan = data => {
    data = {...data, nombre_db: process.env.POSTGRESQL_DB_NAUCALPAN};

    return Object.assign(
        data,
        coneccion_db_psql(data),
        get_estructura_tabla_domestico(data),
        get_estructura_tabla_comercial(data),
        get_insert_into_col_domestico(),
        get_insert_into_col_comercial(),
        elimina_datos_fecha_actual_domestico(data),
        elimina_datos_fecha_actual_comercial(data),
        valores_maximos_y_fmin_relacionada(data),
        actualiza_registros_carta_invitacion_domestico(data),
        actualiza_registros_carta_invitacion_comercial(data)
    )
}