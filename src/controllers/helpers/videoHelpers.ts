import ERROR_MESSAGE from "./errorMessages";
import utils from "./utils";
import Image from "../../models/Image";


module.exports = {
	fetchMainImg: async function (videos) { // need video event
		let arr = [];
		for (let i = 0; i < videos.length; i++) {
			let obj = {
				_id: videos[i]._id,
				url: videos[i].url,
				title: videos[i].title,
				description: videos[i].description,
				authors: videos[i].authors,
				shortdescription: videos[i].description.substr(0, 256),
				shorttitle: videos[i].title.substr(0, 128),
				date: videos[i].date,
				createdAt: videos[i].createdAt,
				updatedAt: videos[i].updatedAt,
				coverPath: undefined,
				__v: videos[i].__v
			};

			let [err, img] = await utils.to(Image.findOne({ _itemId: videos[i]._id, itemType: "cover" }));
			if (err || !img) throw new Error(ERROR_MESSAGE.fetchImg);
			obj.coverPath = img.path;

			arr.push(obj);
		}

		return arr;
	}
};
