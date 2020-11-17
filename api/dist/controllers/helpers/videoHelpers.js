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
    fetchMainImg: function (videos) {
        return __awaiter(this, void 0, void 0, function* () {
            // need video event
            let arr = [];
            for (let i = 0; i < videos.length; i++) {
                let obj = {
                    _id: videos[i]._id,
                    url: videos[i].url,
                    title: videos[i].title,
                    description: videos[i].description,
                    authors: videos[i].authors,
                    shortdescription: videos[i].description.substr(0, 256),
                    shorttitle: videos[i].title.substr(0, 128),
                    date: videos[i].date,
                    createdAt: videos[i].createdAt,
                    updatedAt: videos[i].updatedAt,
                    mainImg: undefined,
                    __v: videos[i].__v
                };
                let [err, img] = yield utils_1.default.to(Image_1.default.findOne({ _itemId: videos[i]._id, itemType: "cover" }));
                if (err || !img)
                    throw new Error(errorMessages_1.default.fetchImg);
                obj.mainImg = img.path;
                arr.push(obj);
            }
            return arr;
        });
    }
};
