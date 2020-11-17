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
const errorMessages_1 = __importDefault(require("./errorMessages"));
const utils_1 = __importDefault(require("./utils"));
const Image_1 = __importDefault(require("../../models/Image"));
exports.default = {
    fetchMainImg: function (events) {
        return __awaiter(this, void 0, void 0, function* () {
            let arr = [];
            for (let i = 0; i < events.length; i++) {
                let obj = {
                    _id: events[i]._id,
                    url: events[i].url,
                    title: events[i].title,
                    description: events[i].description,
                    staff: events[i].staff,
                    shortdescription: events[i].description.substr(0, 256),
                    shorttitle: events[i].title.substr(0, 128),
                    eventStart: events[i].eventStart,
                    eventEnd: events[i].eventEnd,
                    price: events[i].price,
                    date: events[i].date,
                    address: events[i].address,
                    createdAt: events[i].createdAt,
                    updatedAt: events[i].updatedAt,
                    mainImg: undefined,
                    __v: events[i].__v
                };
                let [err, img] = yield utils_1.default.to(Image_1.default.findOne({ _itemId: events[i]._id, itemType: "event" }));
                if (err)
                    throw new Error(errorMessages_1.default.fetchImg);
                if (img)
                    obj.mainImg = img.path;
                arr.push(obj);
            }
            return arr;
        });
    }
};
