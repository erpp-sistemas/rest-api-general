export const vista_funciones_interno = async (req, res, next) => {
    try {
        const data = {
            base_url: process.env.BASE_URL
        };
        
        res.render("funciones/funciones_interno", data);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}

export const vista_funciones_externo = async (req, res, next) => {
    try {
        const data = {
            base_url: process.env.BASE_URL
        };

        res.render("funciones/funciones_externo", data);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}