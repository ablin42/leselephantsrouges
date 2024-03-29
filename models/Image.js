const mongoose = require("mongoose");

const ImageSchema = mongoose.Schema(
	{
		_itemId: {
			type: String,
			required: true
		},
		itemType: {
			type: String,
			required: true
		},
		key: {
			type: String,
			required: true
		},
		path: {
			type: String,
			required: true
		},
		mimetype: {
			type: String,
			required: true
		},
		date: {
			type: Date,
			default: Date.now
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Image", ImageSchema);
