/* Activar todos los tooltip del sistema usando Bootstrap */
export const active_tooltips = () => {
    const tooltip_trigger_list = document.querySelectorAll('[data-toggle="tooltip"]');
    const tooltip_list = [...tooltip_trigger_list].map(tooltip_trigger_el => new bootstrap.Tooltip(tooltip_trigger_el));
}