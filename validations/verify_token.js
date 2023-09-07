import jwt from 'jsonwebtoken';

export const verify_token = (req, res, next) => {
    try {
        const auth_token = req.headers['auth-token'];
        if (!auth_token) return res.status(401).json({ error: 'Acceso denegado' });
        const verified = jwt.verify(auth_token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        req.session.destroy();
        res.status(400).json({ error: 'token no es valido' });
    }
}