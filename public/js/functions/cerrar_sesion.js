export const cerrar_sesion_token_expiro = () => {
    local_storage.clear();
    window.location.href = "/";
}