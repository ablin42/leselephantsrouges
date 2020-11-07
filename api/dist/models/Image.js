"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ImageSchema = new mongoose_1.default.Schema({
    _itemId: {
        type: String,
        required: true
    },
    itemType: {
        type: String,
        required: true
    },
    key: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });
exports.default = mongoose_1.default.model("Image", ImageSchema);
