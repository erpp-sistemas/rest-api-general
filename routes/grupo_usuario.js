import express from "express";
// Validations
import { session_validation } from "../validations/session_validation.js";
import { permisos_validacion_vistas } from "../validations/permisos_validation.js";
// Controllers
import { vista_grupo_usuario, vista_permisos_grupo_usuario } from "../controllers/grupo_usuario_controller.js";

const router_grupo_usuario = express.Router();

router_grupo_usuario.get("/", session_validation, permisos_validacion_vistas, vista_grupo_usuario);
router_grupo_usuario.get("/permisos", session_validation, permisos_validacion_vistas, vista_permisos_grupo_usuario);

export default router_grupo_usuario;