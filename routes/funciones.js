import express from "express";

import { vista_funciones_externo, vista_funciones_interno } from "../controllers/funciones_controller.js";

// Validacion
import { session_validation } from "../validations/session_validation.js";
import { permisos_validacion_vistas } from "../validations/permisos_validation.js";

const router_funciones = express.Router();

router_funciones.get("/interno", session_validation , permisos_validacion_vistas, vista_funciones_interno);
router_funciones.get("/externo", session_validation , permisos_validacion_vistas, vista_funciones_externo);

export default router_funciones;