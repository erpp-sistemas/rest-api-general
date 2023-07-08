export const evento_cerrar_modal_formulario = () => {
    const ventanas_modales_formulario = document.querySelectorAll('.modal-form');
    ventanas_modales_formulario.forEach(modal => {
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