import { mensaje_advertencia, mensaje_exito } from "./functions/mensajes.js";
import { evento_cerrar_modal_formulario } from "./functions/ventana_modal.js";

const btn_guardar_usuario = document.querySelector('#btn-guardar-usuario');
const btn_nuevo_usuario = document.querySelector('a[data-bs-target="#modal-usuario"]');
const titulo_modal_usuario = document.querySelector('#modal-usuario-label');
const btns_editar_usuarios = document.querySelectorAll('.editar-usuario');
const btns_eliminar_usuario = document.querySelectorAll('.eliminar-usuario');

const input_usuario_id = document.querySelector('#input-usuario-id');
const inputs_form = document.querySelectorAll('.input-validar');

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

const mostrar_registros_usuarios = async data => {
    try {
        console.log("INSERT ROWS USERS");
        const response = await fetch(`${base_url}api/usuario/registros_usuarios`, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
                "auth-token": token, 
            }, 
            body: new URLSearchParams(data)
        });
        const result = await response.json();
    } catch (error) {
        console.log(error);
    }
}

const cargar_funciones_principales = () => {
    // Obtener las propiedades del último registro de la tabla Grupos de usuario
    // const propiedades_tag_tr = document.querySelector('.table-group-divider').lastElementChild.getBoundingClientRect();
    /**
     * Permite hacer scroll automático hasta donde
     * está el último registro de la tabla de grupos de usuario.
    */
    // window.scrollTo(0, propiedades_tag_tr.y);

    mostrar_registros_usuarios({ pagina: 1 }); 

    /* btns_editar_usuarios.forEach(btn_editar_usuario => {
        btn_editar_usuario.addEventListener("click", modal_editar_usuario);
    }); */

    /* btns_eliminar_usuario.forEach(btn_eliminar_usuario => {
        btn_eliminar_usuario.addEventListener("click", alerta_eliminar_usuario);
    }); */
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
        if (input_form.value.trim() === '') {
            input_form.nextElementSibling.style.display = 'block';
            input_form.nextElementSibling.textContent = 'El campo es requerido';
            return false;
        }

        if (input_form.type === 'email' && !regex_email.test(input_form.value.trim())) {
            input_form.nextElementSibling.style.display = 'block';
            input_form.nextElementSibling.textContent = 'Ingresa un e-mail válido';
            return false;
        }

        const password = document.querySelector('.input-password');
        const password_validate = document.querySelector('.input-password-validate');

        if (password.value !== password_validate.value) {
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