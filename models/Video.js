const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const videoSchema = new mongoose.Schema(
	{
		url: {
			type: String,
			required: true
		},
		title: {
			type: String,
			required: true,
			min: 3,
			max: 255
		},
		description: {
			type: String,
			required: true,
			min: 8,
			max: 1024
		},
		coverPath: {
			type: String,
			required: true
		},
		isFiction: {
			type: Boolean,
			default: false
		},
		authors: {
			type: Array,
			required: true
		},
		date: {
			type: Date,
			default: Date.now
		}
	},
	{ timestamps: true }
);

videoSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Video", videoSchema);
