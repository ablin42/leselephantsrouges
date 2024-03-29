const { body, sanitizeParam } = require("express-validator");
const { ERROR_MESSAGE } = require("../helpers/errorMessages");

module.exports.vEvent = [
	body("url").custom(value => {
		if (!value || value == "") return true;
		let result = value.match(/youtube.com\/.*/);

		if (!result) return Promise.reject("Le lien youtube n'est pas au bon format");
		else return true;
	}),
	body("title").isLength({ max: 256 }).withMessage("title too long or empty"),
	body("address").isLength({ max: 256 }).withMessage("address too long or empty"),
	body("description").isLength({ max: 2048 }).withMessage("desc too long or empty"),
	body("staff").isLength({ max: 1024 }).withMessage("staff too long")
];
