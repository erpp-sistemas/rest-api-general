import { mensaje_exito } from "./functions/mensajes.js";

const btn_guardar_grupo_usuario = document.querySelector('#btn-guardar-grupo-usuario');

const guardar_nuevo_grupo_usuario = async () => {
    try {
        const input_grupo_usuario = document.querySelector('#input-grupo-usuario-nombre');
        const msg_alert_input_grupo_usuario = document.querySelector('.invalid-feedback');
        
        if (input_grupo_usuario.value.trim() === '') {
            msg_alert_input_grupo_usuario.textContent = 'Ingresa un nombre';
            msg_alert_input_grupo_usuario.style.display = "block";
            return;
        }
        
        msg_alert_input_grupo_usuario.style.display = "none";

        const data = { nombre_grupo_usuario: input_grupo_usuario.value.trim() };

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

btn_guardar_grupo_usuario.addEventListener("click", guardar_nuevo_grupo_usuario);