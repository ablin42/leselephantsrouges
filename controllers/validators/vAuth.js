const { body, sanitizeParam } = require("express-validator");
const utils = require("../helpers/utils");
const { ERROR_MESSAGE } = require("../helpers/errorMessages");

module.exports.vEmail = [
	body("email")
		.trim()
		.isEmail()
		.withMessage(ERROR_MESSAGE.emailInvalid)
		.bail()
		.normalizeEmail()
		.isLength({ min: 3, max: 256 })
		.withMessage(ERROR_MESSAGE.emailLength)
		.custom(value => {
			return utils.emailExist(value).then(email => {
				if (email) return Promise.reject(ERROR_MESSAGE.emailTaken);
			});
		})
];

module.exports.vPassword = [
	body("password")
		.isLength({ min: 8, max: 256 })
		.withMessage(ERROR_MESSAGE.pwLength)
		.matches(/^(((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(.{8,})/)
		.withMessage(ERROR_MESSAGE.pwAlpha),
	body("password2").custom((value, { req }) => {
		if (value !== req.body.password) throw new Error(ERROR_MESSAGE.pwDontMatch);
		return true;
	})
];

module.exports.vLostPw = [
	body("email")
		.trim()
		.isEmail()
		.withMessage(ERROR_MESSAGE.emailInvalid)
		.bail()
		.normalizeEmail()
		.isLength({ min: 3, max: 256 })
		.withMessage(ERROR_MESSAGE.emailLength)
		.custom(value => {
			return utils.emailExist(value).then(email => {
				if (!email) return Promise.reject(ERROR_MESSAGE.lostpwEmail);
			});
		})
];

module.exports.vRegister = [
	body("email")
		.trim()
		.isEmail()
		.withMessage(ERROR_MESSAGE.emailInvalid)
		.bail()
		.normalizeEmail()
		.isLength({ min: 3, max: 256 })
		.withMessage(ERROR_MESSAGE.emailLength)
		.custom(value => {
			return utils.emailExist(value).then(email => {
				if (email) return Promise.reject(ERROR_MESSAGE.emailTaken);
			});
		}),
	body("password")
		.isLength({ min: 8, max: 256 })
		.withMessage(ERROR_MESSAGE.pwLength)
		.matches(/^(((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(.{8,})/)
		.withMessage(ERROR_MESSAGE.pwAlpha),
	body("password2").custom((value, { req }) => {
		if (value !== req.body.password) throw new Error(ERROR_MESSAGE.pwDontMatch);
		return true;
	})
];

module.exports.vLogin = [
	body("email")
		.trim()
		.isEmail()
		.withMessage(ERROR_MESSAGE.emailInvalid)
		.bail()
		.normalizeEmail()
		.custom(value => {
			return utils.emailExist(value).then(email => {
				if (!email) return Promise.reject(ERROR_MESSAGE.invalidCredentials);
			});
		}),
	body("password").isString()
];

module.exports.vResend = [
	body("email")
		.trim()
		.isEmail()
		.withMessage(ERROR_MESSAGE.emailInvalid)
		.bail()
		.normalizeEmail()
		.custom(value => {
			return utils.emailExist(value).then(email => {
				if (!email) return Promise.reject(ERROR_MESSAGE.invalidCredentials);
			});
		})
];
