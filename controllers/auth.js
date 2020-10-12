const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const rp = require("request-promise");
const sanitize = require("mongo-sanitize");
const rateLimit = require("express-rate-limit");
const MongoStore = require("rate-limit-mongo");

const { vRegister, vLogin, vPassword, vLostPw } = require("./validators/vAuth");
const mailer = require("./helpers/mailer");
const utils = require("./helpers/utils");
const User = require("../models/User");
const PwToken = require("../models/PasswordToken");
//const CookieAccept = require("../models/CookieAccept");
const Token = require("../models/VerificationToken");
const { setUser, notLoggedUser, authUser, authToken } = require("./helpers/middlewares");
const { ERROR_MESSAGE } = require("./helpers/errorMessages");
require("dotenv").config();

const limiter = rateLimit({
	store: new MongoStore({
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

const authlimiter = rateLimit({
	store: new MongoStore({
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

const registerlimiter = rateLimit({
	store: new MongoStore({
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

const lostpwlimiter = rateLimit({
	store: new MongoStore({
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

router.post("/register", registerlimiter, vRegister, setUser, notLoggedUser, async (req, res) => {
	try {
		let err, result;
		req.session.formData = {
			email: req.body.email
		};
		await utils.checkValidity(req);

		const hashPw = await bcrypt.hash(req.body.password, 10);
		if (!hashPw) throw new Error(ERROR_MESSAGE.serverError);

		const user = new User({
			email: req.session.formData.email,
			password: hashPw
		});

		[err, result] = await utils.to(user.save());
		if (err) throw new Error(ERROR_MESSAGE.createAccount);

		console.log(`Account created: ${user._id}`);
		return res.status(200).json({ error: false, message: ERROR_MESSAGE.accountCreated });
	} catch (err) {
		console.log("ERROR REGISTER:", err, req.headers, req.ipAddress);
		return res.status(200).json({ error: true, message: err.message });
	}
});

router.post("/login", authlimiter, vLogin, setUser, notLoggedUser, async (req, res) => {
	try {
		req.session.formData = { email: req.body.email };

		await utils.checkValidity(req);

		let [err, user] = await utils.to(User.findOne({ email: req.body.email }));
		if (err) throw new Error(ERROR_MESSAGE.serverError);
		if (!user) throw new Error(ERROR_MESSAGE.invalidCredentials);

		const validPw = await bcrypt.compare(req.body.password, user.password);
		if (!validPw) throw new Error(ERROR_MESSAGE.invalidCredentials);

		// Create session variable
		req.session._id = user._id;

		console.log(`User log in: ${user._id}`);
		req.flash("success", ERROR_MESSAGE.loggedIn);
		return res.status(200).json({ error: false });
	} catch (err) {
		console.log("ERROR LOGIN:", err, req.headers, req.ipAddress);
		return res.status(200).json({ error: true, message: err.message });
	}
});

router.get("/logout", setUser, authUser, (req, res) => {
	try {
		req.session.destroy(function (err) {
			if (err) throw new Error(ERROR_MESSAGE.serverError);
		});

		return res.status(200).redirect("/");
	} catch (err) {
		console.log("ERROR LOGOUT:", err, req.headers, req.ipAddress);
		req.flash("warning", err.message);
		return res.status(400).redirect("/");
	}
});

router.post("/lostpw", vLostPw, setUser, notLoggedUser, async (req, res) => {
	//lostpwlimiter
	try {
		let err, user, pwToken, result;
		await utils.checkValidity(req);

		[err, user] = await utils.to(User.findOne({ email: req.body.email }));
		if (err || !user) throw new Error(ERROR_MESSAGE.userNotFound);

		[err, pwToken] = await utils.to(PwToken.findOne({ _userId: user._id }));
		if (err) throw new Error(ERROR_MESSAGE.serverError);

		const token = crypto.randomBytes(16).toString("hex");
		if (pwToken === null) {
			pwToken = new PwToken({ _userId: user._id, token: token });
			[err, result] = await utils.to(pwToken.save());
			if (err) throw new Error(ERROR_MESSAGE.saveError);
		} else {
			[err, result] = await utils.to(PwToken.updateOne({ _userId: user._id }, { $set: { token: token } }));
			if (err) throw new Error(ERROR_MESSAGE.saveError);
		}

		const subject = "Récupération de mot de passe pour Les éléphants rouges";
		const content =
			"Bonjour, vous avez demandé à récupérer votre mot de passe, cliquez sur ce lien afin de changer votre mot de passe";
		if (await mailer(req.body.email, subject, content, `${process.env.BASEURL}/resetpw/${pwToken._id}/${token}`))
			throw new Error(ERROR_MESSAGE.sendMail);

		console.log(`Lostpw request token: ${user.email}/${user._id}`);
		req.flash("success", ERROR_MESSAGE.lostpwEmail);
		return res.status(200).json({ error: false });
	} catch (err) {
		console.log("ERROR LOSTPW:", err, req.headers, req.ipAddress);
		return res.status(200).json({ error: true, message: err.message });
	}
});

router.post("/resetpw", vPassword, setUser, notLoggedUser, async (req, res) => {
	try {
		let err, pwToken, user;
		await utils.checkValidity(req);

		const hashPw = await bcrypt.hash(req.body.password, 10);
		if (!hashPw) throw new Error(ERROR_MESSAGE.serverError);

		[err, pwToken] = await utils.to(PwToken.findOne({ _id: req.body.tokenId, token: req.body.token }));
		if (err || !pwToken) throw new Error(ERROR_MESSAGE.tokenNotFound);

		[err, user] = await utils.to(User.updateOne({ _id: pwToken._userId }, { $set: { password: hashPw } }));
		if (err) throw new Error(ERROR_MESSAGE.userUpdate);

		[err, pwToken] = await utils.to(PwToken.deleteOne({ _id: req.body.tokenId }));
		if (err) throw new Error(ERROR_MESSAGE.serverError);

		console.log(`Resetpw success: ${user._id}`);
		req.flash("success", ERROR_MESSAGE.updatedPw);
		return res.status(200).redirect("/Auth");
	} catch (err) {
		console.log("ERROR RESETPW:", err, req.headers, req.ipAddress);
		req.flash("warning", err.message);
		return res.status(400).redirect(`/Resetpw/${req.body.tokenId}/${req.body.token}`);
	}
});

module.exports = router;
