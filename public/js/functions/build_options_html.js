/**
 *  ======================================= Aquí se enlistán todas las funciones que ====================
 *                                                                                              construyen funciones de manera global
 * =======================================================================================
 *                                            
 */

/**
 * @author David Demetrio López Paz
 * @date_creation 05 de Octubre del 2023  
 * @description Función que construye tag options para un selector que tendrá las plazas que manejamos la compañia ERPP
 * @returns none
 */
export const construir_tag_options = () => {
    const plazas = JSON.parse(local_storage.getItem('plazas'));
    const servicios = JSON.parse(local_storage.getItem('servicios'));

    const tag_options_plazas = plazas.map(plaza => {
        return `
            <option value="${plaza.id_plaza}">${plaza.nombre}</option>
            `;
    });
        
    const tag_options_servicios = servicios.map(servicio => {
        return `
            <option value="${servicio.id_servicio}">${servicio.nombre}</option>
        `;
    });

    const data = {
        tag_options_plazas: tag_options_plazas,
        tag_options_servicios: tag_options_servicios,

    };
    return data;
}

/**
 * @description Crear un grupo de options HTML con relacion a los ids procesos
 *                       especificados en la base de datos principal de ERPP SQL Server
*/
export const tag_opciones_procesos = () => {
    const procesos = JSON.parse(local_storage.getItem('procesos'));

    const tag_opciones_procesos = procesos.map(proceso => {
        return `
            <li>
                <a class="dropdown-item" href="#">
                    <input class="form-check-input cb-hijo-proceso" type="checkbox" value="${proceso.id_proceso}">
                    <label class="form-check-label" for="proceso-${proceso.id_proceso}">
                        ${proceso.nombre}
                    </label>
                </a>
            </li>    
        `;
    });

    return tag_opciones_procesos;
}
