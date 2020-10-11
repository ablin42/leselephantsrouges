const express = require("express");
const router = express.Router();
const { vContact } = require("./validators/vContact");
const rateLimit = require("express-rate-limit");
const MongoStore = require("rate-limit-mongo");

//const { setUser } = require("./helpers/middlewares.js");
const mailer = require("./helpers/mailer");
require("dotenv").config();
const utils = require("./helpers/utils");

const limiter = rateLimit({
	store: new MongoStore({
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
router.post("/", limiter, vContact, async (req, res) => {
	try {
		const subject = `FROM ${req.body.email} - ${req.body.title}`;
		const content = req.body.content;
		const formData = {
			email: req.body.email,
			subject: req.body.title,
			content: content
		};
		req.session.formData = formData;
		await utils.checkValidity(req);

		if (await mailer(process.env.EMAIL, subject, content))
			throw new Error("Une erreur est survenue lors de l'envoi du mail, veuillez réessayer");

		console.log(`Contact mail sent: ${formData.email}`);
		return res.status(200).json({ error: false, message: "Mail envoyé avec succès" });
	} catch (err) {
		console.log("ERROR CONTACT:", err, req.headers, req.ipAddress);
		return res.status(200).json({ error: true, message: err.message });
	}
});

module.exports = router;
