const inputs_formulario = document.querySelectorAll('.input-form');
const btn_login = document.querySelector('#btn-login');

const validar_input_formulario = e => {
    const { value, dataset, name } = e.target;
    const msg_advertencia = document.querySelector(`#${dataset.msg}`);
  
    if (value.trim() === '') {
        msg_advertencia.textContent = 'El campo es requerido.';
        msg_advertencia.style.display = "block";
        return false;
    }
    
    if (name === 'usuario_password' && value.length < 6) {
        msg_advertencia.textContent = 'La contraseña debe ser mínimo de 6 caracteres.';
        msg_advertencia.style.display = "block";
        return false;
    }
  
    msg_advertencia.style.display = "none";
    return true;
}

const insertar_datos_localStorage = result => {
    const { data, error } = result;
    
    // Ejecuta esta seccion si hubo un error al ingresar el usuario
    if (error && error.msg.includes('contraseña')) {
        const id_nombre = document.querySelector('input[name="usuario_password"]').dataset.msg;
        const mensaje_a_mostrar = document.querySelector(`#${id_nombre}`);
        mensaje_a_mostrar.textContent = error.msg;
        mensaje_a_mostrar.style.display = "block";
        return;
    }
    
    // Ejecuta esta seccion si hubo un error al ingresar la password
    if (error && error.msg.includes('usuario')) {
        const id_nombre = document.querySelector('input[name="usuario_nombre"]').dataset.msg;
        const mensaje_a_mostrar = document.querySelector(`#${id_nombre}`);
        mensaje_a_mostrar.textContent = error.msg;
        mensaje_a_mostrar.style.display = "block";
        return;
    }
    
    // Resetear mensajes de error
    inputs_formulario.forEach(input_formulario => {
        input_formulario.style.display = "none";
    });

    // Insertar datos en el localStorage
    local_storage.setItem("token", data.token);
    local_storage.setItem("grupo_usuario_id", data.grupo_usuario_id);
    local_storage.setItem("usuario_id", data.usuario_id);
    local_storage.setItem("usuario", data.usuario);
    local_storage.setItem("usuario_nombre", data.usuario_nombre);
    local_storage.setItem("usuario_apellidos", data.usuario_apellidos);
    local_storage.setItem("usuario_cargo", data.usuario_cargo);

    // Renderisar a la vista principal
    window.location.href = "/";
} 

const login = async () => {
    try {
        const data_form = { usuario_nombre: '', usuario_password: '' };

        for (const input_formulario of inputs_formulario) {
            const ev = { target: input_formulario };
            const esta_validado_inputs_form = validar_input_formulario(ev);
            if (!esta_validado_inputs_form) return;
            data_form[input_formulario.name] = input_formulario.value;
        }
        const response = await fetch(`${base_url}api/auth`, {
            method: 'POST',
            headers: { "Content-Type": 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(data_form)
        });

        const result = await response.json();
        insertar_datos_localStorage(result);
    } catch (error) {
        console.log(error);
    }
}

inputs_formulario.forEach(input_formulario => {
    input_formulario.addEventListener("change", validar_input_formulario);
});
btn_login.addEventListener("click", login);