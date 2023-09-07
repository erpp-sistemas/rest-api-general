import fs from 'fs';

import { actualizar_pagos_validos_izcalli_c } from "../controllers/funciones_controller.js";

function execute_pagos_validos() {
    actualizar_pagos_validos_izcalli_c();
    fs.writeFile('pagos_validos_current.txt', new Date().toLocaleString('es-MX'), err => {
        if (err) throw err;
    })
}

execute_pagos_validos();