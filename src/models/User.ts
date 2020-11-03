import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		role: {
			type: String,
			default: "basic"
		},
		email: {
			type: String,
			required: true,
			min: 3,
			max: 255
		},
		password: {
			type: String,
			required: true,
			min: 8,
			max: 1024
		},
		isVerified: {
			type: Boolean,
			default: false
		},
		date: {
			type: Date,
			default: Date.now
		}
	},
	{ timestamps: true }
);

export default mongoose.model("User", userSchema);
