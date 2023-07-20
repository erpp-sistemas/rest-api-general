import express from "express";
import session from "express-session";
import sequelize from "./config/db.js";
import cors from "cors";

// Validaciones
import { session_validation } from "./validations/session_validation.js";
import { permisos_validacion_vistas } from "./validations/permisos_validation.js";

// Rutas de la vista
import router_grupo_usuario from "./routes/grupo_usuario.js";
import router_usuarios from "./routes/usuarios.js";

// Routers API
import router_api_auth from "./routes/api_auth.js";
import router_api_grupo_usuario from "./routes/api_grupo_usuario.js";
import router_api_usuario from "./routes/api_usuarios.js";

const app = express();

// Habilitar cors
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('trust proxy', 1);
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

app.use(express.static("public"));

// motor de plantillas
app.set("view engine", "ejs");
app.set("views", "./views");

// Conexión a DB
sequelize.authenticate()
    .then(() => {
        console.log("Base de datos conectada");
    })
    .catch(error => {
        console.log(error);
    });

app.get("/", session_validation, permisos_validacion_vistas, (req, res) => {
    if (req.session.logged) {
        res.render("index", { base_url: process.env.BASE_URL });
        return;
    }
    res.redirect("/login");
});

app.get("/login", (req, res) => {
    res.render("login", { base_url: process.env.BASE_URL });
});

// Rutas de vistas
app.use("/grupo_usuario", router_grupo_usuario);
app.use("/usuarios", router_usuarios);

// Rutas del api
app.use("/api/auth", router_api_auth);
app.use("/api/grupo_usuario", router_api_grupo_usuario);
app.use("/api/usuario", router_api_usuario);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor activo en el puerto ${port}`);
});