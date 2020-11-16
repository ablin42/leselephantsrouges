import express, { Request } from "express";
const router = express.Router();
import bcrypt from "bcrypt";
import crypto from "crypto";
import sanitize from "mongo-sanitize";
import rateLimit from "express-rate-limit";
import MongoStore from "rate-limit-mongo";

const { vRegister, vLogin, vPassword, vLostPw, vEmail } = require("./validators/vAuth"); //
import mailer from "./helpers/mailer";
import utils from "./helpers/utils";

import User from "../models/User";
import PwToken from "../models/PasswordToken";
import Token from "../models/VerificationToken";

const { setUser, notLoggedUser, authUser, authToken } = require("./helpers/middlewares"); //
import ERROR_MESSAGE from "./helpers/errorMessages";
require("dotenv").config({ path: "../.env" });

const limiter = rateLimit({
	store: new MongoStore({
		uri: process.env.DB_CONNECTION,
		collectionName: "authRateLimit",
		expireTimeMs: 6 * 60 * 60 * 1000
	}),
	windowMs: 6 * 60 * 60 * 1000,
	max: 20,
	handler: function (req: express.Request, res: express.Response) {
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
	handler: function (req: express.Request, res: express.Response) {
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
	handler: function (req: express.Request, res: express.Response) {
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
	handler: function (req: express.Request, res: express.Response) {
		res.status(200).json({ error: true, message: "Too many requests, please try again later" });
	}
});

router.get("/", async (req, res) => {
	let [err, user] = await utils.to(User.find());
	if (err) throw new Error(ERROR_MESSAGE.serverError);
	if (!user) throw new Error(ERROR_MESSAGE.invalidCredentials);
	res.status(200).json(user);
});

router.post("/register", registerlimiter, vRegister, setUser, notLoggedUser, async (req, res) => {
	try {
		let err, result;
		req!.session!.formData = {
			email: req.body.email
		};
		await utils.checkValidity(req);

		const hashPw = await bcrypt.hash(req.body.password, 10);
		if (!hashPw) throw new Error(ERROR_MESSAGE.serverError);

		const user = new User({
			email: req!.session!.formData.email,
			password: hashPw
		});

		[err, result] = await utils.to(user.save());
		if (err) throw new Error(ERROR_MESSAGE.createAccount);

		console.log(`Account created: ${user._id}`);
		return res.status(200).json({ error: false, message: ERROR_MESSAGE.accountCreated });
	} catch (err) {
		console.log("ERROR REGISTER:", err, req.headers);
		return res.status(200).json({ error: true, message: err.message });
	}
});

// interface Session {
// 	formData?: object;
// 	_id?: string;
// }

// interface Request {
// 	session: Session;
// }

router.post("/login", vLogin, setUser, notLoggedUser, async (req, res) => {
	try {
		req!.session!.formData = { email: req.body.email };
		await utils.checkValidity(req);

		let [err, user] = await utils.to(User.findOne({ email: req.body.email }));
		if (err) throw new Error(ERROR_MESSAGE.serverError);
		if (!user) throw new Error(ERROR_MESSAGE.invalidCredentials);

		const validPw = await bcrypt.compare(req.body.password, user.password);
		if (!validPw) throw new Error(ERROR_MESSAGE.invalidCredentials);

		// Create session variable
		req!.session!._id = user._id;

		console.log(`User log in: ${user._id}`);
		//req.flash("success", ERROR_MESSAGE.loggedIn);
		return res.status(200).json({ error: false });
	} catch (err) {
		console.log("ERROR LOGIN:", err, req.headers);
		return res.status(200).json({ error: true, message: err.message });
	}
});

router.get("/logout", setUser, authUser, (req, res) => {
	try {
		req!.session!.destroy(function (err) {
			if (err) throw new Error(ERROR_MESSAGE.serverError);
		});

		return res.status(200).redirect("/");
	} catch (err) {
		console.log("ERROR LOGOUT:", err, req.headers);
		//req.flash("warning", err.message);
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
		//req.flash("success", ERROR_MESSAGE.lostpwEmail);
		return res.status(200).json({ error: false, message: "Un e-mail a ete en envoye" });
	} catch (err) {
		console.log("ERROR LOSTPW:", err, req.headers);
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
		//req.flash("success", ERROR_MESSAGE.updatedPw);
		return res.status(200).redirect("/Auth");
	} catch (err) {
		console.log("ERROR RESETPW:", err, req.headers);
		//req.flash("warning", err.message);
		return res.status(400).redirect(`/Resetpw/${req.body.tokenId}/${req.body.token}`);
	}
});

router.post("/patch/email", limiter, vEmail, setUser, authUser, async (req, res) => {
	try {
		let err, user, token, result;
		await utils.checkValidity(req);
		const newEmail = req.body.email;
		const id = req!.user!._id;
		const vToken = crypto.randomBytes(16).toString("hex");

		[err, user] = await utils.to(User.updateOne({ _id: id }, { $set: { email: newEmail, isVerified: false } }));
		if (err || !user) throw new Error(ERROR_MESSAGE.userUpdate);

		let newtoken = new Token({ _userId: id, token: vToken });
		[err, result] = await utils.to(newtoken.save());
		if (err) throw new Error(ERROR_MESSAGE.saveError);

		const subject = "Confirmation de changement d'email pour Les éléphants rouges";
		const content = "Bonjour, vous avez demandé à changer votre email, cliquez sur ce lien afin de confirmer le changement";
		if (await mailer(newEmail, subject, content, `${process.env.BASEURL}/api/auth/confirmation/${vToken}`))
			throw new Error(ERROR_MESSAGE.sendMail);

		console.log(`Email patched: ${newEmail}/${id}`);
		return res.status(200).json({ error: false, message: ERROR_MESSAGE.updatedEmail });
	} catch (err) {
		console.log("ERROR PATCHING EMAIL:", err, req.headers);
		return res.status(400).json({ error: true, message: err.message });
	}
});

// Confirm account with token
router.get("/confirmation/:token", limiter, setUser, async (req, res) => {
	try {
		let err, token, user;
		const receivedToken = sanitize(req.params.token);
		if (typeof receivedToken !== "string") throw new Error(ERROR_MESSAGE.tokenNotFound);

		[err, token] = await utils.to(Token.findOne({ token: receivedToken }));
		if (err || !token) throw new Error(ERROR_MESSAGE.tokenNotFound);

		[err, user] = await utils.to(User.findOne({ _id: token._userId }));
		if (err || !user) throw new Error(ERROR_MESSAGE.userNotFound);

		if (user.isVerified) throw new Error(ERROR_MESSAGE.alreadyVerified);

		user.isVerified = true;
		[err, user] = await utils.to(user.save());
		if (err) throw new Error(err.message);

		[err, token] = await utils.to(Token.findOneAndDelete({ token: receivedToken }));
		if (err || !token) throw new Error(ERROR_MESSAGE.saveError);

		console.log(`Account verified: ${user._id}`);
		//req.flash("success", ERROR_MESSAGE.verified);
		return res.status(200).redirect("/Auth");
	} catch (err) {
		console.log("ERROR CONFIRMATION TOKEN:", err, req.headers);
		//req.flash("warning", err.message);
		return res.status(400).redirect("/Auth");
	}
});

router.post("/patch/password", limiter, vPassword, setUser, authUser, async (req, res) => {
	try {
		await utils.checkValidity(req);
		const cpassword = req.body.cpassword;
		const password = req.body.password;
		let err, user, result;

		[err, user] = await utils.to(User.findOne({ email: req!.user!.email }));
		if (err) throw new Error(ERROR_MESSAGE.serverError);
		if (!user) throw new Error(ERROR_MESSAGE.invalidCredentials);

		const validPw = await bcrypt.compare(cpassword, user.password);
		if (!validPw) throw new Error(ERROR_MESSAGE.invalidCredentials);

		const hashPw = await bcrypt.hash(password, 10);
		if (!hashPw) throw new Error(ERROR_MESSAGE.serverError);

		[err, result] = await utils.to(User.updateOne({ _id: user._id }, { $set: { password: hashPw } }));
		if (err || !result) throw new Error(ERROR_MESSAGE.userUpdate);

		console.log(`Password patched: ${user._id}`);
		return res.status(200).json({ error: false, message: ERROR_MESSAGE.updatedPw });
	} catch (err) {
		console.log("ERROR PATCHING PASSWORD:", err, req.headers);
		return res.status(400).json({ error: true, message: err.message });
	}
});

export default router;
