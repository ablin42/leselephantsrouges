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
const parse_error_1 = __importDefault(require("parse-error"));
const mime_types_1 = __importDefault(require("mime-types"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const Image_1 = __importDefault(require("../../models/Image"));
const User_1 = __importDefault(require("../../models/User"));
const { validationResult } = require("express-validator");
const errorMessages_1 = __importDefault(require("./errorMessages"));
require("dotenv").config({ path: '../.env' });
const BUCKET = "" + process.env.S3_BUCKET;
aws_sdk_1.default.config.region = process.env.AWS_REGION;
let utils = {
    emailExist: function emailExist(email) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield User_1.default.findOne({ email: email }))
                return true;
            return false;
        });
    },
    // Query<any> | Promise<PaginateResult<any>>
    to: function (promise) {
        return __awaiter(this, void 0, void 0, function* () {
            return promise
                .then((data) => {
                return [null, data];
            })
                .catch((err) => [parse_error_1.default(err)]);
        });
    },
    sanitizeFile: function (file, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            let fileExts = ["png", "jpg", "jpeg", "gif"];
            let isAllowedExt = fileExts.includes(file.originalname.split(".")[1].toLowerCase());
            let isAllowedMimeType = file.mimetype.startsWith("image/");
            if (isAllowedExt && isAllowedMimeType)
                return cb(null, true);
            else
                cb(new Error("File type not allowed"));
        });
    },
    toTitleCase: function (phrase) {
        let arr = phrase.toLowerCase().split(" ");
        let parsed = [];
        arr.forEach(item => {
            let obj = item.charAt(0).toUpperCase() + item.slice(1);
            if (item === "and")
                obj = "and";
            parsed.push(obj);
        });
        return parsed.join(" ");
    },
    saveImages: function (imgData, itemId, itemType) {
        return __awaiter(this, void 0, void 0, function* () {
            let err, savedImage;
            for (let i = 0; i < imgData.length; i++) {
                let image = new Image_1.default({
                    _itemId: itemId,
                    itemType: itemType,
                    path: imgData[i].path,
                    mimetype: mime_types_1.default.lookup(imgData[i].path),
                    key: imgData[i].key
                });
                [err, savedImage] = yield this.to(image.save());
                if (err || !savedImage)
                    return errorMessages_1.default.saveError;
            }
        });
    },
    patchImages: function (imgData, itemId, itemType) {
        return __awaiter(this, void 0, void 0, function* () {
            let err, currImg, patchedImg;
            for (let i = 0; i < imgData.length; i++) {
                let obj = {
                    path: imgData[i].path,
                    mimetype: mime_types_1.default.lookup(imgData[i].path),
                    key: imgData[i].key
                };
                [err, currImg] = yield this.to(Image_1.default.findOne({ _itemId: itemId, itemType: itemType }));
                if (err || !currImg)
                    return errorMessages_1.default.fetchImg;
                let s3 = new aws_sdk_1.default.S3();
                let params = { Bucket: BUCKET, Key: currImg.key };
                s3.deleteObject(params, function (err, data) {
                    if (err)
                        throw new Error(errorMessages_1.default.delImg);
                });
                [err, patchedImg] = yield this.to(Image_1.default.findOneAndUpdate({ _itemId: itemId, itemType: itemType }, { $set: obj }));
                if (err || !patchedImg)
                    return errorMessages_1.default.saveError;
            }
        });
    },
    checkValidity: function (req) {
        return __awaiter(this, void 0, void 0, function* () {
            const vResult = validationResult(req);
            if (!vResult.isEmpty()) {
                vResult.errors.forEach((item) => {
                    //object doesnt only have msg key
                    throw new Error(item.msg);
                });
            }
            return;
        });
    },
    //  interface Request {
    //         /** `Multer.File` object populated by `single()` middleware. */
    //         file: Multer.File;
    //         /**
    //          * Array or dictionary of `Multer.File` object populated by `array()`,
    //          * `fields()`, and `any()` middleware.
    //          */
    //         files: {
    //             [fieldname: string]: Multer.File[];
    //         } | Multer.File[];
    //     }
    parseImgData: function (files) {
        return __awaiter(this, void 0, void 0, function* () {
            let arr = [];
            files.forEach((file) => {
                let obj = { key: file.key, path: file.location };
                arr.push(obj);
            });
            if (arr.length <= 0)
                throw new Error("An error occured while parsing file URL");
            return arr;
        });
    },
    parseAuthors: function (authors) {
        return __awaiter(this, void 0, void 0, function* () {
            let arr = authors.split(";");
            if (arr[arr.length - 1] == "")
                arr.pop();
            return arr;
        });
    },
    parseUrl: function (url) {
        return __awaiter(this, void 0, void 0, function* () {
            let parsedUrl = "https://www.youtube.com/embed/";
            let matched = url.match(/v=[^\s&]*/);
            if (!matched)
                throw new Error("Le lien youtube n'est pas au bon format");
            parsedUrl += matched[0].substr(2);
            return parsedUrl;
        });
    },
    revertUrlFormat: function (url) {
        return __awaiter(this, void 0, void 0, function* () {
            let parsedUrl = "https://www.youtube.com/watch?v=";
            let matched = url.match(/embed\/[^\s&]*/);
            if (!matched)
                throw new Error("Une erreur est survenue lors de la conversion de l'URL");
            parsedUrl += matched[0].substr(6);
            return parsedUrl;
        });
    }
};
exports.default = utils;
