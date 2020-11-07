"use strict";
const { body } = require("express-validator");
module.exports.vContact = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Veuillez entrer un email valide")
        .bail()
        .normalizeEmail()
        .isLength({ min: 3, max: 256 })
        .withMessage("Veuillez entrer un email valide"),
    body("title").trim().isLength({ max: 256 }).withMessage("L'objet ne peut pas faire plus de 256 caractères"),
    body("content").trim().isLength({ max: 4056 }).withMessage("Le message ne peut pas faire plus de 2048 caractères")
];
