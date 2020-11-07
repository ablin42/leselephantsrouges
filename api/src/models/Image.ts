import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
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

export default mongoose.model("Image", ImageSchema);
