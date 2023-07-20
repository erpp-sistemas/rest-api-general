import { mensaje_advertencia, mensaje_exito } from "./functions/mensajes.js";
import { evento_cerrar_modal_formulario } from "./functions/ventana_modal.js";

const btn_guardar_usuario = document.querySelector('#btn-guardar-usuario');
const btn_nuevo_usuario = document.querySelector('a[data-bs-target="#modal-usuario"]');
const titulo_modal_usuario = document.querySelector('#modal-usuario-label');

const input_usuario_id = document.querySelector('#input-usuario-id');
const inputs_form = document.querySelectorAll('.input-validar');

const tbody_usuarios = document.querySelector('.tbody-usuarios');
const paginacion_html = document.querySelector('.pagination'); 

const regex_email = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
let obj_usuario = {
    usuario_nombre: '',
    usuario_apellidos: '',
    usuario_direccion: '',
    usuario_nombre_usuario: '',
    usuario_email: '',
    usuario_cargo: '',
    grupo_usuario_id: '',
    usuario_password: '',
    validate_password: ''
};

const get_datos_usuario = async data => {
    try {
        const response = await fetch(`${base_url}api/usuario/obtener_datos_usuario`, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
                "auth-token": token, 
            }, 
            body: new URLSearchParams(data)
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.log(error);
    }
}

const modal_editar_usuario = async e => {
    try {
        titulo_modal_usuario.textContent = 'Editar usuario';
        btn_guardar_usuario.dataset.fnExecute = "editar_usuario";
    
        const tag_tr_usuario = e.target.closest('tr').firstElementChild;
        input_usuario_id.value = tag_tr_usuario.getAttribute('usuario-id');
    
        const data_usuario = { usuario_id: input_usuario_id.value };
        const result = await get_datos_usuario(data_usuario);
        
        const { usuario } = result;
        // Insertar los datos del usuario a editar en el formulario
        for (const [llave, valor] of Object.entries(usuario[0])) {
            if (llave === 'grupo_usuario_id') {
                /**
                 * En el selector de grupo_usuario,
                 * se selecciona el grupo_usuario al que pertenece el usuario
                */
                const select_grupo_usuario = document.querySelector(`select[name="${llave}"]`);
                const options = [...select_grupo_usuario.options];
                const [option_selected] = options.filter(option => option.value == valor);
                select_grupo_usuario.selectedIndex = option_selected.index;
            }

            const input_selected = document.querySelector(`input[name="${llave}"]`);
            // Continua con la siguiente iteración si el input a seleccionar no existe
            if (!input_selected) continue;
            input_selected.value = valor;
        }

        // Cambiar el placeholder del input contraseña
        const input_password = document.querySelector('.input-password');
        input_password.value = '';
        input_password.placeholder = 'Contraseña (Opcional)';
    } catch (error) {
        console.log(error);
    }
}

const eliminar_usuario = async data => {
    try {
        const response = await fetch(`${base_url}api/usuario/eliminar_usuario`, {
            method: 'PUT',
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
                "auth-token": token, 
            }, 
            body: new URLSearchParams(data)
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.log(error);
    }
}

const alerta_eliminar_usuario = e => {
    const td_usuario = e.target.closest('tr').firstElementChild;

    const data_confirm = {
        text: `¿Estás seguro de eliminar el usuario ${td_usuario.textContent.trim()}?`,
        confirm_button_text: 'Sí, eliminar',
        cancel_button_text:'Cancelar'
    };

    mensaje_advertencia(data_confirm)
        .then(result => {
            // Se obtiene el boton del mensaje de alerta, se obtine de esta manera
            // ya que se hace usando promise
            const { msg_alerta } = result;
            msg_alerta.querySelector('.boton-confirmacion').onclick = async () => {
                try {
                    const data = {
                        usuario_id: td_usuario.getAttribute('usuario-id')
                    };
                    let result = await eliminar_usuario(data);
                    result = { ...result, url: '/usuarios' };
                    msg_alerta.style.display = "none";
                    mensaje_exito(result);
                } catch (error) {
                    console.log(error);
                }
            }
        });   
}

const construir_paginacion = data => {
    // const { btn_previous, btn_next, paginas } = data;
    const { pagina_actual, total_paginas, limite_inferior, limite_superior } = data;

    // Construir la paginación
    const btn_previous = pagina_actual != 1
        ? '<li class="page-item"><a class="page-link" href="#!" aria-label="previous"><span aria-hidden="true">&laquo;</span></a></li>'
        : '<li class="page-item d-none"><a class="page-link" href="#!" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>'
    ;

    const btn_next = pagina_actual != total_paginas
        ? '<li class="page-item"><a class="page-link" href="#!" aria-label="next"><span aria-hidden="true">&raquo;</span></a></li>'
        : '<li class="page-item d-none"><a class="page-link" href="#!" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>'
    ;

    let paginas = [];
    for (let pagina = limite_inferior; pagina <= limite_superior; pagina++) {
        if (pagina == pagina_actual) {
            paginas = [
                ...paginas,
                `<li class="page-item"><a class="page-link button-principal-blue" href="#!" data-pagina="${pagina}">${pagina}</a></li>`
            ];
            continue;
        }
        
        paginas = [
            ...paginas,
            `<li class="page-item"><a class="page-link" href="#!" data-pagina="${pagina}">${pagina}</a></li>`
        ];
    }

    paginacion_html.insertAdjacentHTML('beforeend', btn_previous);
    paginacion_html.insertAdjacentHTML('beforeend', paginas.join(''));
    paginacion_html.insertAdjacentHTML('beforeend', btn_next);

    document.querySelectorAll('.page-item').forEach(pagina_html => {
        pagina_html.onclick = () => cambiar_de_pagina(pagina_html); 
    });

    const btns_editar_usuarios = document.querySelectorAll('.editar-usuario');
    const btns_eliminar_usuario = document.querySelectorAll('.eliminar-usuario');

    btns_editar_usuarios.forEach(btn_editar_usuario => { btn_editar_usuario.onclick = modal_editar_usuario });
    btns_eliminar_usuario.forEach(btn_eliminar_usuario => { btn_eliminar_usuario.onclick = alerta_eliminar_usuario });
}

const mostrar_registros_usuarios = async data => {
    try {
        // Resetear paginación
        while (paginacion_html.firstChild) {
            paginacion_html.firstChild.remove();
        }

        const response = await fetch(`${base_url}api/usuario/registros_usuarios`, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
                "auth-token": token, 
            }, 
            body: new URLSearchParams(data)
        });
        const result = await response.json();
        const { usuarios, permisos_acciones } = result;       

        const tags_tr_usuarios = usuarios.map(usuario => {
            const tr_table_html = `
                <tr>
                    <td usuario-id="${usuario.usuario_id}">${usuario.usuario_nombre_usuario}</td>
                    <td>${usuario.nombre_completo}</td>
                    <td>${usuario.usuario_cargo}</td>
                    <td>${usuario.usuario_email}</td>
                    <td>${usuario.usuario_direccion}</td>
                    <td>${usuario.grupo_usuario_nombre}</td>
                    <td>
                        <a
                            href="#"
                            class="d-inline-block text-blue-sys editar-usuario ${permisos_acciones['editar'] ?? 'd-none'}"
                            data-bs-toggle="modal"
                            data-toggle="tooltip"
                            data-bs-target="#modal-usuario"
                            data-bs-placement="right"
                            data-bs-title="Editar"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84
                                    1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25Z"
                                />
                            </svg>
                        </a>
                        <a
                            href="#"
                            class="d-inline-block text-blue-sys eliminar-usuario ${permisos_acciones['eliminar'] ?? 'd-none'}"
                            data-toggle="tooltip"
                            data-bs-placement="right"
                            data-bs-title="Eliminar"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="M12 4c-4.419 0-8 3.582-8 8s3.581 8 8 8s8-3.582 8-8s-3.581-8-8-8zm3.707
                                    10.293a.999.999 0 1 1-1.414 1.414L12 13.414l-2.293 2.293a.997.997 0 0 1-1.414
                                    0a.999.999 0 0 1 0-1.414L10.586 12L8.293 9.707a.999.999 0 1 1 1.414-1.414L12
                                    10.586l2.293-2.293a.999.999 0 1 1 1.414 1.414L13.414 12l2.293 2.293z"
                                />
                            </svg>
                        </a>
                    </td>
                </tr>
            `;
            return tr_table_html;
        });

        tbody_usuarios.innerHTML = tags_tr_usuarios.join('');
        construir_paginacion(result);
    } catch (error) {
        console.log(error);
    }
}

const cambiar_de_pagina = async pagina_html => {
    try {
        let pagina_a_mostrar = 1;
        const pagina_tag_a = pagina_html.querySelector('.page-link');
        
        // Se almacena el número de la pagina a la que se da click
        if (!pagina_tag_a.getAttribute('aria-label')) {
            pagina_a_mostrar = pagina_tag_a.dataset.pagina;
        }
        
        // Se almacena el número de la pagina cuando se da click en el btn de avanzar página
        const pagina_actual = document.querySelector('.page-link.button-principal-blue').dataset.pagina;
        
        if (pagina_tag_a.getAttribute('aria-label') == 'next') {
            pagina_a_mostrar = parseInt(pagina_actual) + 1;
        }
        
        // Se almacena el número de la pagina cuando se da click en el btn de retroceder página
        if (pagina_tag_a.getAttribute('aria-label') == 'previous') {
            pagina_a_mostrar = parseInt(pagina_actual) - 1;
        }

        await mostrar_registros_usuarios({ pagina: pagina_a_mostrar });
    } catch (error) {
        console.log(error);
    }
}

const cargar_funciones_principales = async () => {
    try {
        await mostrar_registros_usuarios({ pagina: 1 });
    } catch (error) {
        console.log(error);
    }
}


/**
 * @author David Demetrio López Paz
 * Fecha creación: 11 de Julio de 2023
 * Descripción:
 *      Se utiliza la misma ventana modal que para editar usuario,
 *      solo que el titulo del modal se sustituye por "Nuevo usuario"
 *      y el input tiene un value inicial vacío.
 * @params ninguno
*/
const modal_nuevo_usuario = () => {
    titulo_modal_usuario.textContent = 'Nuevo usuario';
    btn_guardar_usuario.dataset.fnExecute = "guardar_nuevo_usuario";
    const input_password = document.querySelector('.input-password');
    input_password.value = '';
    input_password.placeholder = 'Contraseña';
}

const validar_formulario = () => {
    // Reset inputs del formulario
    inputs_form.forEach(input_form => {
        input_form.nextElementSibling.style.display = 'none';
        input_form.nextElementSibling.textContent = '';
    });

    for (const input_form of inputs_form) {
        if (input_form.value.trim() === '' && (input_form.name == 'usuario_nombre' || input_form.name == 'usuario_apellidos' || input_form.name == 'usuario_nombre_usuario' || input_form.name == 'grupo_usuario_id' || input_form.name == 'usuario_password')) {
            input_form.nextElementSibling.style.display = 'block';
            input_form.nextElementSibling.textContent = 'El campo es requerido';
            return false;
        }

        if (input_form.type === 'email' && input_form.value.trim() !== '' && !regex_email.test(input_form.value.trim())) {
            input_form.nextElementSibling.style.display = 'block';
            input_form.nextElementSibling.textContent = 'Ingresa un e-mail válido';
            return false;
        }

        const password = document.querySelector('.input-password');
        const password_validate = document.querySelector('.input-password-validate');

        if (password.value != password_validate.value) {
            password.nextElementSibling.style.display = 'block';
            password.nextElementSibling.textContent = 'Las contraseñas no son iguales';
            return false;
        }
        
        if (password.value.length < 6 || password_validate.value.length < 6) {
            password.nextElementSibling.style.display = 'block';
            password.nextElementSibling.textContent = 'Las contraseñas deben ser mínimo de 6 caracteres';
            return false;
        }
    }
    return true;
}

const validar_formulario_editar = () => {
    // Reset inputs del formulario
    inputs_form.forEach(input_form => {
        input_form.nextElementSibling.style.display = 'none';
        input_form.nextElementSibling.textContent = '';
    });

    for (const input_form of inputs_form) {
        if (input_form.value.trim() === '' && (input_form.name === 'usuario_nombre' || input_form.name === 'usuario_apellidos' || input_form.name === 'usuario_nombre_usuario' || input_form.name === 'grupo_usuario_id')) {
            input_form.nextElementSibling.style.display = 'block';
            input_form.nextElementSibling.textContent = 'El campo es requerido';
            return false;
        }

        if (input_form.type === 'email' && input_form.value.trim() !== '' && !regex_email.test(input_form.value.trim())) {
            input_form.nextElementSibling.style.display = 'block';
            input_form.nextElementSibling.textContent = 'Ingresa un e-mail válido';
            return false;
        }

        const password = document.querySelector('.input-password');
        const password_validate = document.querySelector('.input-password-validate');
        if ((password.value !== '' || password_validate.value !== '') && password.value != password_validate.value) {
            password.nextElementSibling.style.display = 'block';
            password.nextElementSibling.textContent = 'Las contraseñas no son iguales';
            return false;
        }
        
        if ((password.value !== '' || password_validate.value !== '') && (password.value.length < 6 || password_validate.value.length < 6)) {
            password.nextElementSibling.style.display = 'block';
            password.nextElementSibling.textContent = 'Las contraseñas deben ser mínimo de 6 caracteres';
            return false;
        }
    }
    return true;
}

const guardar_nuevo_usuario = async () => {
    try {
        const esta_validado = validar_formulario();
        if (!esta_validado) return;

        inputs_form.forEach(input_form => {
            obj_usuario[input_form.name] = input_form.value;
        });

        const response = await fetch(`${base_url}api/usuario/nuevo_usuario`, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
                "auth-token": token, 
            }, 
            body: new URLSearchParams(obj_usuario)
        });
        const result = await response.json();
        const { msg, error } = result;

        if (error) {
            const input_nombre_usuario = document.querySelector('input[name="usuario_nombre_usuario"]');
            input_nombre_usuario.nextElementSibling.style.display = "block";
            input_nombre_usuario.nextElementSibling.textContent = error;
            return;
        }

        document.querySelector('#modal-usuario').style.display = 'none';
        const data_mensaje = { msg: msg, url: '/usuarios' };
        mensaje_exito(data_mensaje);
    } catch (error) {
        console.log(error);
    }
}

const editar_usuario = async () => {
    try {
        let result_validacion = validar_formulario_editar();
        if (!result_validacion) return;

        inputs_form.forEach(input_form => {
            obj_usuario[input_form.name] = input_form.value;
        });

        obj_usuario = { ...obj_usuario, usuario_id: input_usuario_id.value };

        const response = await fetch(`${base_url}api/usuario/editar_usuario`, {
            method: 'PUT',
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
                "auth-token": token, 
            }, 
            body: new URLSearchParams(obj_usuario)
        });
        const result = await response.json();

        const { msg, error } = result;
        if (error) {
            const input_nombre_usuario = document.querySelector('input[name="usuario_nombre_usuario"]');
            input_nombre_usuario.nextElementSibling.style.display = "block";
            input_nombre_usuario.nextElementSibling.textContent = error;
            return;
        }

        document.querySelector('#modal-usuario').style.display = 'none';
        const data_mensaje = { msg: msg, url: '/usuarios' };
        mensaje_exito(data_mensaje);
    } catch (error) {
        console.log(error);
    }
}

const fn_ejecutar = { guardar_nuevo_usuario, editar_usuario };

evento_cerrar_modal_formulario();

btn_nuevo_usuario.addEventListener("click", modal_nuevo_usuario);
window.addEventListener('DOMContentLoaded', cargar_funciones_principales);
btn_guardar_usuario.addEventListener("click", () => {
    fn_ejecutar[btn_guardar_usuario.dataset.fnExecute]();
});