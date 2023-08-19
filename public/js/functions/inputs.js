export const validar_inputs_numero_es_entero = () => {
    const inputs_numero = document.querySelectorAll('input[name="dias"]');

    inputs_numero.forEach(input_numero => {
        input_numero.onkeyup = () => {
            if (!Number.isInteger(parseFloat(input_numero.value)) || parseFloat(input_numero.value) < 0) {
                input_numero.value = 1;
            }
        }
    });
}