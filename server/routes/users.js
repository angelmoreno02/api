// Importamos los módulos necesarios
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../auth");
require("dotenv").config();

// Importamos el modelo de usuario
const userModel = require("../models/user");

/**
 * @route   GET /api/users
 * @desc    Obtener los datos del usuario autenticado
 * @access  Privado (requiere autenticación)
 */
router.get("/", auth, (req, res) => {
    userModel
        .findById(req.user.id)
        .select("-password") // Excluimos el campo de contraseña
        .then((user) => res.json(user));
});

/**
 * @route   POST /api/users/register
 * @desc    Registrar un nuevo usuario
 * @access  Público
 */
router.post("/register", (req, res) => {
    const { username, email, password } = req.body;

    // Verificamos si el usuario o el email ya existen
    userModel.findOne({ $or: [{ username }, { email }] }).then((user) => {
        if (user) {
            if (user.username === username) {
                return res.status(400).json({ msg: "el nombre de usuario ya existe!" });
            } else {
                return res.status(400).json({ msg: "el email ya existe!" });
            }
        }

        // Creamos un nuevo usuario
        const newUser = new userModel({
            username,
            email,
            password,
        });

        // Generamos un hash para la contraseña antes de guardarla
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                    .save()
                    .then((user) => {
                        // Generamos un token JWT para el nuevo usuario
                        jwt.sign(
                            { id: user._id },
                            process.env.jwtSecret,
                            { expiresIn: 3600 }, // El token expira en 1 hora
                            (err, token) => {
                                if (err) throw err;
                                res.json({
                                    user: {
                                        token,
                                        id: user._id,
                                        username: user.username,
                                        email: user.email,
                                    },
                                });
                            }
                        );
                    })
                    .catch((err) => {
                        res.status(500).json({ msg: "internal server error" });
                        console.log(err);
                    });
            });
        });
    });
});

/**
 * @route   POST /api/users/login
 * @desc    Autenticar al usuario y devolver un token
 * @access  Público
 */
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Buscamos el usuario por nombre de usuario
    userModel
        .findOne({ username })
        .then((user) => {
            if (!user)
                return res.status(400).json({ msg: "el usuario no existe" });

            // Comparamos la contraseña ingresada con la almacenada
            bcrypt.compare(password, user.password).then((isMatch) => {
                if (!isMatch) return res.status(400).json({ msg: "contraseña incorrecta" });

                // Generamos un token JWT para el usuario autenticado
                jwt.sign(
                    { id: user._id },
                    process.env.jwtSecret,
                    { expiresIn: 3600 }, // El token expira en 1 hora
                    (err, token) => {
                        if (err) throw err;
                        res.json({
                            user: {
                                token,
                                id: user._id,
                                username: user.username,
                                email: user.email,
                            },
                        });
                    }
                );
            });
        })
        .catch((err) => {
            res.status(500).json({ msg: "internal server error" });
            console.log(err);
        });
});

module.exports = router;
