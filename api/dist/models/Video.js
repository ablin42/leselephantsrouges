"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const videoSchema = new mongoose_1.default.Schema({
    url: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        max: 255
    },
    description: {
        type: String,
        required: true,
        max: 2048
    },
    isFiction: {
        type: Boolean,
        default: false
    },
    authors: {
        type: Array,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });
videoSchema.plugin(mongoose_paginate_v2_1.default);
exports.default = mongoose_1.default.model("Video", videoSchema);
