// Importamos los módulos necesarios
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Importamos las rutas definidas para items y usuarios
const itemsRouter = require("./routes/items");
const usersRouter = require("./routes/users");

// Creamos una instancia de la aplicación Express
const app = express();

// Middleware para parsear cuerpos de solicitud JSON
app.use(express.json());
// Middleware para permitir solicitudes de otros dominios (CORS)
app.use(cors());

// Conectamos a la base de datos MongoDB utilizando las variables de entorno
mongoose
    .connect(`${process.env.mongoURI}`, {
        useNewUrlParser: true,        // Utiliza el nuevo parser de URL de MongoDB
        useUnifiedTopology: true,     // Utiliza el nuevo motor de gestión de conexiones
        useCreateIndex: true,         // Crea índices automáticamente
        useFindAndModify: false       // Usa métodos de actualización modernos
    })
    .then(() => {
        // Mensaje en consola si la conexión es exitosa
        console.log("Base de datos conectada");
    })
    .catch(err => {
        // Muestra cualquier error de conexión en la consola
        console.error(err);
    });

// Usamos las rutas importadas para manejar las solicitudes a /api/items y /api/users
app.use("/api/items", itemsRouter);
app.use("/api/users", usersRouter);

// Configuración para servir archivos estáticos en producción
if (process.env.NODE_ENV === "production") {
    // Servimos los archivos estáticos del directorio client/build
    app.use(express.static("client/build"));
    // Redirigimos todas las solicitudes al archivo index.html
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
}

// Definimos el puerto en el que la aplicación escuchará, usando una variable de entorno o 4000 por defecto
const port = process.env.PORT || 4000;

// Iniciamos el servidor y escuchamos en el puerto definido
app.listen(port, () => console.log(`App lanzada en el puerto ${port}`));
