const pe = require("parse-error");
const Image = require("../../models/Image");
const User = require("../../models/User");
const { validationResult } = require("express-validator");
const mime = require("mime-types");

module.exports = {
	emailExist: async function emailExist(email) {
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
	toTitleCase: function (phrase) {
		let arr = phrase.toLowerCase().split(" ");
		let parsed = [];

		arr.forEach(item => {
			let obj = item.charAt(0).toUpperCase() + item.slice(1);
			if (item === "and") obj = "and";
			parsed.push(obj);
		});

		return parsed.join(" ");
	},
	saveImages: async function (imgData, itemId, itemType) {
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
	patchImages: async function (imgData, itemId, itemType) {
		for (let i = 0; i < imgData.length; i++) {
			let obj = {
				path: imgData[i].path,
				mimetype: mime.lookup(imgData[i].path),
				key: imgData[i].key
			};

			[err, patchedImg] = await this.to(Image.findOneAndUpdate({ _itemId: itemId, itemType: itemType }, { $set: obj }));
			if (err || !patchedImg) return ERROR_MESSAGE.saveError;
		}
	},
	checkValidity: async function (req) {
		const vResult = validationResult(req);
		if (!vResult.isEmpty()) {
			vResult.errors.forEach(item => {
				throw new Error(item.msg);
			});
		}

		return;
	},
	parseImgData: async function (files) {
		let arr = [];
		files.forEach(file => {
			let obj = { key: file.key, path: file.location };
			arr.push(obj);
		});
		if (arr.length <= 0) throw new Error("An error occured while parsing file URL");

		return arr;
	},
	parseAuthors: async function (authors) {
		let arr = authors.split(";");
		if (arr[arr.length - 1] == "") arr.pop();

		return arr;
	},
	parseUrl: async function (url) {
		let parsedUrl = "https://www.youtube.com/embed/";
		let matched = url.match(/v=[^\s&]*/);

		if (!matched) throw new Error("Le lien youtube n'est pas au bon format");
		parsedUrl += matched[0].substr(2);

		return parsedUrl;
	},
	revertUrlFormat: async function (url) {
		let parsedUrl = "https://www.youtube.com/watch?v=";
		let matched = url.match(/embed\/[^\s&]*/);

		if (!matched) throw new Error("Une erreur est survenue lors de la conversion de l'URL");
		parsedUrl += matched[0].substr(6);

		return parsedUrl;
	}
};
