import express from "express";
const router = express.Router();
import sanitize from "mongo-sanitize";
import * as rateLimit from "express-rate-limit";
import * as MongoStore from "rate-limit-mongo";

import upload from "./helpers/multer";
const { vVideo } = require("./validators/vVideo");
import utils from "./helpers/utils";
import vHelpers from "./helpers/videoHelpers";
const { ROLE, setUser, authUser, authRole, errorHandler, setVideo } = require("./helpers/middlewares");
import ERROR_MESSAGE from "./helpers/errorMessages";
import Video from "../models/Video";
import Image from "../models/Image";

import aws from "aws-sdk";
aws.config.region = process.env.AWS_REGION;
const BUCKET = "" + process.env.S3_BUCKET;
require("dotenv").config();

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

router.get("/", async (req, res) => {
	try {
		const options = {
			page: parseInt(req.query.page as string, 10) || 1,
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
		console.log("FETCHING VIDEOS ERROR:", err, req.headers);
		return res.status(200).json({ error: true, message: err.message });
	}
});

router.post("/", upload, errorHandler, vVideo, setUser, authUser, authRole(ROLE.ADMIN), async (req, res) => {
	try {
		await utils.checkValidity(req);
		const obj = {
			title: req.body.title,
			description: req.body.description,
			url: await utils.parseUrl(req.body.url),
			isFiction: req.body.isFiction,
			authors: await utils.parseAuthors(req.body.authors)
		};
		const files = req.files as Express.MulterS3.File[];
		let imgData = await utils.parseImgData(files);

		let newVideo = new Video(obj);
		let [err, result] = await utils.to(newVideo.save());
		if (err) throw new Error(ERROR_MESSAGE.saveError);

		err = await utils.saveImages(imgData, result._id, "cover");
		if (err) throw new Error(err);

		console.log(`Video added: ${newVideo._id}`);
		return res.status(200).json({ error: false, message: "Vidéo ajoutée avec succès !" });
	} catch (err) {
		console.log("ERROR POSTING VIDEO:", err, req.headers);
		return res.status(200).json({ error: true, message: err.message });
	}
});

router.post("/:id", upload, errorHandler, vVideo, setVideo, setUser, authUser, authRole(ROLE.ADMIN), async (req, res) => {
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
		let imgData;
		const files = req.files as Express.MulterS3.File[];
		if (req.files.length > 0) imgData = await utils.parseImgData(files);

		let [err, result] = await utils.to(Video.updateOne({ _id: id }, { $set: obj }));
		if (err) throw new Error(ERROR_MESSAGE.updateError);
		if (!result) throw new Error(ERROR_MESSAGE.noResult);

		if (req.files.length > 0 && imgData) {
			err = await utils.patchImages(imgData, id, "cover");
			if (err) throw new Error(err);
		}

		console.log(`Video edited: ${id}`);
		return res.status(200).json({ error: false, message: "Vidéo modifiée avec succès !" });
	} catch (err) {
		console.log("ERROR PATCHING VIDEO:", err, req.headers);
		return res.status(200).json({ error: true, message: err.message });
	}
});

router.post("/delete/:id", setVideo, setUser, authUser, authRole(ROLE.ADMIN), async (req, res) => {
	try {
		await utils.checkValidity(req);
		const id = sanitize(req.params.id);
		let err, video, img;

		[err, video] = await utils.to(Video.deleteOne({ _id: id }));
		if (err) throw new Error(ERROR_MESSAGE.delError);

		[err, img] = await utils.to(Image.findOne({ _itemId: id }));
		if (err || !img) throw new Error(ERROR_MESSAGE.fetchImg);

		let s3 = new aws.S3();
		let params = { Bucket: BUCKET, Key: img.key };
		s3.deleteObject(params, function (err, data) {
			if (err) throw new Error(ERROR_MESSAGE.delImg);
		});
		await Image.deleteOne({ _id: img._id });

		console.log(`Video deleted: ${id}`);
		return res.status(200).redirect("/");
	} catch (err) {
		console.log("ERROR DELETING VIDEO:", err, req.headers);
		return res.status(400).redirect("/");
	}
});

export default router;
