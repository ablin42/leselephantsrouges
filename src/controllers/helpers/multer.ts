import utils from "./utils";
import multer from "multer";
import multerS3 from "multer-s3";
import shortid from "shortid";
import aws from "aws-sdk";
aws.config.region = process.env.AWS_REGION;
const BUCKET = "" + process.env.S3_BUCKET;

const storage = multerS3({
	s3: new aws.S3({
		//Bucket: BUCKET,
		//Expires: 60
	}),
	acl: "public-read",
	bucket: BUCKET,
	contentType: multerS3.AUTO_CONTENT_TYPE,
	key: function (req, file, cb) {
		let ext = "." + file.mimetype.slice(6);
		cb(null, Date.now().toString() + "-" + shortid.generate() + ext);
	}
});

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 25000000
	},
	fileFilter: function (req, file, cb) {
		utils.sanitizeFile(file, cb);
	}
}).array("img");

module.exports = upload;
