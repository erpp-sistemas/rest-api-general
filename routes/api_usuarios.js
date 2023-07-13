import express from "express";
import { verify_token } from "../validations/verify_token.js";
import {
    editar_usuario,
    eliminar_usuario,
    get_registros_usuarios,
    nuevo_usuario,
    obtener_datos_usuario
} from "../controllers/usuarios_controller.js";

const router_api_usuario = express.Router();

router_api_usuario.post("/registros_usuarios", verify_token, get_registros_usuarios);
router_api_usuario.post("/nuevo_usuario", verify_token, nuevo_usuario);
router_api_usuario.post("/obtener_datos_usuario", verify_token, obtener_datos_usuario);
router_api_usuario.put("/editar_usuario", verify_token, editar_usuario);
router_api_usuario.put("/eliminar_usuario", verify_token, eliminar_usuario);

export default router_api_usuario;