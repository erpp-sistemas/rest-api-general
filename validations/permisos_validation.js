import { get_permisos_modulos } from "../models/permiso_modulo.js";
import { get_permisos_submodulos } from "../models/permiso_submodulo.js";

export const permisos_validacion_vistas = async (req, res, next) => {
    try {
        const { session, originalUrl } = req;

        const data_usuario = { grupo_usuario_id: session.grupo_usuario_id };
        
        const permisos_modulos = await get_permisos_modulos(data_usuario);
        const permisos_submodulos = await get_permisos_submodulos(data_usuario);

        const acceso_a_modulo = permisos_modulos.filter(permiso_modulo => {
            const { modulo } = permiso_modulo;
            if (modulo.modulo_ruta_url == originalUrl) {
                return modulo;
            }
        });
        
        const acceso_a_submodulo = permisos_submodulos.filter(permiso_submodulo => {
            const { submodulo } = permiso_submodulo;
            if (submodulo.submodulo_ruta_url == originalUrl) {
                return submodulo;
            }
        });

        if (acceso_a_modulo.length > 0 || acceso_a_submodulo.length > 0) {
            next();
            return;
        }

        req.session.destroy();
        res.redirect("/login");
    } catch (error) {
        console.log(error);
    }
}