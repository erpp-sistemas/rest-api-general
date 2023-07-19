const select_grupo_usuario = document.querySelector('#grupo-usuario')

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
        console.log(result);
        const { cat_grupo_usuario, grupo_usuario_id } = result;
        // Agregar al selector los grupo usuario
        const option_html = cat_grupo_usuario.map(grupo_usuario => {
            if (grupo_usuario.grupo_usuario_id == grupo_usuario_id) {
                return `<option value="${grupo_usuario.grupo_usuario_id}" selected>${grupo_usuario.grupo_usuario_nombre}</option>`
            }
            return `<option value="${grupo_usuario.grupo_usuario_id}">${grupo_usuario.grupo_usuario_nombre}</option>`
        });

        select_grupo_usuario.insertAdjacentHTML('beforeend', option_html.join(''));
    } catch (error) {
        console.log(error);
    }
}

window.addEventListener('DOMContentLoaded', mostrar_permisos_grupo_usuario);