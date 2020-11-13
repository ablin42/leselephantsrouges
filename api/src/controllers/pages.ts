import express from "express";
import rp from "request-promise";
const router = express.Router();
import sanitize from "mongo-sanitize";

const { ROLE, setUser, notLoggedUser, authUser, authRole, setEvent, setVideo } = require("./helpers/middlewares");
import utils from "./helpers/utils";
import Video from "../models/Video";
import Image from "../models/Image";
import ERROR_MESSAGE from "./helpers/errorMessages";
import PwToken from "../models/PasswordToken";
require("dotenv").config({ path: '../.env' });

router.get("/", async (req, res) => {
	try {
		let obj = { csrfToken: req.csrfToken() };

		return res.status(200).render("index", obj);
	} catch (err) {
		console.log("HOME ROUTE ERROR:", err, req.headers);

		return res.status(200).render("error");
	}
});

router.get("/vidrender", setUser, async (req, res) => {
	try {
		let obj = {
			active: "vidrenders",
			csrfToken: req.csrfToken(),
			user: req.user,
			videos: []
		};

		let options = {
			method: "GET",
			uri: `${process.env.BASEURL}/api/videos/`,
			json: true
		};
		let response = await rp(options);
		if (response.error === false) obj.videos = response.videos;
		else throw new Error(response.message);

		return res.status(200).render("vidrender", obj);
	} catch (err) {
		console.log("HOME ROUTE ERROR:", err, req.headers);
		//req.flash("warning", err.message);
		return res.status(200).render("error");
	}
});

router.get("/eventrender", setUser, async (req, res) => {
	try {
		let obj = {
			active: "eventrender",
			csrfToken: req.csrfToken(),
			user: req.user,
			events: []
		};

		let options = {
			method: "GET",
			uri: `${process.env.BASEURL}/api/events/`,
			json: true
		};
		let response = await rp(options);
		if (response.error === false) obj.events = response.events;
		else throw new Error(response.message);

		return res.status(200).render("eventrender", obj);
	} catch (err) {
		console.log("HOME ROUTE ERROR:", err, req.headers);
		//req.flash("warning", err.message);
		return res.status(200).render("error");
	}
});

router.get("/Auth", setUser, notLoggedUser, async (req, res) => {
	try {
		let obj = {
			active: "Account",
			headtitle: "Les éléphants rouges | Auth",
			description: "Les éléphants rouges, auth section",
			csrfToken: req.csrfToken(),
			formData: {}
		};
		obj.formData = req!.session!.formData;
		req!.session!.formData = undefined;

		return res.status(200).render("Auth", obj);
	} catch (err) {
		console.log("AUTH ROUTE ERROR", err, req.headers);
		//req.flash("warning", ERROR_MESSAGE.serverError);
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
		console.log("RESETPW ROUTE ERROR", err, req.headers);
		//req.flash("warning", err.message);
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
		console.log("ADMIN ROUTE ERROR", err, req.headers);
		//req.flash("warning", err.message);
		return res.status(400).redirect("/Auth");
	}
});

router.get("/Admin/Settings", setUser, authUser, authRole(ROLE.ADMIN), async (req, res) => {
	try {
		let obj = {
			active: "Admin Settings",
			headtitle: "Les éléphants rouges | Admin Settings",
			description: "Les éléphants rouges, settings section",
			user: req.user,
			csrfToken: req.csrfToken()
		};

		return res.status(200).render("restricted/settings", obj);
	} catch (err) {
		console.log("ADMIN ROUTE ERROR", err, req.headers);
		//req.flash("warning", err.message);
		return res.status(400).redirect("/Admin");
	}
});

router.get("/Admin/Videos", setUser, authUser, authRole(ROLE.ADMIN), async (req, res) => {
	try {
		let obj = {
			active: "Admin Videos",
			headtitle: "Les éléphants rouges | Admin Videos",
			description: "Les éléphants rouges, videos section",
			user: req.user,
			csrfToken: req.csrfToken()
		};

		return res.status(200).render("restricted/postVideo", obj);
	} catch (err) {
		console.log("ADMIN VIDEOS ROUTE ERROR", err, req.headers);
		//req.flash("warning", err.message);
		return res.status(400).redirect("/Admin");
	}
});

router.get("/Admin/Videos/Patch/:id", setVideo, setUser, authUser, authRole(ROLE.ADMIN), async (req, res) => {
	try {
		let obj = {
			active: "Admin Videos Edit",
			headtitle: "Les éléphants rouges | Admin Videos Edit",
			description: "Les éléphants rouges, videos section",
			user: req.user,
			csrfToken: req.csrfToken(),
			video: {},
			image: ""
		};
		const id = sanitize(req.params.id);
		obj.video = JSON.parse(JSON.stringify(req.video));
		//obj.video.url = await utils.revertUrlFormat(obj.video.url);

		let [err, img] = await utils.to(Image.findOne({ _itemId: id }));
		if (err || !img) throw new Error(ERROR_MESSAGE.fetchError);
		obj.image = img;

		return res.status(200).render("restricted/patchVideo", obj);
	} catch (err) {
		console.log("ADMIN PATCH VIDEOS ROUTE ERROR", err, req.headers);
		//req.flash("warning", err.message);
		return res.status(400).redirect("/Admin");
	}
});

router.get("/Admin/Events", setUser, authUser, authRole(ROLE.ADMIN), async (req, res) => {
	try {
		let obj = {
			active: "Admin Events",
			headtitle: "Les éléphants rouges | Admin",
			description: "Les éléphants rouges, events section",
			user: req.user,
			csrfToken: req.csrfToken()
		};

		return res.status(200).render("restricted/postEvent", obj);
	} catch (err) {
		console.log("ADMIN EVENTS ROUTE ERROR", err, req.headers);
		//req.flash("warning", err.message);
		return res.status(400).redirect("/Admin");
	}
});

router.get("/Admin/Events/Patch/:id", setEvent, setUser, authUser, authRole(ROLE.ADMIN), async (req, res) => {
	try {
		let obj = {
			active: "Admin Events Edit",
			headtitle: "Les éléphants rouges | Admin Events Edit",
			description: "Les éléphants rouges, events section",
			user: req.user,
			csrfToken: req.csrfToken(),
			event: {}
		};
		const id = sanitize(req.params.id);
		obj.event = JSON.parse(JSON.stringify(req.event));
		// if (obj.event.url && obj.event.url != "") obj.event.url = await utils.revertUrlFormat(obj.event.url);

		// if (obj.event.eventStart) obj.event.eventStart = obj.event.eventStart.substr(0, obj.event.eventStart.length - 8);
		// if (obj.event.eventEnd) obj.event.eventEnd = obj.event.eventEnd.substr(0, obj.event.eventEnd.length - 8);

		// let [err, img] = await utils.to(Image.findOne({ _itemId: id }));
		// if (err) throw new Error(ERROR_MESSAGE.fetchError);
		// if (img) obj.image = img;

		return res.status(200).render("restricted/patchEvent", obj);
	} catch (err) {
		console.log("ADMIN PATCH EVENTS ROUTE ERROR", err, req.headers);
		//req.flash("warning", err.message);
		return res.status(400).redirect("/Admin");
	}
});

export default router;
