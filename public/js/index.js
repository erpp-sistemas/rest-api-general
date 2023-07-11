const arrows = document.querySelectorAll(".arrow");
const sidebar_btn = document.querySelector(".menu-sidebar");
const sidebar = document.querySelector(".sidebar");
const flecha_desplegar_menu = document.querySelector('.arrow-profile');
const logout = document.querySelector('#logout');

/* Activar todos los tooltip del sistema usando Bootstrap */
const tooltip_trigger_list = document.querySelectorAll('[data-toggle="tooltip"]');
const tooltip_list = [...tooltip_trigger_list].map(tooltip_trigger_el => new bootstrap.Tooltip(tooltip_trigger_el));

const sidebar_fn = () => {
  arrows.forEach(arrow => {
    arrow.onclick = e => {
      const arrow_parent = e.target.closest(".arrow").parentElement.parentElement;
      arrow_parent.classList.toggle("show_menu");
    } 
  });

  // Mostrar los datos del usuario
  document.querySelector('.profile_name').textContent = local_storage.getItem('usuario'); 
  document.querySelector('.usuario-cargo').textContent = local_storage.getItem('usuario_cargo');
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