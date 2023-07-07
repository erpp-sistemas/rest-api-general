export const evento_cerrar_modal = () => {
    const ventanas_modales = document.querySelectorAll('.modal');
    ventanas_modales.forEach(modal => {
        // Detecta cuando una ventana modal es cerrada
        modal.addEventListener('hidden.bs.modal', () => {
            /**
             * Cuando la ventan modal es cerrada, resetear
             * el formulario de la ventana modal
            */
            modal.querySelector('form').reset();
            // Eliminar los mensajes de error
            modal.querySelector('.invalid-feedback').style.display = 'none';
        });
    });
}