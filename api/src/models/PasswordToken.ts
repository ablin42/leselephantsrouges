import mongoose from "mongoose";

const passwordSchema = new mongoose.Schema(
	{
		_userId: {
			type: String,
			required: true,
			ref: "User"
		},
		token: {
			type: String,
			required: true
		},
		createdAt: {
			type: Date,
			required: true,
			default: Date.now,
			expires: 43200
		}
	},
	{ timestamps: true }
);

export default mongoose.model("PasswordToken", passwordSchema);