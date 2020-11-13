import express from "express";
const router = express.Router();
import sanitize from "mongo-sanitize";

import upload from "./helpers/multer";
const { vEvent } = require("./validators/vEvent");
import utils from "./helpers/utils";
import eHelpers from "./helpers/eventHelpers";
const { ROLE, setUser, authUser, authRole, errorHandler, setEvent } = require("./helpers/middlewares");
import ERROR_MESSAGE from "./helpers/errorMessages";
import Event from "../models/Event";
import Image from "../models/Image";

import aws from "aws-sdk";
aws.config.region = process.env.AWS_REGION;
const BUCKET = "" + process.env.S3_BUCKET;
require("dotenv").config({ path: "../.env" });

router.get("/", async (req, res) => {
	try {
		const options = {
			page: parseInt(req.query.page as string, 10) || 1,
			limit: 12,
			sort: { date: -1 }
		};
		let events;

		let [err, result] = await utils.to(Event.paginate({}, options));
		if (err) throw new Error(ERROR_MESSAGE.fetchError);

		events = result.docs;
		if (events.length == 0) throw new Error(ERROR_MESSAGE.noResult);
		events = await eHelpers.fetchMainImg(events);

		return res.status(200).json({ error: false, events: events });
	} catch (err) {
		console.log("FETCHING EVENTS ERROR:", err, req.headers);
		return res.status(200).json({ error: true, message: err.message });
	}
});

router.post("/", upload, errorHandler, vEvent, setUser, authUser, authRole(ROLE.ADMIN), async (req, res) => {
	try {
		await utils.checkValidity(req);
		const obj = {
			title: req.body.title,
			description: req.body.description,
			eventStart: req.body.eventStart,
			eventEnd: req.body.eventEnd,
			address: req.body.address,
			price: req.body.price,
			staff: await utils.parseAuthors(req.body.staff),
			url: ""
		};
		let imgData;
		const files = req.files as Express.MulterS3.File[];

		if (req.body.url) obj.url = await utils.parseUrl(req.body.url);
		if (req.files.length > 0) imgData = await utils.parseImgData(files);

		let newEvent = new Event(obj);
		let [err, result] = await utils.to(newEvent.save());
		if (err) throw new Error(ERROR_MESSAGE.saveError);

		if (req.files.length > 0 && imgData) {
			err = await utils.saveImages(imgData, result._id, "event");
			if (err) throw new Error(err);
		}

		console.log(`Event added: ${newEvent._id}`);
		return res.status(200).json({ error: false, message: "Événement ajouté avec succès !" });
	} catch (err) {
		console.log("ERROR POSTING EVENT:", err, req.headers);
		return res.status(200).json({ error: true, message: err.message });
	}
});

router.post("/:id", upload, errorHandler, vEvent, setEvent, setUser, authUser, authRole(ROLE.ADMIN), async (req, res) => {
	try {
		await utils.checkValidity(req);
		const id = sanitize(req.params.id);
		const obj = {
			title: req.body.title,
			description: req.body.description,
			eventStart: req.body.eventStart,
			eventEnd: req.body.eventEnd,
			address: req.body.address,
			price: req.body.price,
			staff: await utils.parseAuthors(req.body.staff),
			url: ""
		};
		let imgData;
		const files = req.files as Express.MulterS3.File[];

		if (req.body.url) obj.url = await utils.parseUrl(req.body.url);
		if (req.files.length > 0) imgData = await utils.parseImgData(files);

		let [err, result] = await utils.to(Event.updateOne({ _id: id }, { $set: obj }));
		if (err) throw new Error(ERROR_MESSAGE.updateError);
		if (!result) throw new Error(ERROR_MESSAGE.noResult);

		if (req.files.length > 0 && imgData) {
			err = await utils.patchImages(imgData, id, "event");
			if (err) throw new Error(err);
		}

		console.log(`Event edited: ${id}`);
		return res.status(200).json({ error: false, message: "Événement modifié avec succès !" });
	} catch (err) {
		console.log("ERROR PATCHING EVENT:", err, req.headers);
		return res.status(200).json({ error: true, message: err.message });
	}
});

router.post("/delete/:id", setEvent, setUser, authUser, authRole(ROLE.ADMIN), async (req, res) => {
	try {
		await utils.checkValidity(req);
		const id = sanitize(req.params.id);
		let err, event, img;

		[err, event] = await utils.to(Event.deleteOne({ _id: id }));
		if (err) throw new Error(ERROR_MESSAGE.delError);

		[err, img] = await utils.to(Image.findOne({ _itemId: id }));
		if (err || !img) throw new Error(ERROR_MESSAGE.fetchImg);

		let s3 = new aws.S3();
		let params = { Bucket: BUCKET, Key: img.key };
		s3.deleteObject(params, function (err, data) {
			if (err) throw new Error(ERROR_MESSAGE.delImg);
		});
		await Image.deleteOne({ _id: img._id });

		console.log(`Event deleted: ${id}`);
		return res.status(200).redirect("/");
	} catch (err) {
		console.log("ERROR DELETING EVENT:", err, req.headers);
		return res.status(400).redirect("/");
	}
});

export default router;
