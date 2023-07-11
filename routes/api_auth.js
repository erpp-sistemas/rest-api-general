import express from 'express';
// Validaciones
import { login_validation } from '../validations/login.validation.js';
// Controllers
import { login, logout } from '../controllers/auth_controller.js';

const router_api_auth = express.Router();

router_api_auth.post("/", login_validation, login);
router_api_auth.post("/logout", logout);

export default router_api_auth;