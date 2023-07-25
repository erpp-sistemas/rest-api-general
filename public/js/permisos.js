import { eventos_acordion } from "./functions/acordion.js";
import { mensaje_exito } from "./functions/mensajes.js";

const select_grupo_usuario = document.querySelector('#grupo-usuario');
const acordion_html = document.querySelector('#secciones-vista');
const tbody_accion_entidad = document.querySelector('#tbody-accion-entidad');
const btn_guardar_permisos_vistas = document.querySelector('#guardar-permisos-vistas');
const btn_guardar_permisos_acciones = document.querySelector('#guardar-permisos-acciones');

const mostrar_permisos_vistas = data => {
    const { vistas } = data;

    const acordion_item_html = vistas.map((vista, index) => {
        const { submodulos } = vista;
        
        const subvistas_cb_html = submodulos.map(submodulo => {
            return `
                <div class="form-check">
                    <input
                        class="form-check-input cb-check-v cb-hijo-${vista.modulo_id} cr-pointer"
                        type="checkbox"
                        value="${submodulo.submodulo_id}"
                        ${submodulo.checked}
                        data-fn="control_cb_hijo"
                        data-id-cb-parent="${vista.modulo_id}"
                    >
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
                                <input
                                    class="form-check-input cr-pointer cb-master"
                                    value="${vista.modulo_id}"
                                    type="checkbox"
                                    ${vista.checked}
                                    data-fn="control_cb_maestro"
                                >
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
                                <input
                                    class="form-check-input cr-pointer cb-check-v cb-master cb-master-${vista.modulo_id}"
                                    value="${vista.modulo_id}"
                                    type="checkbox"
                                    ${vista.checked}
                                    data-fn="control_cb_maestro"
                                >
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
                        <input class="form-check-input cb-accion" value="${accion.cat_accion_id}" type="checkbox" ${accion.checked}>
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

const control_cb_maestro = e => {
    const cb_hijos = document.querySelectorAll(`.cb-hijo-${e.target.value}`);
    if (!e.target.checked) {
        for (const cb_hijo of cb_hijos) {
            cb_hijo.checked = false;
        }
        return;
    }
    for (const cb_hijo of cb_hijos) {
        cb_hijo.checked = true;
    }
}

const control_cb_hijo = e => {
    const id_cb_master = e.target.dataset.idCbParent;

    const cb_hijos_html_list = document.querySelectorAll(`.cb-hijo-${id_cb_master}`);
    
    // Convertir un htmlList en un array para poder iterarlo
    const cb_hijos_array = [...cb_hijos_html_list];
    const all_cb_unchecked = cb_hijos_array.every(cb => !cb.checked);

    const cb_master = document.querySelector(`.cb-master-${id_cb_master}`);

    if (all_cb_unchecked) {
        cb_master.checked = false;
    } else {
        cb_master.checked = true;
    }
}

const funciones_cb_permisos_vistas = { control_cb_maestro, control_cb_hijo };

const eventos_cb_permisos_vistas = () => {
    document.querySelectorAll('.cb-check-v').forEach(cb => {
        cb.onclick = e => { funciones_cb_permisos_vistas[e.target.dataset.fn](e) }; 
    });
}

const mostrar_permisos_grupo_usuario = async data => {
    try {
        const response = await fetch(`${base_url}api/grupo_usuario/permisos_by_grupo_usuario`, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
                "auth-token": token, 
            },
            body: new URLSearchParams(data)
        });
        const result = await response.json();
        const { cat_grupo_usuario, grupo_usuario_id } = result;

        // Resetear selector de grupo usuario
        while (select_grupo_usuario.lastElementChild.value != '') {
            select_grupo_usuario.removeChild(select_grupo_usuario.lastElementChild);
        }

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
        eventos_cb_permisos_vistas();
        mostrar_permisos_acciones(result);
    } catch (error) {
        console.log(error);
    }
}

const guardar_permisos_vistas = async () => {
    try {
        // Construir objeto para guardar los permisos de grupo usuario
        const vistas = document.querySelectorAll('.cb-master');
        
        let permisos_vistas = [];
        let permisos_subvistas = [];
    
        for (const vista of vistas) {
            if (!vista.checked) continue;
            
            let obj_permiso_vista = { modulo_id: vista.value };
    
            const submodulos_array = [...document.querySelectorAll(`.cb-hijo-${vista.value}`)];
            
            for (const subvista of submodulos_array) {
                if (!subvista.checked) continue;
                permisos_subvistas = [...permisos_subvistas, { submodulo_id: subvista.value }];
            };

            permisos_vistas = [...permisos_vistas, obj_permiso_vista];
        }
    
        const data = {
            grupo_usuario_id: select_grupo_usuario.value,
            permisos_vistas: JSON.stringify(permisos_vistas),
            permisos_subvistas: JSON.stringify(permisos_subvistas)
        }

        const response = await fetch(`${base_url}api/grupo_usuario/editar_permiso_vistas`, {
            method: 'PUT',
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
                "auth-token": token, 
            }, 
            body: new URLSearchParams(data)
        });
        const result = await response.json();
        const data_mensaje = { msg: result.msg, url: '/grupo_usuario/permisos' };
        mensaje_exito(data_mensaje);
    } catch (error) {
        console.log(error);
    }
}

const guardar_permisos_acciones = async () => {
    try {
        const cb_acciones = document.querySelectorAll('.cb-accion');
    
        // Se construye arreglo de permisos accion-entidad
        let permisos_accion_entidad = [];
    
        for (const cb_accion of cb_acciones) {
            if (!cb_accion.checked) continue;
            const cat_entidad_id = cb_accion.closest('tr').dataset.catEntidadId;
    
            const accion_entidad_obj = {
                cat_entidad_id: cat_entidad_id,
                cat_accion_id: cb_accion.value
            };
    
            permisos_accion_entidad.push(accion_entidad_obj);
        }

        const data = {
            grupo_usuario_id: select_grupo_usuario.value,
            permisos_accion_entidad: JSON.stringify(permisos_accion_entidad)
        };

        const response = await fetch(`${base_url}api/grupo_usuario/editar_permiso_accion_entidad`, {
            method: 'PUT',
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
                "auth-token": token, 
            },
            body: new URLSearchParams(data)
        });
        const result = await response.json();
        mensaje_exito(result.msg);
    } catch (error) {
        console.log(error);
    }
}

btn_guardar_permisos_vistas.addEventListener('click', guardar_permisos_vistas);
btn_guardar_permisos_acciones.addEventListener('click', guardar_permisos_acciones)

select_grupo_usuario.addEventListener('change', e => {
    mostrar_permisos_grupo_usuario({ grupo_usuario_id: e.target.value });
});

window.addEventListener('DOMContentLoaded', () => {
    mostrar_permisos_grupo_usuario({ grupo_usuario_id: local_storage.getItem('grupo_usuario_id') });
});