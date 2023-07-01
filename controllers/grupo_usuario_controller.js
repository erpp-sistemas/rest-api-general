export const vista_grupo_usuario = (req, res, next) => {
    try {
        const data = {
            base_url: process.env.BASE_URL
        }
        res.render("grupo_usuario/grupo_usuario", data);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
        next();
    }
}