const { ERROR_MESSAGE } = require("./errorMessages");
const utils = require("./utils");
const Image = require("../../models/Image");

module.exports = {
	fetchMainImg: async function (events) {
		let arr = [];
		for (let i = 0; i < events.length; i++) {
			let obj = {
				_id: events[parseInt(i)]._id,
				url: events[parseInt(i)].url,
				title: events[parseInt(i)].title,
				description: events[parseInt(i)].description,
				staff: events[parseInt(i)].staff,
				shortdescription: events[parseInt(i)].description.substr(0, 256),
				shorttitle: events[parseInt(i)].title.substr(0, 128),
				eventStart: events[parseInt(i)].eventStart, // parse date
				eventEnd: events[parseInt(i)].eventEnd, // parse date
				price: events[parseInt(i)].price, //parse price
				date: events[parseInt(i)].date,
				address: events[parseInt(i)].address, // maybe parse
				createdAt: events[parseInt(i)].createdAt,
				updatedAt: events[parseInt(i)].updatedAt,
				__v: events[parseInt(i)].__v
			};

			let [err, img] = await utils.to(Image.findOne({ _itemId: events[parseInt(i)]._id, itemType: "event" }));
			if (err) throw new Error(ERROR_MESSAGE.fetchImg);
			if (img) obj.imgPath = img.path;

			arr.push(obj);
		}

		return arr;
	}
};
