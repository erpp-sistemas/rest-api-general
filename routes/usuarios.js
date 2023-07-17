import express from "express";
// Validations
import { session_validation } from "../validations/session_validation.js";
import { permisos_validation } from "../validations/permisos_validation.js";

import { vista_usuarios } from "../controllers/usuarios_controller.js";

const router_usuarios = express.Router();

router_usuarios.get("/", session_validation, permisos_validation, vista_usuarios);

export default router_usuarios;