export const mensaje_exito = data => {
    const { msg, url } = data;

    Swal.fire({
        icon: 'success',
        title: msg,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        timer: 1500
    }).then(() => {
        window.location.href = url;
    });
}

export const mensaje_advertencia = async data => {
    try {
        const { title, confirm_button_text, cancel_button_text } = data;
        const result = await Swal.fire({
            position: 'top',
            title: title,
            showCancelButton: true,
            confirmButtonText: confirm_button_text,
            cancelButtonText: cancel_button_text,
            buttonsStyling: false,
            customClass: {
                title: 'fs-5 fw-normal',
                confirmButton: 'btn button-principal btn-sm me-3',
                cancelButton: 'btn button-principal-blue btn-sm'
            }
        }).then(result => {
            if (result.isConfirmed) {
                return true;
            }
            return false;
        });

        return result;
    
    } catch (error) {
        console.log(error);
    }
}