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
const multer_1 = __importDefault(require("./helpers/multer"));
const { vEvent } = require("./validators/vEvent");
const utils_1 = __importDefault(require("./helpers/utils"));
const eventHelpers_1 = __importDefault(require("./helpers/eventHelpers"));
const { ROLE, setUser, authUser, authRole, errorHandler, setEvent } = require("./helpers/middlewares");
const errorMessages_1 = __importDefault(require("./helpers/errorMessages"));
const Event_1 = __importDefault(require("../models/Event"));
const Image_1 = __importDefault(require("../models/Image"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
aws_sdk_1.default.config.region = process.env.AWS_REGION;
const BUCKET = "" + process.env.S3_BUCKET;
require("dotenv").config({ path: "../.env" });
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const options = {
            page: parseInt(req.query.page, 10) || 1,
            limit: 12,
            sort: { date: -1 }
        };
        let events;
        let [err, result] = yield utils_1.default.to(Event_1.default.paginate({}, options));
        if (err)
            throw new Error(errorMessages_1.default.fetchError);
        events = result.docs;
        if (events.length == 0)
            throw new Error(errorMessages_1.default.noResult);
        events = yield eventHelpers_1.default.fetchMainImg(events);
        return res.status(200).json({ error: false, events: events });
    }
    catch (err) {
        console.log("FETCHING EVENTS ERROR:", err, req.headers);
        return res.status(200).json({ error: true, message: err.message });
    }
}));
router.get("/:id", setEvent, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.status(200).json({ error: false, event: req.event });
    }
    catch (err) {
        console.log("ERROR ACCESSING EVENT:", err, req.headers);
        return res.status(200).json({ error: true, message: err.message });
    }
}));
router.post("/", multer_1.default, errorHandler, vEvent, setUser, authUser, authRole(ROLE.ADMIN), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield utils_1.default.checkValidity(req);
        const obj = {
            title: req.body.title,
            description: req.body.description,
            eventStart: req.body.eventStart,
            eventEnd: req.body.eventEnd,
            address: req.body.address,
            price: req.body.price,
            staff: yield utils_1.default.parseAuthors(req.body.staff),
            url: req.body.url,
            parsedUrl: yield utils_1.default.parseUrl(req.body.url)
        };
        let imgData;
        const files = req.files;
        if (req.files.length > 0)
            imgData = yield utils_1.default.parseImgData(files);
        let newEvent = new Event_1.default(obj);
        let [err, result] = yield utils_1.default.to(newEvent.save());
        if (err)
            throw new Error(errorMessages_1.default.saveError);
        if (req.files.length > 0 && imgData) {
            err = yield utils_1.default.saveImages(imgData, result._id, "event");
            if (err)
                throw new Error(err);
        }
        console.log(`Event added: ${newEvent._id}`);
        return res.status(200).json({ error: false, message: "Événement ajouté avec succès !" });
    }
    catch (err) {
        console.log("ERROR POSTING EVENT:", err, req.headers);
        return res.status(200).json({ error: true, message: err.message });
    }
}));
router.post("/:id", multer_1.default, errorHandler, vEvent, setEvent, setUser, authUser, authRole(ROLE.ADMIN), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield utils_1.default.checkValidity(req);
        const id = mongo_sanitize_1.default(req.params.id);
        const obj = {
            title: req.body.title,
            description: req.body.description,
            eventStart: req.body.eventStart,
            eventEnd: req.body.eventEnd,
            address: req.body.address,
            price: req.body.price,
            staff: yield utils_1.default.parseAuthors(req.body.staff),
            url: req.body.url,
            parsedUrl: yield utils_1.default.parseUrl(req.body.url)
        };
        let imgData;
        const files = req.files;
        if (req.files.length > 0)
            imgData = yield utils_1.default.parseImgData(files);
        let [err, result] = yield utils_1.default.to(Event_1.default.updateOne({ _id: id }, { $set: obj }));
        if (err)
            throw new Error(errorMessages_1.default.updateError);
        if (!result)
            throw new Error(errorMessages_1.default.noResult);
        if (req.files.length > 0 && imgData) {
            err = yield utils_1.default.patchImages(imgData, id, "event");
            if (err)
                throw new Error(err);
        }
        console.log(`Event edited: ${id}`);
        return res.status(200).json({ error: false, message: "Événement modifié avec succès !" });
    }
    catch (err) {
        console.log("ERROR PATCHING EVENT:", err, req.headers);
        return res.status(200).json({ error: true, message: err.message });
    }
}));
router.post("/delete/:id", setEvent, setUser, authUser, authRole(ROLE.ADMIN), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield utils_1.default.checkValidity(req);
        const id = mongo_sanitize_1.default(req.params.id);
        let err, event, img;
        [err, event] = yield utils_1.default.to(Event_1.default.deleteOne({ _id: id }));
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
        console.log(`Event deleted: ${id}`);
        return res.status(200).redirect("/");
    }
    catch (err) {
        console.log("ERROR DELETING EVENT:", err, req.headers);
        return res.status(400).redirect("/");
    }
}));
exports.default = router;
