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
        const { plazas, servicios } = result;

        // Almacenar datos en el localStorage
        local_storage.setItem('plazas', JSON.stringify(plazas));
        local_storage.setItem('servicios', JSON.stringify(servicios));
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
                            <g fill="white">
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
                        <h5 class="modal-title ms-2" id="modal-adeudo-rezago-label">Adeudo rezago</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body bg-blue-sys">
                        <div class="row">
                            <div class="col-6">
                                <div class="input-group">
                                    <div class="btn btn-light btn-outline-light" style="cursor: initial; border-right: 1px solid #e0e0e0;">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                                            <path
                                                fill="#254061"
                                                d="M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5M12 2a7 7
                                                0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z"
                                            />
                                        </svg>
                                    </div>
                                    <select class="form-select cr-pointer input-validar" name="plaza_id">
                                        <option value="" selected="" disabled="">Seleccione una plaza</option>
                                        ${tag_options_plazas.join('')}
                                    </select>
                                    <div class="invalid-feedback"></div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="input-group">
                                    <div class="btn btn-light btn-outline-light" style="cursor: initial; border-right: 1px solid #e0e0e0;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                                        <path
                                            fill="#254061"
                                            d="M9.335 11.502h2.17a4.5 4.5 0 0 1 4.5 4.5H9.004v1h8v-1a5.578 5.578 0 0 0-.885-3h2.886a5 5
                                            0 0 1 4.516 2.852c-2.365 3.121-6.194 5.149-10.516 5.149c-2.761 0-5.1-.59-7-1.625v-9.304a6.966
                                            6.966 0 0 1 3.33 1.428Zm-4.33 7.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h2a1 1 0 0 1
                                            1 1v9Zm13-14a3 3 0 1 1 0 6.001a3 3 0 0 1 0-6Zm-7-3a3 3 0 1 1 0 6.001a3 3 0 0 1 0-6Z"
                                        />
                                    </svg>
                                    </div>
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
                                fill="white"
                                d="M21.03 6.29L12 .64L2.97 6.29C2.39 6.64 2 7.27 2 8v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-.73-.39-1.36-.97-1.71M20
                                18H4v-8l8 5l8-5v8m-8-5L4 8l8-5l8 5l-8 5Z"
                            />
                        </svg>
                        <h5 class="modal-title ms-2" id="modal-carta-invitacion-label">Cata Invitación</h5>
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
                                    <div class="btn btn-light btn-outline-light" style="cursor: initial; border-right: 1px solid #e0e0e0;">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                                            <path
                                                fill="#254061"
                                                d="M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5M12 2a7 7
                                                0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z"
                                            />
                                        </svg>
                                    </div>
                                    <select class="form-select cr-pointer input-validar" name="plaza_id">
                                        <option value="" selected="" disabled="">Seleccione una plaza</option>
                                        ${tag_options_plazas.join('')}
                                    </select>
                                    <div class="invalid-feedback"></div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="input-group">
                                    <div class="btn btn-light btn-outline-light" style="cursor: initial; border-right: 1px solid #e0e0e0;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                                        <path
                                            fill="#254061"
                                            d="M9.335 11.502h2.17a4.5 4.5 0 0 1 4.5 4.5H9.004v1h8v-1a5.578 5.578 0 0 0-.885-3h2.886a5 5
                                            0 0 1 4.516 2.852c-2.365 3.121-6.194 5.149-10.516 5.149c-2.761 0-5.1-.59-7-1.625v-9.304a6.966
                                            6.966 0 0 1 3.33 1.428Zm-4.33 7.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h2a1 1 0 0 1
                                            1 1v9Zm13-14a3 3 0 1 1 0 6.001a3 3 0 0 1 0-6Zm-7-3a3 3 0 1 1 0 6.001a3 3 0 0 1 0-6Z"
                                        />
                                    </svg>
                                    </div>
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

const ventanas_modales = {
    modal_adeudo_rezago,
    modal_carta_invitacion
};

btns_abrir_modales.forEach(btn_abrir_modal => {
    btn_abrir_modal.addEventListener("click", e => {
        ventanas_modales[e.target.closest('a').dataset.modal]();
    });
});

window.addEventListener('DOMContentLoaded', get_catalogos);