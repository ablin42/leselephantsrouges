import sanitize from "mongo-sanitize";
import express from "express";
require("dotenv").config();

import utils from "./utils";
import User from "../../models/User";
import Video from "../../models/Video";
import Event from "../../models/Event";
import Image from "../../models/Image";
import ERROR_MESSAGE from "./errorMessages";
import { ResponseError } from "aws-sdk/clients/ec2";

const ROLE = {
	ADMIN: "admin",
	BASIC: "basic"
};

async function setUser(req: express.Request, res: express.Response, next: express.NextFunction) {
	const userId = req.session._id;

	if (userId) {
		let [err, user] = await utils.to(User.findById(userId));
		if (err || user == null) {
			//req.flash("warning", ERROR_MESSAGE.userNotFound);
			return res.status(401).redirect("/Auth");
		}
		user.password = undefined;
		req.user = user;
	}

	next();
}

function authUser(req: express.Request, res: express.Response, next: express.NextFunction) {
	if (!req.user) {
		//req.flash("warning", ERROR_MESSAGE.logInNeeded);
		return res.status(403).redirect("/Auth");
	}

	next();
}

function notLoggedUser(req: express.Request, res: express.Response, next: express.NextFunction) {
	if (req.user) {
		//req.flash("warning", ERROR_MESSAGE.alreadyLoggedIn);
		return res.status(403).redirect("/Admin");
	}

	next();
}

function authRole(role: string) {
	return (req: express.Request, res: express.Response, next: express.NextFunction) => {
		if (req.user.role !== role) {
			//req.flash("warning", ERROR_MESSAGE.unauthorized);
			return res.status(401).redirect("back");
		} else next();
	};
}

function authToken(req: express.Request, res: express.Response, next: express.NextFunction) {
	const token = req.headers["access_token"];
	if (!token || token !== process.env.ACCESS_TOKEN)
		return res.status(200).json({ error: true, message: ERROR_MESSAGE.unauthorized });

	next();
}

async function setVideo(req: express.Request, res: express.Response, next: express.NextFunction) {
	const id = sanitize(req.params.id);
	let err, video, img;

	[err, video] = await utils.to(Video.findById(id));
	if (err || !video) {
		if (req.headers["content-type"] === "application/x-www-form-urlencoded") {
			//req.flash("warning", ERROR_MESSAGE.noResult);
			return res.status(404).redirect("/Admin");
		}
		return res.status(200).json({ url: "/Admin", message: ERROR_MESSAGE.noResult, err: true });
	}
	req.video = JSON.parse(JSON.stringify(video));

	[err, img] = await utils.to(Image.findOne({ itemType: "cover", _itemId: video._id }));
	if (err) throw new Error(ERROR_MESSAGE.fetchImg);
	if (!img) throw new Error(ERROR_MESSAGE.noResult);
	req.video.mainImg = img.path;

	next();
}

async function setEvent(req: express.Request, res: express.Response, next: express.NextFunction) {
	const id = sanitize(req.params.id);
	let err, event, img;

	[err, event] = await utils.to(Event.findById(id));
	if (err || !event) {
		if (req.headers["content-type"] === "application/x-www-form-urlencoded") {
			//req.flash("warning", ERROR_MESSAGE.noResult);
			return res.status(404).redirect("/Admin");
		}
		return res.status(200).json({ url: "/Admin", message: ERROR_MESSAGE.noResult, err: true });
	}
	req.event = JSON.parse(JSON.stringify(event));

	[err, img] = await utils.to(Image.findOne({ itemType: "event", _itemId: event._id }));
	if (err) throw new Error(ERROR_MESSAGE.fetchImg);
	if (img) req.event.mainImg = img.path;

	next();
}

function errorHandler(err: ResponseError, req: express.Request, res: express.Response, next: express.NextFunction) {
	if (res.headersSent) return next(err);

	console.log(err.message, "an error occured with the file upload");
	return res.status(500).json({ url: "/", message: err.message, err: true });
}

module.exports = {
	ROLE,
	errorHandler,
	setUser,
	notLoggedUser,
	authUser,
	authRole,
	authToken,
	setVideo,
	setEvent
};
