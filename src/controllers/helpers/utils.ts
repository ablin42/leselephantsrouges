import pe from "parse-error";
import express from "express";
import mime from "mime-types";
import aws from "aws-sdk";

import Image from "../../models/Image";
import User from "../../models/User";
const { validationResult } = require("express-validator");
import ERROR_MESSAGE from "./errorMessages";
require("dotenv").config();

const BUCKET = "" + process.env.S3_BUCKET;
aws.config.region = process.env.AWS_REGION;

let utils = {
	emailExist: async function emailExist(email: string) {
		if (await User.findOne({ email: email })) return true;

		return false;
	},
	to: function (promise) {
		return promise
			.then(data => {
				return [null, data];
			})
			.catch(err => [pe(err)]);
	},
	sanitizeFile: async function (file, cb) {
		let fileExts = ["png", "jpg", "jpeg", "gif"];
		let isAllowedExt = fileExts.includes(file.originalname.split(".")[1].toLowerCase());
		let isAllowedMimeType = file.mimetype.startsWith("image/");

		if (isAllowedExt && isAllowedMimeType) return cb(null, true);
		else cb(new Error("File type not allowed"));
	},
	toTitleCase: function (phrase: string) {
		let arr = phrase.toLowerCase().split(" ");
		let parsed: Array<string> = [];

		arr.forEach(item => {
			let obj = item.charAt(0).toUpperCase() + item.slice(1);
			if (item === "and") obj = "and";
			parsed.push(obj);
		});

		return parsed.join(" ");
	},
	saveImages: async function (imgData, itemId: string, itemType: string) {
		let err, savedImage;
		for (let i = 0; i < imgData.length; i++) {
			let image = new Image({
				_itemId: itemId,
				itemType: itemType,
				path: imgData[i].path,
				mimetype: mime.lookup(imgData[i].path),
				key: imgData[i].key
			});

			[err, savedImage] = await this.to(image.save());
			if (err || !savedImage) return ERROR_MESSAGE.saveError;
		}
	},
	patchImages: async function (imgData, itemId: string, itemType: string) {
		let err, currImg, patchedImg;
		for (let i = 0; i < imgData.length; i++) {
			let obj = {
				path: imgData[i].path,
				mimetype: mime.lookup(imgData[i].path),
				key: imgData[i].key
			};

			[err, currImg] = await this.to(Image.findOne({ _itemId: itemId, itemType: itemType }));
			if (err || !currImg) return ERROR_MESSAGE.fetchImg;

			let s3 = new aws.S3();
			let params = { Bucket: BUCKET, Key: currImg.key };
			s3.deleteObject(params, function (err, data) {
				if (err) throw new Error(ERROR_MESSAGE.delImg);
			});

			[err, patchedImg] = await this.to(Image.findOneAndUpdate({ _itemId: itemId, itemType: itemType }, { $set: obj }));
			if (err || !patchedImg) return ERROR_MESSAGE.saveError;
		}
	},
	checkValidity: async function (req: express.Request) {
		const vResult = validationResult(req);
		if (!vResult.isEmpty()) {
			vResult.errors.forEach((item: { msg: string }) => {
				//object doesnt only have msg key
				throw new Error(item.msg);
			});
		}

		return;
	},
	parseImgData: async function (files) {
		let arr: Array<{ key: string; path: string }> = [];
		files.forEach(file => {
			let obj = { key: file.key, path: file.location };
			arr.push(obj);
		});
		if (arr.length <= 0) throw new Error("An error occured while parsing file URL");

		return arr;
	},
	parseAuthors: async function (authors: string) {
		let arr = authors.split(";");
		if (arr[arr.length - 1] == "") arr.pop();

		return arr;
	},
	parseUrl: async function (url: string) {
		let parsedUrl = "https://www.youtube.com/embed/";
		let matched = url.match(/v=[^\s&]*/);

		if (!matched) throw new Error("Le lien youtube n'est pas au bon format");
		parsedUrl += matched[0].substr(2);

		return parsedUrl;
	},
	revertUrlFormat: async function (url: string) {
		let parsedUrl = "https://www.youtube.com/watch?v=";
		let matched = url.match(/embed\/[^\s&]*/);

		if (!matched) throw new Error("Une erreur est survenue lors de la conversion de l'URL");
		parsedUrl += matched[0].substr(6);

		return parsedUrl;
	}
};

export default utils;
