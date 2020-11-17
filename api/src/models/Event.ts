const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const eventSchema = new mongoose.Schema(
	{
		url: {
			type: String
		},
		parseUrl: {
			type: String
		},
		address: {
			type: String
		},
		price: {
			type: String
		},
		title: {
			type: String,
			required: true,
			max: 255
		},
		img: {
			type: Array
		},
		description: {
			type: String,
			required: true,
			max: 2048
		},
		staff: {
			type: Array
		},
		eventStart: {
			type: Date
		},
		eventEnd: {
			type: Date
		},
		date: {
			type: Date,
			default: Date.now
		}
	},
	{ timestamps: true }
);

eventSchema.plugin(mongoosePaginate);
export default mongoose.model("Event", eventSchema);
