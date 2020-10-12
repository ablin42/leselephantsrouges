const { ERROR_MESSAGE } = require("./errorMessages");
const utils = require("./utils");
const Image = require("../../models/Image");

module.exports = {
	fetchMainImg: async function (videos) {
		let arr = [];
		for (let i = 0; i < videos.length; i++) {
			let obj = {
				_id: videos[parseInt(i)]._id,
				url: videos[parseInt(i)].url,
				title: videos[parseInt(i)].title,
				description: videos[parseInt(i)].description,
				authors: videos[parseInt(i)].authors,
				shortdescription: videos[parseInt(i)].description.substr(0, 256),
				shorttitle: videos[parseInt(i)].title.substr(0, 128),
				date: videos[parseInt(i)].date,
				createdAt: videos[parseInt(i)].createdAt,
				updatedAt: videos[parseInt(i)].updatedAt,
				__v: videos[parseInt(i)].__v
			};

			let [err, img] = await utils.to(Image.findOne({ _itemId: videos[parseInt(i)]._id, itemType: "cover" }));
			if (err || !img) throw new Error(ERROR_MESSAGE.fetchImg);
			obj.coverPath = img.path;

			arr.push(obj);
		}

		return arr;
	}
};
