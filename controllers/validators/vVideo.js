const { body, sanitizeParam } = require("express-validator");
const { ERROR_MESSAGE } = require("../helpers/errorMessages");

module.exports.vVideo = [
	body("url").custom(value => {
		let result = value.match(/youtube.com\/.*/);

		if (!result) return Promise.reject("Le lien youtube n'est pas au bon format");
		else return true;
	}),
	body("title").isLength({ min: 1, max: 256 }).withMessage("title too long or empty"),
	body("description").isLength({ min: 1, max: 2048 }).withMessage("desc too long or empty"),
	body("authors").isLength({ max: 1024 }).withMessage("authors too long")
];
