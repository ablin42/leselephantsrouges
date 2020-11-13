"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const mongo_sanitize_1 = __importDefault(require("mongo-sanitize"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_mongo_1 = __importDefault(require("rate-limit-mongo"));
const multer_1 = __importDefault(require("./helpers/multer"));
const { vVideo } = require("./validators/vVideo");
const utils_1 = __importDefault(require("./helpers/utils"));
const videoHelpers_1 = __importDefault(require("./helpers/videoHelpers"));
const { ROLE, setUser, authUser, authRole, errorHandler, setVideo } = require("./helpers/middlewares");
const errorMessages_1 = __importDefault(require("./helpers/errorMessages"));
const Video_1 = __importDefault(require("../models/Video"));
const Image_1 = __importDefault(require("../models/Image"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
aws_sdk_1.default.config.region = process.env.AWS_REGION;
const BUCKET = "" + process.env.S3_BUCKET;
require("dotenv").config({ path: '../.env' });
const limiter = express_rate_limit_1.default({
    store: new rate_limit_mongo_1.default({
        uri: process.env.DB_CONNECTION,
        collectionName: "authRateLimit",
        expireTimeMs: 6 * 60 * 60 * 1000
    }),
    windowMs: 6 * 60 * 60 * 1000,
    max: 20,
    handler: function (req, res) {
        res.status(200).json({ error: true, message: "Too many requests, please try again later" });
    }
});
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const options = {
            page: parseInt(req.query.page, 10) || 1,
            limit: 12,
            sort: { date: -1 }
        };
        let videos;
        let [err, result] = yield utils_1.default.to(Video_1.default.paginate({}, options));
        if (err)
            throw new Error(errorMessages_1.default.fetchError);
        videos = result.docs;
        if (videos.length == 0)
            throw new Error(errorMessages_1.default.noResult);
        videos = yield videoHelpers_1.default.fetchMainImg(videos);
        return res.status(200).json({ error: false, videos: videos });
    }
    catch (err) {
        console.log("FETCHING VIDEOS ERROR:", err, req.headers);
        return res.status(200).json({ error: true, message: err.message });
    }
}));
router.post("/", multer_1.default, errorHandler, vVideo, setUser, authUser, authRole(ROLE.ADMIN), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield utils_1.default.checkValidity(req);
        const obj = {
            title: req.body.title,
            description: req.body.description,
            url: yield utils_1.default.parseUrl(req.body.url),
            isFiction: req.body.isFiction,
            authors: yield utils_1.default.parseAuthors(req.body.authors)
        };
        const files = req.files;
        let imgData = yield utils_1.default.parseImgData(files);
        let newVideo = new Video_1.default(obj);
        let [err, result] = yield utils_1.default.to(newVideo.save());
        if (err)
            throw new Error(errorMessages_1.default.saveError);
        err = yield utils_1.default.saveImages(imgData, result._id, "cover");
        if (err)
            throw new Error(err);
        console.log(`Video added: ${newVideo._id}`);
        return res.status(200).json({ error: false, message: "Vidéo ajoutée avec succès !" });
    }
    catch (err) {
        console.log("ERROR POSTING VIDEO:", err, req.headers);
        return res.status(200).json({ error: true, message: err.message });
    }
}));
router.post("/:id", multer_1.default, errorHandler, vVideo, setVideo, setUser, authUser, authRole(ROLE.ADMIN), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield utils_1.default.checkValidity(req);
        const id = mongo_sanitize_1.default(req.params.id);
        const obj = {
            title: req.body.title,
            description: req.body.description,
            url: yield utils_1.default.parseUrl(req.body.url),
            isFiction: req.body.isFiction,
            authors: yield utils_1.default.parseAuthors(req.body.authors)
        };
        let imgData;
        const files = req.files;
        if (req.files.length > 0)
            imgData = yield utils_1.default.parseImgData(files);
        let [err, result] = yield utils_1.default.to(Video_1.default.updateOne({ _id: id }, { $set: obj }));
        if (err)
            throw new Error(errorMessages_1.default.updateError);
        if (!result)
            throw new Error(errorMessages_1.default.noResult);
        if (req.files.length > 0 && imgData) {
            err = yield utils_1.default.patchImages(imgData, id, "cover");
            if (err)
                throw new Error(err);
        }
        console.log(`Video edited: ${id}`);
        return res.status(200).json({ error: false, message: "Vidéo modifiée avec succès !" });
    }
    catch (err) {
        console.log("ERROR PATCHING VIDEO:", err, req.headers);
        return res.status(200).json({ error: true, message: err.message });
    }
}));
router.post("/delete/:id", setVideo, setUser, authUser, authRole(ROLE.ADMIN), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield utils_1.default.checkValidity(req);
        const id = mongo_sanitize_1.default(req.params.id);
        let err, video, img;
        [err, video] = yield utils_1.default.to(Video_1.default.deleteOne({ _id: id }));
        if (err)
            throw new Error(errorMessages_1.default.delError);
        [err, img] = yield utils_1.default.to(Image_1.default.findOne({ _itemId: id }));
        if (err || !img)
            throw new Error(errorMessages_1.default.fetchImg);
        let s3 = new aws_sdk_1.default.S3();
        let params = { Bucket: BUCKET, Key: img.key };
        s3.deleteObject(params, function (err, data) {
            if (err)
                throw new Error(errorMessages_1.default.delImg);
        });
        yield Image_1.default.deleteOne({ _id: img._id });
        console.log(`Video deleted: ${id}`);
        return res.status(200).redirect("/");
    }
    catch (err) {
        console.log("ERROR DELETING VIDEO:", err, req.headers);
        return res.status(400).redirect("/");
    }
}));
exports.default = router;
