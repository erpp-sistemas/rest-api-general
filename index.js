import express from "express";
import cors from "cors";
// import {} from "dotenv/config";
import session from "express-session";
import sequelize from "./config/db.js";

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

app.get("/", (req, res) => {
    if (req.session.logged) {
        res.redirect("/");
        return;
    } 
    res.redirect("/login")
});

app.get("/login", (req, res, next) => {
    res.render("login", { base_url: process.env.BASE_URL });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor activo en el puerto ${port}`);
});