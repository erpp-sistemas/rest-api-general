import express from 'express';
// Validaciones
import { login_validation } from '../validations/login.validation.js';
// Controllers
import { login } from '../controllers/auth_controller.js';

const router_api_auth = express.Router();

router_api_auth.post("/", login_validation, login);

export default router_api_auth;