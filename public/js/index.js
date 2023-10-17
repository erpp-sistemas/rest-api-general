import { cerrar_sesion_token_expiro } from "./functions/cerrar_sesion.js";
import { active_tooltips } from "./functions/tooltip.js";

const sidebar = document.querySelector(".sidebar");
const flecha_desplegar_menu = document.querySelector('.arrow-profile');
const logout = document.querySelector('#logout');


active_tooltips();

const construir_sidebar = secciones_sidebar => {
  const tags_li_modulo_html = secciones_sidebar.map(modulo => {
    const { submodulos } = modulo;

    const tags_li_submodulos = submodulos.map(submodulo => {
      return `<li><a href="${submodulo.submodulo_ruta_url}">${submodulo.submodulo_nombre}</a></li><hr class="dropdown-divider" style="border-top: 1px solid #ffffff75;">`
    });

    const tag_li = submodulos.length < 1
      ? `
        <li>
          <a href="${modulo.modulo_ruta_url}">
              <div class="d-flex align-items-center justify-content-center img-sidebar">
                <img src="${base_url}${modulo.modulo_icon_url}">
              </div>
              <span class="link_name ms-3 text-white">${modulo.modulo_nombre}</span>
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
              <span class="link_name ms-3 text-white">${modulo.modulo_nombre}</span>
            </a>
            <i class="bx bxs-chevron-right arrow text-white"></i>   
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
    const { usuario, secciones_sidebar, error } = result;
    if (error === 'token no es valido') {
      cerrar_sesion_token_expiro();
    }
    // Mostrar los datos del usuario
    document.querySelector('.profile_name').textContent = usuario[0].usuario_nombre_usuario; 
    document.querySelector('.usuario-cargo').textContent = usuario[0].usuario_cargo;

    const img_profile = usuario[0].usuario_url_img_perfil
      ? `
        <img src="${base_url}${usuario[0].usuario_url_img_perfil}" alt="profileImg">
      `
      : `
        <img src="${base_url}img/user_default.svg" alt="profileImg" style="height: 40px; width: 40px;">
      `;
    document.querySelector('.profile-content').innerHTML = img_profile;
    construir_sidebar(secciones_sidebar);
  } catch (error) {
    console.log(error);
  }
}

const sidebar_fn = async () => {
  try {
    // Iniciar video de bienvenida Cronos Center
    const video_wellcomo_cronos_center = document.querySelector('#wellcome-cronos-center-video')

    if(video_wellcomo_cronos_center) {
      const reinicir_video_wellcome_cronos = () => {
        // Volver al principio del video
        video_wellcomo_cronos_center.currentTime = 0;
        video_wellcomo_cronos_center.muted = true;
        video_wellcomo_cronos_center.play();
      }
      
      video_wellcomo_cronos_center.addEventListener('ended', reinicir_video_wellcome_cronos)
      video_wellcomo_cronos_center.play();
    }
    
    
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

logout.addEventListener('click', cerrar_sesion);
window.addEventListener("DOMContentLoaded", sidebar_fn);
