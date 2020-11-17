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
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const mongo_sanitize_1 = __importDefault(require("mongo-sanitize"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_mongo_1 = __importDefault(require("rate-limit-mongo"));
const { vRegister, vLogin, vPassword, vLostPw, vEmail } = require("./validators/vAuth"); //
const mailer_1 = __importDefault(require("./helpers/mailer"));
const utils_1 = __importDefault(require("./helpers/utils"));
const User_1 = __importDefault(require("../models/User"));
const PasswordToken_1 = __importDefault(require("../models/PasswordToken"));
const VerificationToken_1 = __importDefault(require("../models/VerificationToken"));
const { setUser, notLoggedUser, authUser, authToken } = require("./helpers/middlewares"); //
const errorMessages_1 = __importDefault(require("./helpers/errorMessages"));
require("dotenv").config({ path: "../.env" });
const limiter = express_rate_limit_1.default({
    store: new rate_limit_mongo_1.default({
        uri: process.env.DB_CONNECTION,
        collectionName: "authRateLimit",
        expireTimeMs: 6 * 60 * 60 * 1000
    }),
    windowMs: 6 * 60 * 60 * 1000,
    max: 20,
    handler: function (req, res) {
        res.status(200).json({ error: true, message: "Too many requests, please try again later" });
    }
});
const authlimiter = express_rate_limit_1.default({
    store: new rate_limit_mongo_1.default({
        uri: process.env.DB_CONNECTION,
        collectionName: "loginLimit",
        expireTimeMs: 6 * 60 * 60 * 1000
    }),
    windowMs: 6 * 60 * 60 * 1000,
    max: 10,
    handler: function (req, res) {
        res.status(200).json({ error: true, message: "Too many login attempts, please try again later" });
    },
    skipSuccessfulRequests: true
});
const registerlimiter = express_rate_limit_1.default({
    store: new rate_limit_mongo_1.default({
        uri: process.env.DB_CONNECTION,
        collectionName: "registerLimit",
        expireTimeMs: 6 * 60 * 60 * 1000
    }),
    windowMs: 6 * 60 * 60 * 1000,
    max: 15,
    handler: function (req, res) {
        res.status(200).json({ error: true, message: "Too many register attempts, please try again later" });
    }
});
const lostpwlimiter = express_rate_limit_1.default({
    store: new rate_limit_mongo_1.default({
        uri: process.env.DB_CONNECTION,
        collectionName: "lostPwLimit",
        expireTimeMs: 5 * 60 * 60 * 1000
    }),
    windowMs: 5 * 60 * 60 * 1000,
    max: 5,
    handler: function (req, res) {
        res.status(200).json({ error: true, message: "Too many requests, please try again later" });
    }
});
router.get("/isLogged", setUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.user)
            return res.status(200).json({ error: false, isLogged: true });
        return res.status(200).json({ error: false, isLogged: false });
    }
    catch (err) {
        console.log("ERROR CHECKING LOG STATE:", err, req.headers);
        return res.status(200).json({ error: true, message: err.message });
    }
}));
router.post("/register", registerlimiter, vRegister, setUser, notLoggedUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let err, result;
        req.session.formData = {
            email: req.body.email
        };
        yield utils_1.default.checkValidity(req);
        const hashPw = yield bcrypt_1.default.hash(req.body.password, 10);
        if (!hashPw)
            throw new Error(errorMessages_1.default.serverError);
        const user = new User_1.default({
            email: req.session.formData.email,
            password: hashPw
        });
        [err, result] = yield utils_1.default.to(user.save());
        if (err)
            throw new Error(errorMessages_1.default.createAccount);
        console.log(`Account created: ${user._id}`);
        return res.status(200).json({ error: false, message: errorMessages_1.default.accountCreated });
    }
    catch (err) {
        console.log("ERROR REGISTER:", err, req.headers);
        return res.status(200).json({ error: true, message: err.message });
    }
}));
router.post("/login", vLogin, setUser, notLoggedUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.session.formData = { email: req.body.email };
        yield utils_1.default.checkValidity(req);
        let [err, user] = yield utils_1.default.to(User_1.default.findOne({ email: req.body.email }));
        if (err)
            throw new Error(errorMessages_1.default.serverError);
        if (!user)
            throw new Error(errorMessages_1.default.invalidCredentials);
        const validPw = yield bcrypt_1.default.compare(req.body.password, user.password);
        if (!validPw)
            throw new Error(errorMessages_1.default.invalidCredentials);
        // Create session variable
        req.session._id = user._id;
        console.log(`User log in: ${user._id}`);
        //req.flash("success", ERROR_MESSAGE.loggedIn);
        return res.status(200).json({ error: false });
    }
    catch (err) {
        console.log("ERROR LOGIN:", err, req.headers);
        return res.status(200).json({ error: true, message: err.message });
    }
}));
router.get("/logout", setUser, authUser, (req, res) => {
    try {
        req.session.destroy(function (err) {
            if (err)
                throw new Error(errorMessages_1.default.serverError);
        });
        return res.status(200).redirect("/");
    }
    catch (err) {
        console.log("ERROR LOGOUT:", err, req.headers);
        //req.flash("warning", err.message);
        return res.status(400).redirect("/");
    }
});
router.post("/lostpw", vLostPw, setUser, notLoggedUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //lostpwlimiter
    try {
        let err, user, pwToken, result;
        yield utils_1.default.checkValidity(req);
        [err, user] = yield utils_1.default.to(User_1.default.findOne({ email: req.body.email }));
        if (err || !user)
            throw new Error(errorMessages_1.default.userNotFound);
        [err, pwToken] = yield utils_1.default.to(PasswordToken_1.default.findOne({ _userId: user._id }));
        if (err)
            throw new Error(errorMessages_1.default.serverError);
        const token = crypto_1.default.randomBytes(16).toString("hex");
        if (pwToken === null) {
            pwToken = new PasswordToken_1.default({ _userId: user._id, token: token });
            [err, result] = yield utils_1.default.to(pwToken.save());
            if (err)
                throw new Error(errorMessages_1.default.saveError);
        }
        else {
            [err, result] = yield utils_1.default.to(PasswordToken_1.default.updateOne({ _userId: user._id }, { $set: { token: token } }));
            if (err)
                throw new Error(errorMessages_1.default.saveError);
        }
        const subject = "Récupération de mot de passe pour Les éléphants rouges";
        const content = "Bonjour, vous avez demandé à récupérer votre mot de passe, cliquez sur ce lien afin de changer votre mot de passe";
        if (yield mailer_1.default(req.body.email, subject, content, `${process.env.BASEURL}/resetpw/${pwToken._id}/${token}`))
            throw new Error(errorMessages_1.default.sendMail);
        console.log(`Lostpw request token: ${user.email}/${user._id}`);
        //req.flash("success", ERROR_MESSAGE.lostpwEmail);
        return res.status(200).json({ error: false, message: "Un e-mail a ete en envoye" });
    }
    catch (err) {
        console.log("ERROR LOSTPW:", err, req.headers);
        return res.status(200).json({ error: true, message: err.message });
    }
}));
router.post("/resetpw", vPassword, setUser, notLoggedUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let err, pwToken, user;
        yield utils_1.default.checkValidity(req);
        const hashPw = yield bcrypt_1.default.hash(req.body.password, 10);
        if (!hashPw)
            throw new Error(errorMessages_1.default.serverError);
        [err, pwToken] = yield utils_1.default.to(PasswordToken_1.default.findOne({ _id: req.body.tokenId, token: req.body.token }));
        if (err || !pwToken)
            throw new Error(errorMessages_1.default.tokenNotFound);
        [err, user] = yield utils_1.default.to(User_1.default.updateOne({ _id: pwToken._userId }, { $set: { password: hashPw } }));
        if (err)
            throw new Error(errorMessages_1.default.userUpdate);
        [err, pwToken] = yield utils_1.default.to(PasswordToken_1.default.deleteOne({ _id: req.body.tokenId }));
        if (err)
            throw new Error(errorMessages_1.default.serverError);
        console.log(`Resetpw success: ${user._id}`);
        //req.flash("success", ERROR_MESSAGE.updatedPw);
        return res.status(200).redirect("/Auth");
    }
    catch (err) {
        console.log("ERROR RESETPW:", err, req.headers);
        //req.flash("warning", err.message);
        return res.status(400).redirect(`/Resetpw/${req.body.tokenId}/${req.body.token}`);
    }
}));
router.post("/patch/email", limiter, vEmail, setUser, authUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let err, user, token, result;
        yield utils_1.default.checkValidity(req);
        const newEmail = req.body.email;
        const id = req.user._id;
        const vToken = crypto_1.default.randomBytes(16).toString("hex");
        [err, user] = yield utils_1.default.to(User_1.default.updateOne({ _id: id }, { $set: { email: newEmail, isVerified: false } }));
        if (err || !user)
            throw new Error(errorMessages_1.default.userUpdate);
        let newtoken = new VerificationToken_1.default({ _userId: id, token: vToken });
        [err, result] = yield utils_1.default.to(newtoken.save());
        if (err)
            throw new Error(errorMessages_1.default.saveError);
        const subject = "Confirmation de changement d'email pour Les éléphants rouges";
        const content = "Bonjour, vous avez demandé à changer votre email, cliquez sur ce lien afin de confirmer le changement";
        if (yield mailer_1.default(newEmail, subject, content, `${process.env.BASEURL}/api/auth/confirmation/${vToken}`))
            throw new Error(errorMessages_1.default.sendMail);
        console.log(`Email patched: ${newEmail}/${id}`);
        return res.status(200).json({ error: false, message: errorMessages_1.default.updatedEmail });
    }
    catch (err) {
        console.log("ERROR PATCHING EMAIL:", err, req.headers);
        return res.status(400).json({ error: true, message: err.message });
    }
}));
// Confirm account with token
router.get("/confirmation/:token", limiter, setUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let err, token, user;
        const receivedToken = mongo_sanitize_1.default(req.params.token);
        if (typeof receivedToken !== "string")
            throw new Error(errorMessages_1.default.tokenNotFound);
        [err, token] = yield utils_1.default.to(VerificationToken_1.default.findOne({ token: receivedToken }));
        if (err || !token)
            throw new Error(errorMessages_1.default.tokenNotFound);
        [err, user] = yield utils_1.default.to(User_1.default.findOne({ _id: token._userId }));
        if (err || !user)
            throw new Error(errorMessages_1.default.userNotFound);
        if (user.isVerified)
            throw new Error(errorMessages_1.default.alreadyVerified);
        user.isVerified = true;
        [err, user] = yield utils_1.default.to(user.save());
        if (err)
            throw new Error(err.message);
        [err, token] = yield utils_1.default.to(VerificationToken_1.default.findOneAndDelete({ token: receivedToken }));
        if (err || !token)
            throw new Error(errorMessages_1.default.saveError);
        console.log(`Account verified: ${user._id}`);
        //req.flash("success", ERROR_MESSAGE.verified);
        return res.status(200).redirect("/Auth");
    }
    catch (err) {
        console.log("ERROR CONFIRMATION TOKEN:", err, req.headers);
        //req.flash("warning", err.message);
        return res.status(400).redirect("/Auth");
    }
}));
router.post("/patch/password", limiter, vPassword, setUser, authUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield utils_1.default.checkValidity(req);
        const cpassword = req.body.cpassword;
        const password = req.body.password;
        let err, user, result;
        [err, user] = yield utils_1.default.to(User_1.default.findOne({ email: req.user.email }));
        if (err)
            throw new Error(errorMessages_1.default.serverError);
        if (!user)
            throw new Error(errorMessages_1.default.invalidCredentials);
        const validPw = yield bcrypt_1.default.compare(cpassword, user.password);
        if (!validPw)
            throw new Error(errorMessages_1.default.invalidCredentials);
        const hashPw = yield bcrypt_1.default.hash(password, 10);
        if (!hashPw)
            throw new Error(errorMessages_1.default.serverError);
        [err, result] = yield utils_1.default.to(User_1.default.updateOne({ _id: user._id }, { $set: { password: hashPw } }));
        if (err || !result)
            throw new Error(errorMessages_1.default.userUpdate);
        console.log(`Password patched: ${user._id}`);
        return res.status(200).json({ error: false, message: errorMessages_1.default.updatedPw });
    }
    catch (err) {
        console.log("ERROR PATCHING PASSWORD:", err, req.headers);
        return res.status(400).json({ error: true, message: err.message });
    }
}));
exports.default = router;
