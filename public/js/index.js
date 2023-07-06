const arrows = document.querySelectorAll(".arrow");
const sidebar_btn = document.querySelector(".menu-sidebar");
const sidebar = document.querySelector(".sidebar");

/* Activar todos los tooltip del sistema usando Bootstrap */
const tooltip_trigger_list = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltip_list = [...tooltip_trigger_list].map(tooltip_trigger_el => new bootstrap.Tooltip(tooltip_trigger_el));

const sidebar_fn = () => {
  arrows.forEach(arrow => {
    arrow.onclick = e => {
      const arrow_parent = e.target.closest(".arrow").parentElement.parentElement;
      arrow_parent.classList.toggle("show_menu");
    }
  });
}


sidebar_btn.addEventListener("click", () => {
  sidebar.classList.toggle("close");
});

window.addEventListener("DOMContentLoaded", sidebar_fn);