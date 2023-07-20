import { permiso_accion_entidad_by_grupo_usuario } from "../models/permiso_accion_entidad.js";
import { get_permisos_modulos } from "../models/permiso_modulo.js";
import { get_permisos_submodulos } from "../models/permiso_submodulo.js";

export const permisos_acciones_by_grupo_usuario = async data => {
    try {
        // Obtener los permisos acciones
        const permisos_acciones = {};
        const get_permisos_acciones = await permiso_accion_entidad_by_grupo_usuario(data);
        
        for (const accion of get_permisos_acciones) {
            permisos_acciones[accion.accion_nombre] = accion.mostrar_accion;
        }

        return permisos_acciones;
    } catch (error) {
        console.log(error);
    }
}

export const permisos_vistas_by_grupo_usuario = async data => {
    try {
        /**
         * Obtener los datos para armar la sección
         * del sidebar
        */
        const data_permisos = { grupo_usuario_id: data.grupo_usuario_id };
        const permisos_modulos = await get_permisos_modulos(data_permisos);
        const permisos_submodulos = await get_permisos_submodulos(data_permisos);

        // Armar sidebar seccionado por permisos            
        let secciones_sidebar = [];
        
        /**
         * Cada uno de los modulos a los que tiene permiso accesar el usuario,
         * se insertan en @const secciones_sidebar
        */
        permisos_modulos.forEach(permiso_modulo => {
            const { modulo } = permiso_modulo;
            modulo.dataValues.submodulos = [];
            secciones_sidebar = [...secciones_sidebar, modulo.dataValues];
        });

        permisos_submodulos.forEach(permiso_submodulo => {
            const { submodulo } = permiso_submodulo;
            // Se filtra el módulo al que pertenece el submodulo
            const modulo = secciones_sidebar.find(modulo => modulo.modulo_id == submodulo.modulo_id);

            // Dicho modulo encontrado, se obtiene la propiedad submodulos,
            // para agregar los submodulos a los q pertenecen a dicho modulo
            if (modulo) {
                modulo.submodulos = [...modulo.submodulos, submodulo];
            } 
        });

        return secciones_sidebar;
    } catch (error) {
        console.log(error);
    }
} 