// Importamos el módulo jsonwebtoken para trabajar con JWT
const jwt = require("jsonwebtoken");
// Cargamos las variables de entorno desde el archivo .env
require("dotenv").config();

// Importamos el modelo de usuario desde el archivo correspondiente
const userModel = require("./models/user");

function auth(req, res, next) {
    // Obtenemos el token de la cabecera x-auth-token
    const token = req.header("x-auth-token");

    // Si no hay token, devolvemos un error 401 (No autorizado)
    if (!token) return res.status(401).json({ msg: "No token" });

    try {
        // Verificamos y decodificamos el token utilizando el secreto almacenado en las variables de entorno
        const decodedToken = jwt.verify(token, process.env.jwtSecret);
        // Adjuntamos el usuario decodificado al objeto de solicitud
        req.user = decodedToken;

        // Buscamos el usuario en la base de datos por su ID
        userModel.findById(req.user.id).then((user) => {
            // Añadimos el nombre de usuario al objeto de solicitud
            req.user.username = user.username;
            // Pasamos al siguiente middleware/controlador
            next();
        });
    } catch (e) {
        // Si el token no es válido, devolvemos un error 400 (Solicitud incorrecta)
        res.status(400).json({ msg: "Invalid token" });
    }
}

// Exportamos el middleware de autenticación
module.exports = auth;

