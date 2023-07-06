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