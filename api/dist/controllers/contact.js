"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const rateLimit = __importStar(require("express-rate-limit"));
const rate_limit_mongo_1 = __importDefault(require("rate-limit-mongo"));
require("dotenv").config();
//const { setUser } = require("./helpers/middlewares.js");
const { vContact } = require("./validators/vContact");
const mailer_1 = __importDefault(require("./helpers/mailer"));
const utils_1 = __importDefault(require("./helpers/utils"));
const limiter = rateLimit({
    store: new rate_limit_mongo_1.default({
        uri: process.env.DB_CONNECTION,
        collectionName: "contactRateLimit",
        expireTimeMs: 6 * 60 * 60 * 1000
    }),
    windowMs: 6 * 60 * 60 * 1000,
    max: 5,
    handler: function (req, res) {
        res.status(200).json({ error: true, message: "Trop de requêtes, veuillez réessayer plus tard" });
    }
});
// Send us a mail
router.post("/", limiter, vContact, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subject = `FROM ${req.body.email} - ${req.body.title}`;
        const content = req.body.content;
        const formData = {
            email: req.body.email,
            subject: req.body.title,
            content: content
        };
        req.session.formData = formData;
        yield utils_1.default.checkValidity(req);
        if (!process.env.EMAIL || (yield mailer_1.default(process.env.EMAIL, subject, content)))
            throw new Error("Une erreur est survenue lors de l'envoi du mail, veuillez réessayer");
        console.log(`Contact mail sent: ${formData.email}`);
        return res.status(200).json({ error: false, message: "Mail envoyé avec succès" });
    }
    catch (err) {
        console.log("ERROR CONTACT:", err, req.headers);
        return res.status(200).json({ error: true, message: err.message });
    }
}));
exports.default = router;
