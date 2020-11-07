"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __importDefault(require("./utils"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const shortid_1 = __importDefault(require("shortid"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
aws_sdk_1.default.config.region = process.env.AWS_REGION;
const BUCKET = "" + process.env.S3_BUCKET;
const storage = multer_s3_1.default({
    s3: new aws_sdk_1.default.S3({
    //Bucket: BUCKET,
    //Expires: 60
    }),
    acl: "public-read",
    bucket: BUCKET,
    contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
        let ext = "." + file.mimetype.slice(6);
        cb(null, Date.now().toString() + "-" + shortid_1.default.generate() + ext);
    }
});
const upload = multer_1.default({
    storage: storage,
    limits: {
        fileSize: 25000000
    },
    fileFilter: function (req, file, cb) {
        utils_1.default.sanitizeFile(file, cb);
    }
}).array("img");
exports.default = upload;
