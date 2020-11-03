const { body } = require("express-validator");
import express from "express";
import utils from "../helpers/utils";
import ERROR_MESSAGE from "../helpers/errorMessages";

module.exports.vEmail = [
	body("email")
		.trim()
		.isEmail()
		.withMessage(ERROR_MESSAGE.emailInvalid)
		.bail()
		.normalizeEmail()
		.isLength({ min: 3, max: 256 })
		.withMessage(ERROR_MESSAGE.emailLength)
		.custom(async (value: string) => {
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
	body("password2").custom(async (value: string, req: express.Request ) => { //{ req }
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
		.custom(async (value: string) => {
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
		.custom(async (value: string) => {
			return utils.emailExist(value).then(email => {
				if (email) return Promise.reject(ERROR_MESSAGE.emailTaken);
			});
		}),
	body("password")
		.isLength({ min: 8, max: 256 })
		.withMessage(ERROR_MESSAGE.pwLength)
		.matches(/^(((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(.{8,})/)
		.withMessage(ERROR_MESSAGE.pwAlpha),
	body("password2").custom((value: string, req: express.Request ) => { //{ req }
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
		.custom(async (value: string) => {
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
		.custom(async (value: string) => {
			return utils.emailExist(value).then(email => {
				if (!email) return Promise.reject(ERROR_MESSAGE.invalidCredentials);
			});
		})
];
