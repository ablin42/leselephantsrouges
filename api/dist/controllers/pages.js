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
const request_promise_1 = __importDefault(require("request-promise"));
const router = express_1.default.Router();
const mongo_sanitize_1 = __importDefault(require("mongo-sanitize"));
const { ROLE, setUser, notLoggedUser, authUser, authRole, setEvent, setVideo } = require("./helpers/middlewares");
const utils_1 = __importDefault(require("./helpers/utils"));
const Image_1 = __importDefault(require("../models/Image"));
const errorMessages_1 = __importDefault(require("./helpers/errorMessages"));
const PasswordToken_1 = __importDefault(require("../models/PasswordToken"));
require("dotenv").config({ path: '../.env' });
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let obj = { csrfToken: req.csrfToken() };
        return res.status(200).render("index", obj);
    }
    catch (err) {
        console.log("HOME ROUTE ERROR:", err, req.headers);
        return res.status(200).render("error");
    }
}));
router.get("/vidrender", setUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let obj = {
            active: "vidrenders",
            csrfToken: req.csrfToken(),
            user: req.user,
            videos: []
        };
        let options = {
            method: "GET",
            uri: `${process.env.BASEURL}/api/videos/`,
            json: true
        };
        let response = yield request_promise_1.default(options);
        if (response.error === false)
            obj.videos = response.videos;
        else
            throw new Error(response.message);
        return res.status(200).render("vidrender", obj);
    }
    catch (err) {
        console.log("HOME ROUTE ERROR:", err, req.headers);
        //req.flash("warning", err.message);
        return res.status(200).render("error");
    }
}));
router.get("/eventrender", setUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let obj = {
            active: "eventrender",
            csrfToken: req.csrfToken(),
            user: req.user,
            events: []
        };
        let options = {
            method: "GET",
            uri: `${process.env.BASEURL}/api/events/`,
            json: true
        };
        let response = yield request_promise_1.default(options);
        if (response.error === false)
            obj.events = response.events;
        else
            throw new Error(response.message);
        return res.status(200).render("eventrender", obj);
    }
    catch (err) {
        console.log("HOME ROUTE ERROR:", err, req.headers);
        //req.flash("warning", err.message);
        return res.status(200).render("error");
    }
}));
router.get("/Auth", setUser, notLoggedUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let obj = {
            active: "Account",
            headtitle: "Les éléphants rouges | Auth",
            description: "Les éléphants rouges, auth section",
            csrfToken: req.csrfToken(),
            formData: {}
        };
        obj.formData = req.session.formData;
        req.session.formData = undefined;
        return res.status(200).render("Auth", obj);
    }
    catch (err) {
        console.log("AUTH ROUTE ERROR", err, req.headers);
        //req.flash("warning", ERROR_MESSAGE.serverError);
        return res.status(400).redirect("/");
    }
}));
router.get("/Resetpw/:tokenId/:token", setUser, notLoggedUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let obj = {
            headtitle: "Les éléphants rouges | Auth",
            description: "Les éléphants rouges, récupérez votre mot de passe ici, juste au cas ou...",
            tokenId: mongo_sanitize_1.default(req.params.tokenId),
            token: mongo_sanitize_1.default(req.params.token),
            csrfToken: req.csrfToken()
        };
        let [err, pwToken] = yield utils_1.default.to(PasswordToken_1.default.findOne({ _id: obj.tokenId, token: obj.token }));
        if (err || !pwToken)
            throw new Error(errorMessages_1.default.tokenNotFound);
        return res.status(200).render("Resetpw", obj);
    }
    catch (err) {
        console.log("RESETPW ROUTE ERROR", err, req.headers);
        //req.flash("warning", err.message);
        return res.status(200).redirect("/Auth");
    }
}));
router.get("/Admin", setUser, authUser, authRole(ROLE.ADMIN), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let obj = {
            active: "Admin",
            headtitle: "Les éléphants rouges | Admin",
            description: "Les éléphants rouges, admin section",
            user: req.user,
            csrfToken: req.csrfToken()
        };
        return res.status(200).render("restricted/Admin", obj);
    }
    catch (err) {
        console.log("ADMIN ROUTE ERROR", err, req.headers);
        //req.flash("warning", err.message);
        return res.status(400).redirect("/Auth");
    }
}));
router.get("/Admin/Settings", setUser, authUser, authRole(ROLE.ADMIN), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let obj = {
            active: "Admin Settings",
            headtitle: "Les éléphants rouges | Admin Settings",
            description: "Les éléphants rouges, settings section",
            user: req.user,
            csrfToken: req.csrfToken()
        };
        return res.status(200).render("restricted/settings", obj);
    }
    catch (err) {
        console.log("ADMIN ROUTE ERROR", err, req.headers);
        //req.flash("warning", err.message);
        return res.status(400).redirect("/Admin");
    }
}));
router.get("/Admin/Videos", setUser, authUser, authRole(ROLE.ADMIN), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let obj = {
            active: "Admin Videos",
            headtitle: "Les éléphants rouges | Admin Videos",
            description: "Les éléphants rouges, videos section",
            user: req.user,
            csrfToken: req.csrfToken()
        };
        return res.status(200).render("restricted/postVideo", obj);
    }
    catch (err) {
        console.log("ADMIN VIDEOS ROUTE ERROR", err, req.headers);
        //req.flash("warning", err.message);
        return res.status(400).redirect("/Admin");
    }
}));
router.get("/Admin/Videos/Patch/:id", setVideo, setUser, authUser, authRole(ROLE.ADMIN), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let obj = {
            active: "Admin Videos Edit",
            headtitle: "Les éléphants rouges | Admin Videos Edit",
            description: "Les éléphants rouges, videos section",
            user: req.user,
            csrfToken: req.csrfToken(),
            video: {},
            image: ""
        };
        const id = mongo_sanitize_1.default(req.params.id);
        obj.video = JSON.parse(JSON.stringify(req.video));
        //obj.video.url = await utils.revertUrlFormat(obj.video.url);
        let [err, img] = yield utils_1.default.to(Image_1.default.findOne({ _itemId: id }));
        if (err || !img)
            throw new Error(errorMessages_1.default.fetchError);
        obj.image = img;
        return res.status(200).render("restricted/patchVideo", obj);
    }
    catch (err) {
        console.log("ADMIN PATCH VIDEOS ROUTE ERROR", err, req.headers);
        //req.flash("warning", err.message);
        return res.status(400).redirect("/Admin");
    }
}));
router.get("/Admin/Events", setUser, authUser, authRole(ROLE.ADMIN), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let obj = {
            active: "Admin Events",
            headtitle: "Les éléphants rouges | Admin",
            description: "Les éléphants rouges, events section",
            user: req.user,
            csrfToken: req.csrfToken()
        };
        return res.status(200).render("restricted/postEvent", obj);
    }
    catch (err) {
        console.log("ADMIN EVENTS ROUTE ERROR", err, req.headers);
        //req.flash("warning", err.message);
        return res.status(400).redirect("/Admin");
    }
}));
router.get("/Admin/Events/Patch/:id", setEvent, setUser, authUser, authRole(ROLE.ADMIN), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let obj = {
            active: "Admin Events Edit",
            headtitle: "Les éléphants rouges | Admin Events Edit",
            description: "Les éléphants rouges, events section",
            user: req.user,
            csrfToken: req.csrfToken(),
            event: {}
        };
        const id = mongo_sanitize_1.default(req.params.id);
        obj.event = JSON.parse(JSON.stringify(req.event));
        // if (obj.event.url && obj.event.url != "") obj.event.url = await utils.revertUrlFormat(obj.event.url);
        // if (obj.event.eventStart) obj.event.eventStart = obj.event.eventStart.substr(0, obj.event.eventStart.length - 8);
        // if (obj.event.eventEnd) obj.event.eventEnd = obj.event.eventEnd.substr(0, obj.event.eventEnd.length - 8);
        // let [err, img] = await utils.to(Image.findOne({ _itemId: id }));
        // if (err) throw new Error(ERROR_MESSAGE.fetchError);
        // if (img) obj.image = img;
        return res.status(200).render("restricted/patchEvent", obj);
    }
    catch (err) {
        console.log("ADMIN PATCH EVENTS ROUTE ERROR", err, req.headers);
        //req.flash("warning", err.message);
        return res.status(400).redirect("/Admin");
    }
}));
exports.default = router;
