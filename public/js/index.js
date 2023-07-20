const sidebar_btn = document.querySelector(".menu-sidebar");
const sidebar = document.querySelector(".sidebar");
const flecha_desplegar_menu = document.querySelector('.arrow-profile');
const logout = document.querySelector('#logout');

/* Activar todos los tooltip del sistema usando Bootstrap */
const tooltip_trigger_list = document.querySelectorAll('[data-toggle="tooltip"]');
const tooltip_list = [...tooltip_trigger_list].map(tooltip_trigger_el => new bootstrap.Tooltip(tooltip_trigger_el));

const construir_sidebar = secciones_sidebar => {
  const tags_li_modulo_html = secciones_sidebar.map(modulo => {
    const { submodulos } = modulo;

    const tags_li_submodulos = submodulos.map(submodulo => {
      return `<li><a href="${submodulo.submodulo_ruta_url}">${submodulo.submodulo_nombre}</a></li>`
    });

    const tag_li = submodulos.length < 1
      ? `
        <li>
          <a href="${modulo.modulo_ruta_url}">
              <div class="d-flex align-items-center justify-content-center img-sidebar">
                <img src="${base_url}${modulo.modulo_icon_url}">
              </div>
              <span class="link_name">${modulo.modulo_nombre}</span>
          </a>
        </li>
      `
      : `
        <li>
          <div class="icon-link">
            <a href="#">
              <div class="d-flex align-items-center justify-content-center img-sidebar">
                <img src="${base_url}${modulo.modulo_icon_url}">
              </div>
              <span class="link_name">${modulo.modulo_nombre}</span>
            </a>
            <i class="bx bxs-chevron-right arrow"></i>   
          </div>
          <ul class="sub-menu">${tags_li_submodulos.join('')}</ul>
        </li>
      `;
    return tag_li;
  });

  document.querySelector('.secciones-sidebar').innerHTML = tags_li_modulo_html.join('');
  
  const arrows = document.querySelectorAll(".arrow");
  arrows.forEach(arrow => {
    arrow.onclick = e => {
      const arrow_parent = e.target.closest(".arrow").parentElement.parentElement;
      arrow_parent.classList.toggle("show_menu");
    } 
  });
}

const obtener_datos_usuario = async () => {
  try {
    const data = { usuario_id: local_storage.getItem('usuario_id') };

    const response = await fetch(`${base_url}api/auth/datos_sidebar`, {
      method: 'POST',
      headers: {
        "Content-Type": 'application/x-www-form-urlencoded',
        "auth-token": token, 
      }, 
      body: new URLSearchParams(data)
    });
    const result = await response.json();
    const { usuario, secciones_sidebar } = result;

    // Mostrar los datos del usuario
    document.querySelector('.profile_name').textContent = usuario[0].usuario_nombre_usuario; 
    document.querySelector('.usuario-cargo').textContent = usuario[0].usuario_cargo;

    construir_sidebar(secciones_sidebar);
  } catch (error) {
    console.log(error);
  }
}

const sidebar_fn = async () => {
  try {
    await obtener_datos_usuario();
  } catch (error) {
    console.log(error);
  }
}

const cerrar_sesion = async () => {
  try {
    const data = {
      usuario_id: local_storage.getItem('usuario_id'),
      grupo_usuario_id: local_storage.getItem('grupo_usuario_id')
    };
    const response = await fetch(`${base_url}api/auth/logout`, {
      method: 'POST',
      headers: {
          "Content-Type": 'application/x-www-form-urlencoded',
          "auth-token": token, 
      }, 
      body: new URLSearchParams(data)
    });
    await response.json();
    local_storage.clear();
    window.location.href = '/login';
  } catch (error) {
    console.log(error);
  }
} 

flecha_desplegar_menu.addEventListener("click", () => {
  flecha_desplegar_menu.classList.toggle('arrow-rotate');
  document.querySelector('.menu-profile').classList.toggle('show');
});

sidebar_btn.addEventListener("click", () => {
  sidebar.classList.toggle("close");
});

logout.addEventListener('click', cerrar_sesion);
window.addEventListener("DOMContentLoaded", sidebar_fn);