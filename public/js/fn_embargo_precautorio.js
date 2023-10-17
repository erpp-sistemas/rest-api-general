import { construir_tag_options } from "./functions/build_options_html.js";
import { loading_hope } from "./functions/loading.js";
import { mensaje_exito } from "./functions/mensajes.js";

export const modal_embargo_precautorio = () => {
    if (document.querySelector('.modal-card-fn')) {
        document.querySelector('.modal-card-fn').remove();
    }
    const content_modal = document.createElement('DIV');
    content_modal.classList.add('modal', 'modal-form', 'fade', 'modal-embargo-precautorio', 'modal-card-fn');
    content_modal.setAttribute('tabindex', -1);
    content_modal.setAttribute('aria-labelledby', 'modal-embargo-precautorio');
    content_modal.setAttribute('aria-hidden', true);

    const options_html = construir_tag_options();
    const { tag_options_plazas, tag_options_servicios } = options_html;

    // Descartar todas las plazas, excepto Cuautitlán Izcalli
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
                        <h5 class="modal-title ms-2" id="modal-embargo-precautorio-label">Embargo Precautorio</h5>
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
                        <a href="#" role="button" class="btn button-principal btn-sm" id="btn-actualizar-embargo-precautorio">
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

    const modal = new bootstrap.Modal(content_modal);
    modal.show();
    content_modal.addEventListener('shown.bs.modal', actualizar_embargo_precautorio);
}

const actualizar_embargo_precautorio = () => {
    document.querySelector('#btn-actualizar-embargo-precautorio').onclick = async () => {
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
            
            const response = await fetch(`${base_url}api/funciones/embargo_precautorio`, {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/x-www-form-urlencoded',
                    "auth-token": token, 
                },
                body: new URLSearchParams(data)
            });

            const result = await response.json();
            if (result.error === 'token no es valido') {
                cerrar_sesion_token_expiro();
            }
            // Mataer el setTimeout del loading de espera
            clearInterval(loagin_dynamic);
            loading.classList.add('d-none');
            // Se esconde ventana modal
            document.querySelector('.modal-embargo-precautorio').style.display = 'none';
            const data_mensaje = { msg: result.msg, url: '/funciones/interno' };
            mensaje_exito(data_mensaje);
        } catch (error) {
            console.log(error);
        }
    }
}