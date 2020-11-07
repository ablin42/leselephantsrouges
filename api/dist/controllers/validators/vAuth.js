"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { body } = require("express-validator");
const utils_1 = __importDefault(require("../helpers/utils"));
const errorMessages_1 = __importDefault(require("../helpers/errorMessages"));
module.exports.vEmail = [
    body("email")
        .trim()
        .isEmail()
        .withMessage(errorMessages_1.default.emailInvalid)
        .bail()
        .normalizeEmail()
        .isLength({ min: 3, max: 256 })
        .withMessage(errorMessages_1.default.emailLength)
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        return utils_1.default.emailExist(value).then(email => {
            if (email)
                return Promise.reject(errorMessages_1.default.emailTaken);
        });
    }))
];
module.exports.vPassword = [
    body("password")
        .isLength({ min: 8, max: 256 })
        .withMessage(errorMessages_1.default.pwLength)
        .matches(/^(((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(.{8,})/)
        .withMessage(errorMessages_1.default.pwAlpha),
    body("password2").custom((value, req) => __awaiter(void 0, void 0, void 0, function* () {
        if (value !== req.body.password)
            throw new Error(errorMessages_1.default.pwDontMatch);
        return true;
    }))
];
module.exports.vLostPw = [
    body("email")
        .trim()
        .isEmail()
        .withMessage(errorMessages_1.default.emailInvalid)
        .bail()
        .normalizeEmail()
        .isLength({ min: 3, max: 256 })
        .withMessage(errorMessages_1.default.emailLength)
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        return utils_1.default.emailExist(value).then(email => {
            if (!email)
                return Promise.reject(errorMessages_1.default.lostpwEmail);
        });
    }))
];
module.exports.vRegister = [
    body("email")
        .trim()
        .isEmail()
        .withMessage(errorMessages_1.default.emailInvalid)
        .bail()
        .normalizeEmail()
        .isLength({ min: 3, max: 256 })
        .withMessage(errorMessages_1.default.emailLength)
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        return utils_1.default.emailExist(value).then(email => {
            if (email)
                return Promise.reject(errorMessages_1.default.emailTaken);
        });
    })),
    body("password")
        .isLength({ min: 8, max: 256 })
        .withMessage(errorMessages_1.default.pwLength)
        .matches(/^(((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(.{8,})/)
        .withMessage(errorMessages_1.default.pwAlpha),
    body("password2").custom((value, req) => {
        if (value !== req.body.password)
            throw new Error(errorMessages_1.default.pwDontMatch);
        return true;
    })
];
module.exports.vLogin = [
    body("email")
        .trim()
        .isEmail()
        .withMessage(errorMessages_1.default.emailInvalid)
        .bail()
        .normalizeEmail()
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        return utils_1.default.emailExist(value).then(email => {
            if (!email)
                return Promise.reject(errorMessages_1.default.invalidCredentials);
        });
    })),
    body("password").isString()
];
module.exports.vResend = [
    body("email")
        .trim()
        .isEmail()
        .withMessage(errorMessages_1.default.emailInvalid)
        .bail()
        .normalizeEmail()
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        return utils_1.default.emailExist(value).then(email => {
            if (!email)
                return Promise.reject(errorMessages_1.default.invalidCredentials);
        });
    }))
];
