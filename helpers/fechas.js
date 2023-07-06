export const obtener_hora_local = () => {
    const fecha = new Date().toLocaleString('sv-SE');
    return fecha;
}