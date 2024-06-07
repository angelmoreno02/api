// Importamos los módulos necesarios
const express = require("express");
const router = express.Router();
const auth = require("../auth");

// Importamos el modelo de ítem
const itemModel = require("../models/item");

/**
 * @route   GET /api/items
 * @desc    Obtener todos los ítems del usuario autenticado
 * @access  Privado (requiere autenticación)
 */
router.get("/", auth, (req, res) => {
    itemModel
        .find({ user: req.user.username })
        .sort({ createdAt: -1 }) // Ordenamos por fecha de creación en orden descendente
        .then((docs) => res.json(docs))
        .catch((err) => {
            console.error(err);
            res.status(500).json({ msg: "internal server error" });
        });
});

/**
 * @route   POST /api/items
 * @desc    Crear un nuevo ítem
 * @access  Privado (requiere autenticación)
 */
router.post("/", auth, (req, res) => {
    const newItem = new itemModel({
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
        user: req.user.username,
    });

    newItem
        .save()
        .then((doc) => res.json(doc))
        .catch((err) => {
            console.error(err);
            res.status(500).json({ msg: "internal server error" });
        });
});

/**
 * @route   DELETE /api/items
 * @desc    Eliminar múltiples ítems por sus IDs
 * @access  Privado (requiere autenticación)
 */
router.delete("/", auth, (req, res) => {
    itemModel
        .deleteMany({ _id: { $in: req.body } })
        .then((doc) => res.json(doc))
        .catch((err) => {
            console.error(err);
            res.status(500).json({ msg: "internal server error" });
        });
});

/**
 * @route   PUT /api/items
 * @desc    Actualizar un ítem por su ID
 * @access  Privado (requiere autenticación)
 */
router.put("/", auth, (req, res) => {
    itemModel
        .findOneAndUpdate({ _id: req.body._id }, req.body, { new: true })
        .then((doc) => res.json(doc))
        .catch((err) => {
            console.error(err);
            res.status(500).json({ msg: "internal server error" });
        });
});

/**
 * @route   PUT /api/items/category
 * @desc    Actualizar la categoría de múltiples ítems
 * @access  Privado (requiere autenticación)
 */
router.put("/category", auth, (req, res) => {
    itemModel
        .updateMany(
            { category: req.body.currentCategory, user: req.user.username },
            { $set: { category: req.body.newCategory } }
        )
        .then((doc) => res.json(doc))
        .catch((err) => {
            console.error(err);
            res.status(500).json({ msg: "internal server error" });
        });
});

module.exports = router;

