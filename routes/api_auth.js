import express from 'express';
// Validaciones
import { login_validation } from '../validations/login.validation.js';
import { verify_token } from '../validations/verify_token.js';
// Controllers
import { get_datos_sidebar, get_permisos_acciones, login, logout } from '../controllers/auth_controller.js';

const router_api_auth = express.Router();

router_api_auth.post("/", login_validation, login);
router_api_auth.post("/logout", verify_token, logout);
router_api_auth.post("/datos_sidebar", verify_token, get_datos_sidebar);
router_api_auth.post("/permisos_acciones_by_grupo_usuario", verify_token, get_permisos_acciones);

export default router_api_auth;