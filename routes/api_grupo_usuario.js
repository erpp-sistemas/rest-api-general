import express from "express";
import { verify_token } from "../validations/verify_token.js";
import {
    editar_grupo_usuario,
    editar_permiso_accion_entidad,
    editar_permiso_vistas,
    eliminar_grupo_usuario,
    guardar_nuevo_grupo_usuario,
    permisos_by_grupo_usuario
} from "../controllers/grupo_usuario_controller.js";
import { validacion_existe_grupo_usuario, validar_grupo_usuario_id } from "../validations/grupo_usuario.js";

const router_api_grupo_usuario = express.Router();

router_api_grupo_usuario.post("/nuevo_grupo_usuario", verify_token, guardar_nuevo_grupo_usuario);
router_api_grupo_usuario.put("/editar_grupo_usuario", verify_token, validacion_existe_grupo_usuario, editar_grupo_usuario);
router_api_grupo_usuario.put("/eliminar_grupo_usuario", verify_token, validar_grupo_usuario_id, eliminar_grupo_usuario);

router_api_grupo_usuario.post("/permisos_by_grupo_usuario", verify_token, permisos_by_grupo_usuario);
router_api_grupo_usuario.put("/editar_permiso_vistas", verify_token, editar_permiso_vistas);
router_api_grupo_usuario.put("/editar_permiso_accion_entidad", verify_token, editar_permiso_accion_entidad);

export default router_api_grupo_usuario;