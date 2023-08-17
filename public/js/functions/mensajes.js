export const mensaje_exito = data => {
    const { msg, url } = data;
    Swal.fire({
        icon: 'success',
        iconColor: '#269355',
        title: msg,
        color: '#fff',
        background: '#254061',
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        timer: 1500
    }).then(() => {
        window.location.href = url;
    });
}

export const mensaje_advertencia = data => {
    return new Promise (resolve => {
        // Limiar mensajes de alerta anteriores
        while (document.querySelector('.msg-alerta-modal')) {
            document.querySelector('.msg-alerta-modal').remove();
        }

        const { text, confirm_button_text, cancel_button_text } = data;
        
        const msg_alerta = document.createElement('DIV');
        msg_alerta.setAttribute('tabindex', '-1');
        msg_alerta.classList.add('msg-alerta-modal', 'modal', 'fade');
        
        const msg_alerta_dialog = document.createElement('DIV');
        msg_alerta_dialog.classList.add('modal-dialog');
        
        msg_alerta_dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header bg-blue-sys text-white" style="border-bottom: none !important;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24">
                        <path
                            fill="#269355"
                            d="M11 15h2v2h-2v-2m0-8h2v6h-2V7m1-5C6.47 2 2 6.5 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0
                            18a8 8 0 0 1-8-8a8 8 0 0 1 8-8a8 8 0 0 1 8 8a8 8 0 0 1-8 8Z"
                        />
                    </svg>
                    <h5 class="modal-title ms-2">Alerta</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center text-white bg-blue-sys">${text}</div>
                <div class="modal-footer bg-blue-sys" style="padding: 0.5rem 1rem; border-top: none !important;">
                    <button type="button" class="btn button-principal btn-sm boton-confirmacion">${confirm_button_text}</button>
                    <button type="button" class="btn btn-secondary button-principal-blue btn-sm" data-bs-dismiss="modal">${cancel_button_text}</button>
                </div>
            </div>
        `;

        msg_alerta.appendChild(msg_alerta_dialog);

        const modal_mensaje_alerta = new bootstrap.Modal(msg_alerta);
        modal_mensaje_alerta.show();
        const data_result = { msg_alerta };
        resolve(data_result);
    });
}