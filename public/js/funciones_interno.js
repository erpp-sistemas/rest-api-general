import { validar_inputs_numero_es_entero } from "./functions/inputs.js";
import { loading_hope } from "./functions/loading.js";
import { mensaje_exito } from "./functions/mensajes.js";

const btns_abrir_modales = document.querySelectorAll('.btn-open-modal');

/**
 * @author David Demetrio Lopez Paz
 * Date creation: 31 de Julio del 2023
 * @description:
 *      Obtiene los catálogos de la db sero_central
 * @param ninguno
 * @return none
*/
const get_catalogos = async () => {
    try {
        const response = await fetch(`${base_url}api/funciones/get_catalogos`, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
                "auth-token": token, 
            }
        });
        const result = await response.json();
        const { plazas, servicios, procesos } = result;

        // Almacenar datos en el localStorage
        local_storage.setItem('plazas', JSON.stringify(plazas));
        local_storage.setItem('servicios', JSON.stringify(servicios));
        local_storage.setItem('procesos', JSON.stringify(procesos));
    } catch (error) {
        console.log(error);
    }
}

const actualizar_adeudo_rezago = () => {
    document.querySelector('#btn-actualizar-adeudo-rezago').onclick = async () => {
        try {
            const inputs_validar = document.querySelectorAll('.input-validar');

            const data = {
                plaza_id: '',
                servicio_id: ''
            };

            for (const input of inputs_validar) {
                const input_msg_alert = input.nextElementSibling;
                if (input.value.trim() != '') {
                    input_msg_alert.style.display = 'none';
                    data[input.name] = input.value;
                    continue;
                }
                input_msg_alert.textContent = "El campo es requerido";
                input_msg_alert.style.display = 'block';
                return;
            }

            // Open loading
            const loading = document.querySelector('.content-loading');
            loading.classList.remove('d-none');
            // Va itercalando dinámicamente el mensaje de loading
            const loagin_dynamic = setInterval(loading_hope, 10000);
            
            const response = await fetch(`${base_url}api/funciones/adeudo_rezago`, {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/x-www-form-urlencoded',
                    "auth-token": token, 
                },
                body: new URLSearchParams(data)
            });

            const result = await response.json();
            // Mataer el setTimeout del loading de espera
            clearInterval(loagin_dynamic);
            loading.classList.add('d-none');
            // Se esconde ventana modal
            document.querySelector('.modal-adeudo-rezago').style.display = 'none';
            const data_mensaje = { msg: result.msg, url: '/funciones/interno' };
            mensaje_exito(data_mensaje);
        } catch (error) {
            console.log(error);
        }
    }
}

const construir_tag_options = () => {
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

const modal_adeudo_rezago = () => {
    /**
     * Se remueve ventana modal para no sobreponer más
     * ventanas modales con el mismo id 
    */
    /* if (document.querySelector('#btn-actualizar-adeudo-rezago')) {
        document.querySelector('#btn-actualizar-adeudo-rezago').remove();
    } */
    if (document.querySelector('.modal-card-fn')) {
        document.querySelector('.modal-card-fn').remove();
    }
    const content_modal = document.createElement('DIV');
    content_modal.classList.add('modal', 'modal-form', 'fade', 'modal-adeudo-rezago', 'modal-card-fn');
    content_modal.setAttribute('tabindex', -1);
    content_modal.setAttribute('aria-labelledby', 'modal-adeudo-rezago');
    content_modal.setAttribute('aria-hidden', true);

    const options_html = construir_tag_options();
    const { tag_options_plazas, tag_options_servicios } = options_html;

    content_modal.innerHTML = `
        <div class="modal-dialog" style="min-width: 630px;">
            <form>
                <div class="modal-content">
                    <div class="modal-header bg-blue-sys text-white" style="border-bottom: none !important;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                            <g fill="#269355">
                                <path
                                    d="M11.25 7.847c-.936.256-1.5.975-1.5 1.653s.564 1.397 1.5 1.652V7.848Zm1.5 5.001v3.304c.936-.255
                                    1.5-.974 1.5-1.652c0-.678-.564-1.397-1.5-1.652Z"
                                />
                                <path
                                    fill-rule="evenodd"
                                    d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10ZM12 5.25a.75.75 0 0 1
                                    .75.75v.317c1.63.292 3 1.517 3 3.183a.75.75 0 0 1-1.5 0c0-.678-.564-1.397-1.5-1.653v3.47c1.63.292
                                    3 1.517 3 3.183s-1.37 2.891-3 3.183V18a.75.75 0 0 1-1.5 0v-.317c-1.63-.292-3-1.517-3-3.183a.75.75
                                    0 0 1 1.5 0c0 .678.564 1.397 1.5 1.652v-3.469c-1.63-.292-3-1.517-3-3.183s1.37-2.891 3-3.183V6a.75.75
                                    0 0 1 .75-.75Z" clip-rule="evenodd"
                                />
                            </g>
                        </svg>
                        <h5 class="modal-title ms-2" id="modal-adeudo-rezago-label">Adeudo Rezago</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body bg-blue-sys">
                        <div class="row">
                            <div class="col-6">
                                <div class="input-group">
                                    <label class="input-group-text" for="input-plaza">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                                            <path
                                                fill="#269355"
                                                d="M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5M12 2a7 7
                                                0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z"
                                            />
                                        </svg>
                                    </label>
                                    <select class="form-select cr-pointer input-validar" name="plaza_id">
                                        <option value="" selected="" disabled="">Seleccione una plaza</option>
                                        ${tag_options_plazas.join('')}
                                    </select>
                                    <div class="invalid-feedback"></div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="input-group">
                                    <label class="input-group-text" for="input-servicio">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                                            <path
                                                fill="#269355"
                                                d="M9.335 11.502h2.17a4.5 4.5 0 0 1 4.5 4.5H9.004v1h8v-1a5.578 5.578 0 0 0-.885-3h2.886a5 5
                                                0 0 1 4.516 2.852c-2.365 3.121-6.194 5.149-10.516 5.149c-2.761 0-5.1-.59-7-1.625v-9.304a6.966
                                                6.966 0 0 1 3.33 1.428Zm-4.33 7.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h2a1 1 0 0 1
                                                1 1v9Zm13-14a3 3 0 1 1 0 6.001a3 3 0 0 1 0-6Zm-7-3a3 3 0 1 1 0 6.001a3 3 0 0 1 0-6Z"
                                            />
                                        </svg>
                                    </label>
                                    <select class="form-select cr-pointer input-validar" name="servicio_id">
                                        <option value="" selected="" disabled="">Seleccione un servicio</option>
                                        ${tag_options_servicios.join('')}
                                    </select>
                                    <div class="invalid-feedback"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer bg-blue-sys" style="padding: 0.5rem 1rem; border-top: none !important;">
                        <a href="#" role="button" class="btn button-principal btn-sm" id="btn-actualizar-adeudo-rezago">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 20 20">
                                <path
                                    fill="white"
                                    d="M10.2 3.28c3.53 0 6.43 2.61 6.92 6h2.08l-3.5 4l-3.5-4h2.32a4.439 4.439 0 0 0-4.32-3.45c-1.45 0-2.73.71-3.54 1.78L4.95
                                    5.66a6.965 6.965 0 0 1 5.25-2.38zm-.4 13.44c-3.52 0-6.43-2.61-6.92-6H.8l3.5-4c1.17 1.33 2.33 2.67 3.5 4H5.48a4.439 4.439
                                    0 0 0 4.32 3.45c1.45 0 2.73-.71 3.54-1.78l1.71 1.95a6.95 6.95 0 0 1-5.25 2.38z">
                                </path>
                            </svg>
                            Actualizar datos
                        </a>
                    </div>
                </div>
            </form>
        </div>
    `;

    const modal_adeudo_rezago = new bootstrap.Modal(content_modal);
    modal_adeudo_rezago.show();
    content_modal.addEventListener('shown.bs.modal', actualizar_adeudo_rezago);
}

const actualizar_carta_invitacion = () => {
    document.querySelector('#btn-actualizar-carta-invitacion').onclick = async () => {
        try {
            const inputs_validar = document.querySelectorAll('.input-validar');
            const data = {
                fecha_inicio: '',
                fecha_fin: '',
                plaza_id: '',
                servicio_id: ''
            };

            for (const input of inputs_validar) {
                const input_msg_alert = input.nextElementSibling;
                if (input.value.trim() != '') {
                    input_msg_alert.style.display = 'none';
                    data[input.name] = input.value;
                    continue;
                }
                input_msg_alert.textContent = "El campo es requerido";
                input_msg_alert.style.display = 'block';
                return;
            }
            // Open loading
            const loading = document.querySelector('.content-loading');
            loading.classList.remove('d-none');
            // Va itercalando dinámicamente el mensaje de loading
            const loagin_dynamic = setInterval(loading_hope, 10000);
            
            const response = await fetch(`${base_url}api/funciones/carta_invitacion`, {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/x-www-form-urlencoded',
                    "auth-token": token, 
                },
                body: new URLSearchParams(data)
            });

            const result = await response.json();
            // Mataer el setTimeout del loading de espera
            clearInterval(loagin_dynamic);
            loading.classList.add('d-none');
            // Se esconde ventana modal
            document.querySelector('.modal-carta-invitacion').style.display = 'none';
            const data_mensaje = { msg: result.msg, url: '/funciones/interno' };
            mensaje_exito(data_mensaje);
        } catch (error) {
            console.log(error);
        }
    }
}

const evento_cb_maestro_todos_procesos = () => {
    const cb_maestro_todos_procesos = document.querySelector('.cb-procesos input[value="todos-procesos"]');
    const cb_hijos = document.querySelectorAll('.cb-hijo-proceso');

    cb_maestro_todos_procesos.onclick = () => {
        if (cb_maestro_todos_procesos.checked) {
            // Seleccionar todos los cb hijos
            for (const cb_hijo of cb_hijos) {
                cb_hijo.checked = true;            
            }
            return;
        }
        
        if (!cb_maestro_todos_procesos.checked) {
            for (const cb_hijo of cb_hijos) {
                cb_hijo.checked = false;            
            }
        }
    }

}

const validar_cb_hijos_proceso = () => {
    // Convierte un listNode en array para poder ser iterado
    const cbs_hijos_procesos = [...document.querySelectorAll('.cb-hijo-proceso')];
    const algun_cb_hijo_checked = cbs_hijos_procesos.some(cb => cb.checked);
    return algun_cb_hijo_checked;
}

const actualizar_pagos_validos = () => {
    validar_inputs_numero_es_entero();
    evento_cb_maestro_todos_procesos();
    document.querySelector('#btn-actualizar-pagos-validos').onclick = async () => {
        try {
            const inputs_validar = document.querySelectorAll('.input-validar');

            const data = {
                fecha_inicio: '',
                fecha_fin: '',
                plaza_id: '',
                servicio_id: '',
                ids_procesos: '',
                dias: ''
            };

            for (const input of inputs_validar) {
                const input_msg_alert = input.nextElementSibling;
                if (input.value.trim() != '') {
                    input_msg_alert.style.display = 'none';
                    data[input.name] = input.value;
                    continue;
                }
                input_msg_alert.textContent = "El campo es requerido";
                input_msg_alert.style.display = 'block';
                return;
            }

            // Validar los cb de ids_proceso
            const algun_cb_hijo_proceso_verdadero = validar_cb_hijos_proceso();
            const msg_alerta_ids_procesos = document.querySelector('.msg-alerta-ids-proceso');

            if (!algun_cb_hijo_proceso_verdadero) {
                msg_alerta_ids_procesos.textContent = 'Debe seleccionar por lo menos un proceso'
                msg_alerta_ids_procesos.style.display = 'block';
                return;
            }

            msg_alerta_ids_procesos.style.display = 'none';

            const cb_hijos_proceso = [...document.querySelectorAll('.cb-hijo-proceso')].filter(cb => {
                if(cb.checked) {
                   return cb;
                }
            });
            
            const ids_procesos_checked = cb_hijos_proceso.map(cb => cb.value);
            data['ids_procesos'] = ids_procesos_checked.join(',');
            
            // Open loading
            const loading = document.querySelector('.content-loading');
            loading.classList.remove('d-none');
            // Va itercalando dinámicamente el mensaje de loading
            const loagin_dynamic = setInterval(loading_hope, 10000);
            
            const response = await fetch(`${base_url}api/funciones/pagos_validos`, {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/x-www-form-urlencoded',
                    "auth-token": token, 
                },
                body: new URLSearchParams(data)
            });

            const result = await response.json();
            // Mataer el setTimeout del loading de espera
            clearInterval(loagin_dynamic);
            loading.classList.add('d-none');
            // Se esconde ventana modal
            document.querySelector('.modal-pagos-validos').style.display = 'none';
            const data_mensaje = { msg: result.msg, url: '/funciones/interno' };
            mensaje_exito(data_mensaje);
        } catch (error) {
            console.log(error);
        }
    }
}

const modal_carta_invitacion = () => {
    if (document.querySelector('.modal-card-fn')) {
        document.querySelector('.modal-card-fn').remove();
    }
    const content_modal = document.createElement('DIV');
    content_modal.classList.add('modal', 'modal-form', 'fade', 'modal-carta-invitacion', 'modal-card-fn');
    content_modal.setAttribute('tabindex', -1);
    content_modal.setAttribute('aria-labelledby', 'modal-carta-invitacion');
    content_modal.setAttribute('aria-hidden', true);

    const options_html = construir_tag_options();
    const { tag_options_plazas, tag_options_servicios } = options_html;

    // Descartar la plaza Zinacantepec (porque esa no cuenta con cartas invitacion)
    const index_found = tag_options_plazas.findIndex(option_html => option_html.includes('Zinacantepec'));
    tag_options_plazas.splice(index_found, 1);

    content_modal.innerHTML = `
        <div class="modal-dialog" style="min-width: 630px;">
            <form>
                <div class="modal-content">
                    <div class="modal-header bg-blue-sys text-white" style="border-bottom: none !important;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                            <path
                                fill="#269355"
                                d="M21.03 6.29L12 .64L2.97 6.29C2.39 6.64 2 7.27 2 8v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-.73-.39-1.36-.97-1.71M20
                                18H4v-8l8 5l8-5v8m-8-5L4 8l8-5l8 5l-8 5Z"
                            />
                        </svg>
                        <h5 class="modal-title ms-2" id="modal-carta-invitacion-label">Carta Invitación</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body bg-blue-sys">
                        <div class="row">
                            <div class="col-6 mb-4">
                                <label for="fecha-inicio" class="form-label text-white">Fecha Inicio:</label>
                                <input class="form-control date-fn input-validar" type="date" aria-label="fecha-inicio" name="fecha_inicio">
                                <div class="invalid-feedback"></div>
                            </div>
                            <div class="col-6 mb-4">
                                <label for="fecha-fin" class="form-label text-white">Fecha Fin:</label>
                                <input class="form-control date-fn input-validar" type="date" aria-label="fecha-fin" name="fecha_fin">
                                <div class="invalid-feedback"></div>
                            </div>
                            <div class="col-6">
                                <div class="input-group">
                                    <label class="input-group-text" for="input-plaza">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                                            <path
                                                fill="#269355"
                                                d="M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5M12 2a7 7
                                                0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z"
                                            />
                                        </svg>
                                    </label>
                                    <select class="form-select cr-pointer input-validar" name="plaza_id">
                                        <option value="" selected="" disabled="">Seleccione una plaza</option>
                                        ${tag_options_plazas.join('')}
                                    </select>
                                    <div class="invalid-feedback"></div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="input-group">
                                    <label class="input-group-text" for="input-plaza">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                                            <path
                                                fill="#269355"
                                                d="M9.335 11.502h2.17a4.5 4.5 0 0 1 4.5 4.5H9.004v1h8v-1a5.578 5.578 0 0 0-.885-3h2.886a5 5
                                                0 0 1 4.516 2.852c-2.365 3.121-6.194 5.149-10.516 5.149c-2.761 0-5.1-.59-7-1.625v-9.304a6.966
                                                6.966 0 0 1 3.33 1.428Zm-4.33 7.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h2a1 1 0 0 1
                                                1 1v9Zm13-14a3 3 0 1 1 0 6.001a3 3 0 0 1 0-6Zm-7-3a3 3 0 1 1 0 6.001a3 3 0 0 1 0-6Z"
                                            />
                                        </svg>
                                    </label>
                                    <select class="form-select cr-pointer input-validar" name="servicio_id">
                                        <option value="" selected="" disabled="">Seleccione un servicio</option>
                                        ${tag_options_servicios.join('')}
                                    </select>
                                    <div class="invalid-feedback"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer bg-blue-sys" style="padding: 0.5rem 1rem; border-top: none !important;">
                        <a href="#" role="button" class="btn button-principal btn-sm" id="btn-actualizar-carta-invitacion">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 20 20">
                                <path
                                    fill="white"
                                    d="M10.2 3.28c3.53 0 6.43 2.61 6.92 6h2.08l-3.5 4l-3.5-4h2.32a4.439 4.439 0 0 0-4.32-3.45c-1.45 0-2.73.71-3.54 1.78L4.95
                                    5.66a6.965 6.965 0 0 1 5.25-2.38zm-.4 13.44c-3.52 0-6.43-2.61-6.92-6H.8l3.5-4c1.17 1.33 2.33 2.67 3.5 4H5.48a4.439 4.439
                                    0 0 0 4.32 3.45c1.45 0 2.73-.71 3.54-1.78l1.71 1.95a6.95 6.95 0 0 1-5.25 2.38z">
                                </path>
                            </svg>
                            Actualizar datos
                        </a>
                    </div>
                </div>
            </form>
        </div>
    `;

    const modal_carta_invitacion = new bootstrap.Modal(content_modal);
    modal_carta_invitacion.show();
    content_modal.addEventListener('shown.bs.modal', actualizar_carta_invitacion);
}

const tag_opciones_procesos = () => {
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

const modal_pagos_validos = () => {
    try {
        // Obtener la últime fecha de actualizacion de 

        if (document.querySelector('.modal-card-fn')) {
            document.querySelector('.modal-card-fn').remove();
        }
        const content_modal = document.createElement('DIV');
        content_modal.classList.add('modal', 'modal-form', 'fade', 'modal-pagos-validos', 'modal-card-fn');
        content_modal.setAttribute('tabindex', -1);
        content_modal.setAttribute('aria-labelledby', 'modal-pagos-validos');
        content_modal.setAttribute('aria-hidden', true);
    
        const options_html = construir_tag_options();
        const { tag_options_plazas, tag_options_servicios } = options_html;

        const procesos = tag_opciones_procesos();
    
        // Descartar la plaza Zinacantepec y Naucalpan, porque no cuentas con Pagos Validados
        const index_found_zinancantepec = tag_options_plazas.findIndex(option_html => option_html.includes('value="1"'));
        const index_found_naucalpan = tag_options_plazas.findIndex(option_html => option_html.includes('value="4"'));
        tag_options_plazas.splice(index_found_zinancantepec, 1);
        tag_options_plazas.splice(index_found_naucalpan, 1);
    
        content_modal.innerHTML = `
            <div class="modal-dialog" style="min-width: 630px;">
                <form>
                    <div class="modal-content">
                        <div class="modal-header bg-blue-sys text-white" style="border-bottom: none !important;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 14 14">
                                <g fill="none" stroke="#269355" stroke-linecap="round" stroke-linejoin="round">
                                    <path
                                        d="M8.62 1.59L3.6.51a.49.49 0 0 0-.6.37L1.64 7.29L.63 12a.49.49 0 0 0 .37.58l1.2.26a.49.49
                                        0 0 0 .58-.38l1-4.68l3.44.74a3.52 3.52 0 0 0 4.26-3.43a3.59 3.59 0 0 0-2.86-3.5ZM7.26 6.25l-3-.65l.55-2.6l3
                                        .65a1.32 1.32 0 0 1-.56 2.58Z"/><path d="m5.16 13.5l.62-2.9l3 .63c2.24.49 4.6-1.86 4.63-4.29a3.62 3.62 0 0 0-.2-1.19"
                                    />
                                </g>
                            </svg>
                            <h5 class="modal-title ms-2" id="modal-pagos-validos-label">Pagos Válidos</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body bg-blue-sys">
                            <div class="row">
                                <div class="col-6 mb-4">
                                    <label for="fecha-inicio" class="form-label text-white">Fecha Inicio:</label>
                                    <input class="form-control date-fn input-validar" type="date" aria-label="fecha-inicio" name="fecha_inicio">
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="col-6 mb-4">
                                    <label for="fecha-fin" class="form-label text-white">Fecha Fin:</label>
                                    <input class="form-control date-fn input-validar" type="date" aria-label="fecha-fin" name="fecha_fin">
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="col-6 mb-4">
                                    <div class="input-group">
                                        <label class="input-group-text" for="input-group">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                                                <path
                                                    fill="#269355"
                                                    d="M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5
                                                    2.5M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z"
                                                />
                                            </svg>
                                        </label>
                                        <select class="form-select cr-pointer input-validar" name="plaza_id">
                                            <option value="" selected="" disabled="">Seleccione una plaza</option>
                                            ${tag_options_plazas.join('')}
                                        </select>
                                        <div class="invalid-feedback"></div>
                                    </div>
                                </div>
                                <div class="col-6 mb-4">
                                    <div class="input-group">
                                        <label class="input-group-text" for="input-group">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                                                <path
                                                    fill="#269355"
                                                    d="M9.335 11.502h2.17a4.5 4.5 0 0 1 4.5 4.5H9.004v1h8v-1a5.578 5.578 0 0 0-.885-3h2.886a5 5
                                                    0 0 1 4.516 2.852c-2.365 3.121-6.194 5.149-10.516 5.149c-2.761 0-5.1-.59-7-1.625v-9.304a6.966
                                                    6.966 0 0 1 3.33 1.428Zm-4.33 7.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h2a1 1 0 0 1
                                                    1 1v9Zm13-14a3 3 0 1 1 0 6.001a3 3 0 0 1 0-6Zm-7-3a3 3 0 1 1 0 6.001a3 3 0 0 1 0-6Z"
                                                />
                                            </svg>
                                        </label>
                                        <select class="form-select cr-pointer input-validar" name="servicio_id">
                                            <option value="" selected="" disabled="">Seleccione un servicio</option>
                                            ${tag_options_servicios.join('')}
                                        </select>
                                        <div class="invalid-feedback"></div>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="input-group">
                                        <label class="input-group-text" for="input-group">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 2048 2048">
                                                <path
                                                    fill="#269355"
                                                    d="M837 844q-23 37-53 67t-68 54l51 124l-118 48l-51-123q-40 10-86 10t-86-10l-51
                                                    123l-118-48l51-124q-37-23-67-53t-54-68L63 895L15 777l123-51q-10-40-10-86t10-86L15
                                                    503l48-118l124 51q46-75 121-121l-51-124l118-48l51 123q40-10 86-10t86 10l51-123l118
                                                    48l-51 124q75 46 121 121l124-51l48 118l-123 51q10 40 10 86t-10 86l123 51l-48
                                                    118l-124-51zm-325 52q53 0 99-20t82-55t55-81t20-100q0-53-20-99t-55-82t-81-55t-100-20q-53
                                                    0-99 20t-82 55t-55 81t-20 100q0 53 20 99t55 82t81 55t100 20zm1408 448q0 55-14 111l137 56l-48
                                                    119l-138-57q-59 98-156 156l57 137l-119 49l-56-137q-56 14-111 14t-111-14l-56
                                                    137l-119-49l57-137q-98-58-156-156l-138 57l-48-119l137-56q-14-56-14-111t14-111l-137-56l48-119l138
                                                    57q58-97 156-156l-57-138l119-48l56 137q56-14 111-14t111 14l56-137l119 48l-57 138q97 59 156
                                                    156l138-57l48 119l-137 56q14 56 14 111zm-448 320q66 0
                                                    124-25t101-68t69-102t26-125q0-66-25-124t-69-101t-102-69t-124-26q-66 0-124 25t-102 69t-69 102t-25
                                                    124q0 66 25 124t68 102t102 69t125 25z"
                                                />
                                            </svg>
                                        </label>
                                        <div class="dropdown">
                                            <button
                                                class="dropdown-toggle procesos-select input-group-text"
                                                style="border-top-left-radius: 0px; border-bottom-left-radius: 0px;"
                                                type="button"
                                                data-bs-auto-close="outside"
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                            >
                                                Seleccione un proceso
                                            </button>
                                            <ul class="dropdown-menu cb-procesos">
                                                <li>
                                                    <a class="dropdown-item" href="#">
                                                        <input class="form-check-input" type="checkbox" value="todos-procesos">
                                                        <label class="form-check-label" for="todos-procesos">
                                                            Seleccionar todos
                                                        </label>
                                                    </a>
                                                </li>
                                                ${procesos.join('')}
                                            </ul>
                                        </div>
                                    </div>
                                    <div class="invalid-feedback msg-alerta-ids-proceso"></div>
                                </div>
                                <div class="col-6">
                                    <div class="input-group">
                                        <span class="input-group-text">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 20 20">
                                                <g fill="#269355">
                                                    <path
                                                        d="M5.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75
                                                        0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V12ZM6 13.25a.75.75 0 0 0-.75.75v.01c0
                                                        .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H6ZM7.25
                                                        12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H8a.75.75
                                                        0 0 1-.75-.75V12ZM8 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75
                                                        0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H8ZM9.25 10a.75.75 0 0 1 .75-.75h.01a.75.75
                                                        0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V10Zm.75 1.25a.75.75
                                                        0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H10ZM9.25
                                                        14a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V14ZM12
                                                        9.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V10a.75.75 0 0 0-.75-.75H12ZM11.25
                                                        12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H12a.75.75 0 0
                                                        1-.75-.75V12Zm.75 1.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0
                                                        .75-.75V14a.75.75 0 0 0-.75-.75H12ZM13.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1
                                                        .75.75v.01a.75.75 0 0 1-.75.75H14a.75.75 0 0 1-.75-.75V10Zm.75 1.25a.75.75 0 0 0-.75.75v.01c0
                                                        .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H14Z"
                                                    />
                                                    <path
                                                        fill-rule="evenodd"
                                                        d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1
                                                        18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75
                                                        0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0
                                                        .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
                                                        clip-rule="evenodd"
                                                    />
                                                </g>
                                            </svg>
                                        </span>
                                        <input class="form-control input-validar" type="number" aria-label="dias" name="dias" value="120">
                                        <span class="input-group-text">dias</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer bg-blue-sys" style="padding: 0.5rem 1rem; border-top: none !important;">
                            <a href="#" role="button" class="btn button-principal btn-sm" id="btn-actualizar-pagos-validos">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 20 20">
                                    <path
                                        fill="white"
                                        d="M10.2 3.28c3.53 0 6.43 2.61 6.92 6h2.08l-3.5 4l-3.5-4h2.32a4.439 4.439 0 0 0-4.32-3.45c-1.45
                                        0-2.73.71-3.54 1.78L4.95 5.66a6.965 6.965 0 0 1 5.25-2.38zm-.4 13.44c-3.52 0-6.43-2.61-6.92-6H.8l3.5-4c1.17
                                        1.33 2.33 2.67 3.5 4H5.48a4.439 4.439 0 0 0 4.32 3.45c1.45 0 2.73-.71 3.54-1.78l1.71 1.95a6.95 6.95 0 0 1-5.25 2.38z"
                                    >
                                    </path>
                                </svg>
                                Actualizar datos
                            </a>
                        </div>
                    </div>
                </form>
            </div>
        `;
    
        const modal_carta_invitacion = new bootstrap.Modal(content_modal);
        modal_carta_invitacion.show();
        content_modal.addEventListener('shown.bs.modal', actualizar_pagos_validos);
    } catch (error) {
        console.log(error);
    }
}

const ventanas_modales = {
    modal_adeudo_rezago,
    modal_carta_invitacion,
    modal_pagos_validos,
};

btns_abrir_modales.forEach(btn_abrir_modal => {
    btn_abrir_modal.addEventListener("click", e => {
        ventanas_modales[e.target.closest('a').dataset.modal]();
    });
});

window.addEventListener('DOMContentLoaded', get_catalogos);