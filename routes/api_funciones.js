import express from 'express';
import { verify_token } from '../validations/verify_token.js';
import {
    actualizar_adeudo_rezago,
    actualizar_carta_invitacion,
    actualizar_pagos_validos,
    get_catalogos
} from '../controllers/funciones_controller.js';

const router_api_funciones = express.Router();

router_api_funciones.post("/get_catalogos", verify_token, get_catalogos);
router_api_funciones.post("/adeudo_rezago", verify_token, actualizar_adeudo_rezago);
router_api_funciones.post("/carta_invitacion", verify_token, actualizar_carta_invitacion);
router_api_funciones.post("/pagos_validos", verify_token, actualizar_pagos_validos);

export default router_api_funciones;