import ERROR_MESSAGE from "./errorMessages";
import utils from "./utils";
import Image from "../../models/Image";

interface Event {
	_id: string;
	url: string;
	title: string;
	description: string;
	staff: string; //maybe array
	shortdescription: string;
	shorttitle: string;
	eventStart: string;
	eventEnd: string;
	price: string;
	date: Date;
	address: string;
	createdAt: Date;
	updatedAt: Date;
	__v: number;
}

export default {
	fetchMainImg: async function (events: Array<Event>) {
		// needs event interface
		let arr = [];
		for (let i = 0; i < events.length; i++) {
			let obj = {
				_id: events[i]._id,
				url: events[i].url,
				title: events[i].title,
				description: events[i].description,
				staff: events[i].staff,
				shortdescription: events[i].description.substr(0, 256),
				shorttitle: events[i].title.substr(0, 128),
				eventStart: events[i].eventStart, // parse date
				eventEnd: events[i].eventEnd, // parse date
				price: events[i].price, //parse price
				date: events[i].date,
				address: events[i].address, // maybe parse
				createdAt: events[i].createdAt,
				updatedAt: events[i].updatedAt,
				imgPath: undefined,
				__v: events[i].__v
			};

			let [err, img] = await utils.to(Image.findOne({ _itemId: events[i]._id, itemType: "event" }));
			if (err) throw new Error(ERROR_MESSAGE.fetchImg);
			if (img) obj.imgPath = img.path;

			arr.push(obj);
		}

		return arr;
	}
};
