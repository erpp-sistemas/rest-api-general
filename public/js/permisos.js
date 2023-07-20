import { eventos_acordion } from "./functions/acordion.js";

const select_grupo_usuario = document.querySelector('#grupo-usuario');
const acordion_html = document.querySelector('#secciones-vista');
const tbody_accion_entidad = document.querySelector('#tbody-accion-entidad');

const mostrar_permisos_vistas = data => {
    const { vistas } = data;

    const acordion_item_html = vistas.map((vista, index) => {
        const { submodulos } = vista;
        
        const subvistas_cb_html = submodulos.map(submodulo => {
            return `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" ${submodulo.checked}>
                    <label class="form-check-label">${submodulo.submodulo_nombre}</label>
                </div>
            `;
        });

        const vista_html = submodulos.length < 1
            ? `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <a href="#!" class="accordion-button collapsed seccion-acoordion cr-auto" type="button">
                            <div class="form-check">
                                <input class="form-check-input cr-pointer" value="${vista.modulo_id}" type="checkbox" ${vista.checked}>
                                <label class="form-check-label" for="cb-vista">${vista.modulo_nombre}</label>
                            </div>
                        </a>
                    </h2>
                </div>
            `
            : `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <a href="#!" class="accordion-button seccion-acoordion collapsed justify-content-between cr-auto" type="button">
                            <div class="form-check">
                                <input class="form-check-input cr-pointer" value="${vista.modulo_id}" type="checkbox" ${vista.checked}>
                                <label class="form-check-label" for="cd-vista">${vista.modulo_nombre}</label>
                            </div>
                            <div
                                class="arrow-seccion-acordion cr-pointer"
                                style="padding-bottom: 0.2rem;"
                                data-bs-toggle="collapse"
                                data-bs-target="#flush-collapseTwo-${index}"
                                aria-expanded="false"
                                aria-controls="flush-collapseTwo-${index}"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                                    <path
                                        fill="none"
                                        stroke="#254061"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="m10 17l5-5m0 0l-5-5"
                                    ></path>
                                </svg>
                            </div>
                        </a>
                    </h2>
                    <div id="flush-collapseTwo-${index}" class="accordion-collapse collapse" data-bs-parent="#secciones-vista">
                        <div class="accordion-body px-5">${subvistas_cb_html.join('')}</div>
                    </div>
                </div>
            `
        ;

        return vista_html;
    });

    acordion_html.innerHTML = acordion_item_html.join('');
}

const mostrar_permisos_acciones = data => {
    const { permisos_acciones } = data;

    const trs_entidad_html = permisos_acciones.map(entidad => {
        const { acciones } = entidad;

        const td_acciones_html = acciones.map(accion => {
            return `
                <td>
                    <div class="form-check d-flex justify-content-center">
                        <input class="form-check-input" value="${accion.cat_accion_id}" type="checkbox" ${accion.checked}>
                    </div>
                </td>
            `;
        });

        const tr_entidad = `
            <tr data-cat-entidad-id="${entidad.cat_entidad_id}">
                <th scope="row">${entidad.cat_entidad_nombre}</th>
                ${td_acciones_html.join('')}
            </tr>
        `;

        return tr_entidad;
    });

    tbody_accion_entidad.innerHTML = trs_entidad_html.join('');
}

const mostrar_permisos_grupo_usuario = async () => {
    try {
        const response = await fetch(`${base_url}api/grupo_usuario/permisos_by_grupo_usuario`, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
                "auth-token": token, 
            }
        });
        const result = await response.json();

        const { cat_grupo_usuario, grupo_usuario_id } = result;

        // Agregar al selector los grupo usuario
        const option_html = cat_grupo_usuario.map(grupo_usuario => {
            if (grupo_usuario.grupo_usuario_id == grupo_usuario_id) {
                return `<option value="${grupo_usuario.grupo_usuario_id}" selected>${grupo_usuario.grupo_usuario_nombre}</option>`
            }
            return `<option value="${grupo_usuario.grupo_usuario_id}">${grupo_usuario.grupo_usuario_nombre}</option>`
        });

        select_grupo_usuario.insertAdjacentHTML('beforeend', option_html.join(''));
        mostrar_permisos_vistas(result);
        eventos_acordion();
        mostrar_permisos_acciones(result);
    } catch (error) {
        console.log(error);
    }
}

window.addEventListener('DOMContentLoaded', mostrar_permisos_grupo_usuario);