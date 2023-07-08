import { mensaje_advertencia, mensaje_exito } from "./functions/mensajes.js";
import { evento_cerrar_modal_formulario } from "./functions/ventana_modal.js";

const btn_guardar_grupo_usuario = document.querySelector('#btn-guardar-grupo-usuario');
const btn_nuevo_grupo_usuario = document.querySelector('a[data-bs-target="#modal-grupo-usuario"]');
const titulo_modal_grupo_usuario = document.querySelector('#modal-grupo-usuario-label');
const btns_editar_grupos_usuario = document.querySelectorAll('.editar-grupo-usuario');
const btns_eliminar_grupos_usuario = document.querySelectorAll('.eliminar-grupo-usuario');

const input_grupo_usuario_id = document.querySelector('#input-grupo-usuario-id');
const input_grupo_usuario = document.querySelector('#input-grupo-usuario-nombre');
const msg_alert_input_grupo_usuario = document.querySelector('.invalid-feedback');


const validar_input_grupo_usuario = () => {
    if (input_grupo_usuario.value.trim() === '') {
        msg_alert_input_grupo_usuario.textContent = 'Ingresa un nombre';
        msg_alert_input_grupo_usuario.style.display = "block";
        return false;
    }
    
    msg_alert_input_grupo_usuario.style.display = "none";
    return { nombre_grupo_usuario: input_grupo_usuario.value.trim() };
}

const guardar_nuevo_grupo_usuario = async () => {
    try {
        const data = validar_input_grupo_usuario();
        
        if (!data) return;

        const response = await fetch(`${base_url}api/grupo_usuario/nuevo_grupo_usuario`, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
                "auth-token": token, 
            }, 
            body: new URLSearchParams(data)
        });
        const result = await response.json();
        const { msg, error } = result;
        
        if (error) {
            msg_alert_input_grupo_usuario.style.display = "block";
            msg_alert_input_grupo_usuario.textContent = error;
            return;
        }

        // Se esconde ventana modal
        document.querySelector('#modal-grupo-usuario').style.display = 'none';
        const data_mensaje = { msg: msg, url: '/grupo_usuario' };
        mensaje_exito(data_mensaje);
    } catch (error) {
        console.log(error);
    }
}

const editar_grupo_usuario = async () => {
    try {
        let data = validar_input_grupo_usuario();
        if (!data) return;
        data = { ...data, grupo_usuario_id: input_grupo_usuario_id.value };
        const response = await fetch(`${base_url}api/grupo_usuario/editar_grupo_usuario`, {
            method: 'PUT',
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
                "auth-token": token, 
            }, 
            body: new URLSearchParams(data)
        });
        const result = await response.json();
        const { msg, error } = result;

        if (error) {
            msg_alert_input_grupo_usuario.style.display = "block";
            msg_alert_input_grupo_usuario.textContent = error.msg;
            return;
        }

        // Se esconde ventana modal
        document.querySelector('#modal-grupo-usuario').style.display = 'none';
        const data_mensaje = { msg: msg, url: '/grupo_usuario' };
        mensaje_exito(data_mensaje);
    } catch (error) {
        console.log(error);
    }
}

/**
 * @author David Demetrio López Paz
 * Fecha creación: 05 de Julio de 2023
 * Descripción:
 *      Se utiliza la misma ventana modal que para editar usuario,
 *      solo que el titulo del modal se sustituye por "Nuevo grupo usuario"
 *      y el input tiene un value inicial vacío.
 * @params ninguno
*/
const modal_nuevo_grupo_usuario = () => {
    titulo_modal_grupo_usuario.textContent = 'Nuevo grupo usuario';
    btn_guardar_grupo_usuario.dataset.fnExecute = "guardar_nuevo_grupo_usuario";
}

/**
 * @author David Demetrio López Paz
 * Fecha creación: 05 de Julio de 2023
 * Descripción:
 *      Se utiliza la misma ventana modal que para Nuevo grupo usuario,
 *      solo que el titulo del modal se sustituye por "Editar grupo usuario"
 *      y el input tiene un value inicial que corresponde al grupo usuario a editar
 * @params ninguno
*/
const modal_editar_grupo_usuario = e => {
    titulo_modal_grupo_usuario.textContent = 'Editar grupo usuario';
    btn_guardar_grupo_usuario.dataset.fnExecute = "editar_grupo_usuario";

    // Se selecciona el pirmer td del tr correspondiente al que se le dió click, desde el icono de "Editar usuario"
    const tag_tr_grupo_usuario = e.target.closest('tr').firstElementChild;
    input_grupo_usuario_id.value = tag_tr_grupo_usuario.getAttribute('grupo-usuario-id');

    // Agregar el nombre del usuario a la ventana modal "Editar grupo usuario"
    input_grupo_usuario.value = tag_tr_grupo_usuario.textContent.trim(); 
}

const eliminar_grupo_usuario = async data => {
    try {
        const response = await fetch(`${base_url}api/grupo_usuario/eliminar_grupo_usuario`, {
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

const alerta_eliminar_grupo_usuario = e => {
    const td_grupo_usuario = e.target.closest('tr').firstElementChild;

    const data_confirm = {
        text: `¿Estás seguro de eliminar el grupo de usuario ${td_grupo_usuario.textContent.trim()}?`,
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
                        grupo_usuario_id: td_grupo_usuario.getAttribute('grupo-usuario-id')
                    };
                    let result = await eliminar_grupo_usuario(data);
                    if (result.error) return;
                    result = { ...result, url: '/grupo_usuario' };
                    msg_alerta.style.display = "none";
                    mensaje_exito(result);
                } catch (error) {
                    console.log(error);
                }
            }
        });   
}

const cargar_funciones_principales = () => {
    // Obtener las propiedades del último registro de la tabla Grupos de usuario
    const propiedades_tag_tr = document.querySelector('.table-group-divider').lastElementChild.getBoundingClientRect();
    /**
     * Permite hacer scroll automático hasta donde
     * está el último registro de la tabla de grupos de usuario.
    */
    window.scrollTo(0, propiedades_tag_tr.y);

    btns_editar_grupos_usuario.forEach(btn_editar_grupo_usuario => {
        btn_editar_grupo_usuario.addEventListener("click", modal_editar_grupo_usuario);
    });

    btns_eliminar_grupos_usuario.forEach(btn_eliminar_grupo_usuario => {
        btn_eliminar_grupo_usuario.addEventListener("click", alerta_eliminar_grupo_usuario);
    });
}

const fn_ejecutar = { guardar_nuevo_grupo_usuario, editar_grupo_usuario };

evento_cerrar_modal_formulario();

window.addEventListener('DOMContentLoaded', cargar_funciones_principales);
btn_guardar_grupo_usuario.addEventListener("click", () => {
    fn_ejecutar[btn_guardar_grupo_usuario.dataset.fnExecute]();
});
btn_nuevo_grupo_usuario.addEventListener("click", modal_nuevo_grupo_usuario);