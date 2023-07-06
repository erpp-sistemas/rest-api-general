import express from "express";
import { verify_token } from "../validations/verify_token.js";
import { guardar_nuevo_grupo_usuario } from "../controllers/grupo_usuario_controller.js";

const router_api_grupo_usuario = express.Router();

router_api_grupo_usuario.post("/nuevo_grupo_usuario", verify_token, guardar_nuevo_grupo_usuario);

export default router_api_grupo_usuario;