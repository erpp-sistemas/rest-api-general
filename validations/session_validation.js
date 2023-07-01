export const session_validation = (req, res, next) => {
    const { session } = req;
    if (session.logged) {
        next();
        return;
    }
    res.redirect("/login");
}