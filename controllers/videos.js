const express = require("express");
const router = express.Router();
const rp = require("request-promise");
const sanitize = require("mongo-sanitize");
const rateLimit = require("express-rate-limit");
const MongoStore = require("rate-limit-mongo");

const { vVideo } = require("./validators/vVideo");
const utils = require("./helpers/utils");
const User = require("../models/User");
const { setUser, authUser, authRole } = require("./helpers/middlewares");
const { ERROR_MESSAGE } = require("./helpers/errorMessages");
const Video = require("../models/Video");
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

router.get("/", async (req, res) => {
	try {
		const options = {
			page: parseInt(req.query.page, 10) || 1,
			limit: 12,
			sort: { date: -1 }
		};
		let videos;

		let [err, result] = await utils.to(Video.paginate({}, options));
		if (err) throw new Error(ERROR_MESSAGE.fetchError);

		videos = result.docs;
		if (videos.length == 0) throw new Error(ERROR_MESSAGE.noResult);
		//videos = await vHelpers.fetchMainImg(videos);

		return res.status(200).json({ error: false, videos: videos });
	} catch (err) {
		console.log("FETCHING VIDEOS ERROR:", err, req.headers, req.ipAddress);
		return res.status(200).json({ error: true, message: err.message });
	}
});

router.post("/", vVideo, setUser, authUser, authRole("admin"), async (req, res) => {
	//vVideo
	try {
		await utils.checkValidity(req);
		const obj = {
			title: req.body.title,
			description: req.body.description,
			url: await utils.parseUrl(req.body.url),
			coverPath: "bide",
			isFiction: req.body.isFiction,
			authors: await utils.parseAuthors(req.body.authors)
		};

		const newVideo = new Video(obj);
		let [err, result] = await utils.to(newVideo.save());
		if (err) throw new Error(ERROR_MESSAGE.saveError);

		console.log(`Video added: ${newVideo._id}`);
		return res.status(200).json({ error: false, message: "Vidéo ajoutée avec succès !" });
	} catch (err) {
		console.log("ERROR POSTING VIDEO:", err, req.headers, req.ipAddress);
		return res.status(200).json({ error: true, message: err.message });
	}
});

module.exports = router;
