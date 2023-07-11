import { Usuario, lista_usuarios_activos } from "../models/Usuario.js";

export const vista_usuarios = async (req, res, next) => {
    try {
        const usuarios = await lista_usuarios_activos();
        const data = {
            base_url: process.env.BASE_URL,
            usuarios: usuarios
        };
        res.render("usuarios/usuarios", data);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}