const express = require("express");
const rp = require("request-promise");
const router = express.Router();
const sanitize = require("mongo-sanitize");

const { ROLE, setUser, notLoggedUser, authUser, authRole } = require("./helpers/middlewares");
const utils = require("./helpers/utils");
const { ERROR_MESSAGE } = require("./helpers/errorMessages");
const PwToken = require("../models/PasswordToken");
require("dotenv").config();

router.get("/", (req, res) => {
	try {
		let obj = { csrfToken: req.csrfToken() };

		return res.status(200).render("index", obj);
	} catch (err) {
		console.log("HOME ROUTE ERROR:", err, req.headers, req.ipAddress);

		return res.status(200).render("error");
	}
});

router.get("/Auth", setUser, notLoggedUser, async (req, res) => {
	try {
		let obj = {
			active: "Account",
			headtitle: "Les éléphants rouges | Auth",
			description: "Les éléphants rouges, auth section",
			csrfToken: req.csrfToken()
		};
		if (req.session.formData) {
			obj.formData = req.session.formData;
			req.session.formData = undefined;
		}

		return res.status(200).render("Auth", obj);
	} catch (err) {
		console.log("AUTH ROUTE ERROR", err, req.headers, req.ipAddress);
		req.flash("warning", ERROR_MESSAGE.serverError);
		return res.status(400).redirect("/");
	}
});

router.get("/Resetpw/:tokenId/:token", setUser, notLoggedUser, async (req, res) => {
	try {
		let obj = {
			headtitle: "Les éléphants rouges | Auth",
			description: "Les éléphants rouges, récupérez votre mot de passe ici, juste au cas ou...",
			tokenId: sanitize(req.params.tokenId),
			token: sanitize(req.params.token),
			csrfToken: req.csrfToken()
		};

		let [err, pwToken] = await utils.to(PwToken.findOne({ _id: obj.tokenId, token: obj.token }));
		if (err || !pwToken) throw new Error(ERROR_MESSAGE.tokenNotFound);

		return res.status(200).render("Resetpw", obj);
	} catch (err) {
		console.log("RESETPW ROUTE ERROR", err, req.headers, req.ipAddress);
		req.flash("warning", err.message);
		return res.status(200).redirect("/Auth");
	}
});

router.get("/Admin", setUser, authUser, authRole(ROLE.ADMIN), async (req, res) => {
	try {
		let obj = {
			active: "Admin",
			headtitle: "Les éléphants rouges | Admin",
			description: "Les éléphants rouges, admin section",
			user: req.user,
			csrfToken: req.csrfToken()
		};

		return res.status(200).render("restricted/Admin", obj);
	} catch (err) {
		console.log("ADMIN ROUTE ERROR", err, req.headers, req.ipAddress);
		req.flash("warning", err.message);
		return res.status(400).redirect("/Auth");
	}
});

module.exports = router;
