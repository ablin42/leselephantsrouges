const express = require("express");
const router = express.Router();
const rp = require("request-promise");
const sanitize = require("mongo-sanitize");
const rateLimit = require("express-rate-limit");
const MongoStore = require("rate-limit-mongo");

const upload = require("./helpers/multer");
const { vVideo } = require("./validators/vVideo");
const utils = require("./helpers/utils");
const vHelpers = require("./helpers/videoHelpers");
const { setUser, authUser, authRole, errorHandler, setVideo } = require("./helpers/middlewares");
const { ERROR_MESSAGE } = require("./helpers/errorMessages");
const Video = require("../models/Video");
const aws = require("aws-sdk");
aws.config.region = process.env.AWS_REGION;
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
		videos = await vHelpers.fetchMainImg(videos);

		return res.status(200).json({ error: false, videos: videos });
	} catch (err) {
		console.log("FETCHING VIDEOS ERROR:", err, req.headers, req.ipAddress);
		return res.status(200).json({ error: true, message: err.message });
	}
});

router.post("/", upload, errorHandler, vVideo, setUser, authUser, authRole("admin"), async (req, res) => {
	try {
		await utils.checkValidity(req);
		const obj = {
			title: req.body.title,
			description: req.body.description,
			url: await utils.parseUrl(req.body.url),
			isFiction: req.body.isFiction,
			authors: await utils.parseAuthors(req.body.authors)
		};
		let imgData = await utils.parseImgData(req.files);

		let newVideo = new Video(obj);
		let [err, result] = await utils.to(newVideo.save());
		if (err) throw new Error(ERROR_MESSAGE.saveError);

		err = await utils.saveImages(imgData, result._id, "cover");
		if (err) throw new Error(err);

		console.log(`Video added: ${newVideo._id}`);
		return res.status(200).json({ error: false, message: "Vidéo ajoutée avec succès !" });
	} catch (err) {
		console.log("ERROR POSTING VIDEO:", err, req.headers, req.ipAddress);
		return res.status(200).json({ error: true, message: err.message });
	}
});

//patch route
router.post("/:id", upload, errorHandler, vVideo, setVideo, setUser, authUser, authRole("admin"), async (req, res) => {
	try {
		await utils.checkValidity(req);
		const id = sanitize(req.params.id);
		const obj = {
			title: req.body.title,
			description: req.body.description,
			url: await utils.parseUrl(req.body.url),
			isFiction: req.body.isFiction,
			authors: await utils.parseAuthors(req.body.authors)
		};

		if (req.files.length > 0) imgData = await utils.parseImgData(req.files);

		let [err, result] = await utils.to(Video.updateOne({ _id: id }, { $set: obj }));
		if (err) throw new Error(ERROR_MESSAGE.updateError);
		if (!result) throw new Error(ERROR_MESSAGE.noResult);

		if (req.files.length > 0) {
			err = await utils.patchImages(imgData, id, "cover");
			if (err) throw new Error(err);
		}

		console.log(`Video edited: ${id}`);
		return res.status(200).json({ error: false, message: "Vidéo modifiée avec succès !" });
	} catch (err) {
		console.log("ERROR PATCHING VIDEO:", err, req.headers, req.ipAddress);
		return res.status(200).json({ error: true, message: err.message });
	}
});

//needs del route too
//patch route
router.post("/delete/:id", upload, errorHandler, vVideo, setVideo, setUser, authUser, authRole("admin"), async (req, res) => {
	try {
		await utils.checkValidity(req);
		const id = sanitize(req.params.id);
		const obj = {
			title: req.body.title,
			description: req.body.description,
			url: await utils.parseUrl(req.body.url),
			isFiction: req.body.isFiction,
			authors: await utils.parseAuthors(req.body.authors)
		};
		let imgData = await utils.parseImgData(req.files);

		let [err, result] = await utils.to(Video.updateOne({ _id: id }, { $set: obj }));
		if (err) throw new Error(ERROR_MESSAGE.updateError);
		if (!result) throw new Error(ERROR_MESSAGE.noResult);

		err = await utils.patchImages(imgData, id, "cover");
		if (err) throw new Error(err);

		console.log(`Video edited: ${id}`);
		return res.status(200).json({ error: false, message: "Vidéo modifiée avec succès !" });
	} catch (err) {
		console.log("ERROR PATCHING VIDEO:", err, req.headers, req.ipAddress);
		return res.status(200).json({ error: true, message: err.message });
	}
});

/*
router.post("/delete/:id", setGallery, setUser, authUser, authRole(ROLE.ADMIN), async (req, res) => {
	try {
		let id = sanitize(req.params.id);

		let [err, gallery] = await utils.to(Gallery.deleteOne({ _id: id }));
		if (err) throw new Error(ERROR_MESSAGE.delError);

		let options = {
			method: "GET",
			uri: `${process.env.BASEURL}/api/image/Gallery/${id}`,
			json: true,
			headers: {
				ACCESS_TOKEN: process.env.ACCESS_TOKEN
			}
		};
		let response = await rp(options);
		if (response.error === true) throw new Error(ERROR_MESSAGE.fetchImg);

		for (let i = 0; i < response.images.length; i++) {
			let s3 = new aws.S3();
			let params = { Bucket: process.env.S3_BUCKET, Key: response.images[i].key };
			s3.deleteObject(params, function (err, data) {
				if (err) throw new Error(ERROR_MESSAGE.delImg);
			});
			await Image.deleteOne({ _id: response.images[parseInt(i)]._id });
		}

		fullLog.info(`Gallery deleted: ${id}`);
		req.flash("success", ERROR_MESSAGE.itemDeleted);
		return res.status(200).redirect("/Galerie");
	} catch (err) {
		threatLog.error("DELETE GALLERY ERROR", err, req.headers, req.ipAddress);
		req.flash("warning", err.message);
		return res.status(400).redirect("/Galerie");
	}
});
*/

module.exports = router;
