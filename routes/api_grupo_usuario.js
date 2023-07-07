import express from "express";
import { verify_token } from "../validations/verify_token.js";
import { editar_grupo_usuario, eliminar_grupo_usuario, guardar_nuevo_grupo_usuario } from "../controllers/grupo_usuario_controller.js";
import { validacion_existe_grupo_usuario } from "../validations/grupo_usuario.js";

const router_api_grupo_usuario = express.Router();

router_api_grupo_usuario.post("/nuevo_grupo_usuario", verify_token, guardar_nuevo_grupo_usuario);
router_api_grupo_usuario.put("/editar_grupo_usuario", verify_token, validacion_existe_grupo_usuario, editar_grupo_usuario);
router_api_grupo_usuario.delete("/eliminar_grupo_usuario", verify_token, eliminar_grupo_usuario);

export default router_api_grupo_usuario;