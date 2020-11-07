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
const mongo_sanitize_1 = __importDefault(require("mongo-sanitize"));
require("dotenv").config();
const utils_1 = __importDefault(require("./utils"));
const User_1 = __importDefault(require("../../models/User"));
const Video_1 = __importDefault(require("../../models/Video"));
const Event_1 = __importDefault(require("../../models/Event"));
const Image_1 = __importDefault(require("../../models/Image"));
const errorMessages_1 = __importDefault(require("./errorMessages"));
const ROLE = {
    ADMIN: "admin",
    BASIC: "basic"
};
function setUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.session._id;
        if (userId) {
            let [err, user] = yield utils_1.default.to(User_1.default.findById(userId));
            if (err || user == null) {
                //req.flash("warning", ERROR_MESSAGE.userNotFound);
                return res.status(401).redirect("/Auth");
            }
            user.password = undefined;
            req.user = user;
        }
        next();
    });
}
function authUser(req, res, next) {
    if (!req.user) {
        //req.flash("warning", ERROR_MESSAGE.logInNeeded);
        return res.status(403).redirect("/Auth");
    }
    next();
}
function notLoggedUser(req, res, next) {
    if (req.user) {
        //req.flash("warning", ERROR_MESSAGE.alreadyLoggedIn);
        return res.status(403).redirect("/Admin");
    }
    next();
}
function authRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            //req.flash("warning", ERROR_MESSAGE.unauthorized);
            return res.status(401).redirect("back");
        }
        else
            next();
    };
}
function authToken(req, res, next) {
    const token = req.headers["access_token"];
    if (!token || token !== process.env.ACCESS_TOKEN)
        return res.status(200).json({ error: true, message: errorMessages_1.default.unauthorized });
    next();
}
function setVideo(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = mongo_sanitize_1.default(req.params.id);
        let err, video, img;
        [err, video] = yield utils_1.default.to(Video_1.default.findById(id));
        if (err || !video) {
            if (req.headers["content-type"] === "application/x-www-form-urlencoded") {
                //req.flash("warning", ERROR_MESSAGE.noResult);
                return res.status(404).redirect("/Admin");
            }
            return res.status(200).json({ url: "/Admin", message: errorMessages_1.default.noResult, err: true });
        }
        req.video = JSON.parse(JSON.stringify(video));
        [err, img] = yield utils_1.default.to(Image_1.default.findOne({ itemType: "cover", _itemId: video._id }));
        if (err)
            throw new Error(errorMessages_1.default.fetchImg);
        if (!img)
            throw new Error(errorMessages_1.default.noResult);
        req.video.mainImg = img.path;
        next();
    });
}
function setEvent(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = mongo_sanitize_1.default(req.params.id);
        let err, event, img;
        [err, event] = yield utils_1.default.to(Event_1.default.findById(id));
        if (err || !event) {
            if (req.headers["content-type"] === "application/x-www-form-urlencoded") {
                //req.flash("warning", ERROR_MESSAGE.noResult);
                return res.status(404).redirect("/Admin");
            }
            return res.status(200).json({ url: "/Admin", message: errorMessages_1.default.noResult, err: true });
        }
        req.event = JSON.parse(JSON.stringify(event));
        [err, img] = yield utils_1.default.to(Image_1.default.findOne({ itemType: "event", _itemId: event._id }));
        if (err)
            throw new Error(errorMessages_1.default.fetchImg);
        if (img)
            req.event.mainImg = img.path;
        next();
    });
}
function errorHandler(err, req, res, next) {
    if (res.headersSent)
        return next(err);
    console.log(err.message, "an error occured with the file upload");
    return res.status(500).json({ url: "/", message: err.message, err: true });
}
module.exports = {
    ROLE,
    errorHandler,
    setUser,
    notLoggedUser,
    authUser,
    authRole,
    authToken,
    setVideo,
    setEvent
};
