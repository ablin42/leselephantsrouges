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
exports.RootMutationType = exports.resolvers = exports.RootQueryType = void 0;
const graphql_1 = require("graphql");
const shortid_1 = __importDefault(require("shortid"));
const errorMessages_1 = __importDefault(require("../../controllers/helpers/errorMessages"));
const utils_1 = __importDefault(require("../../controllers/helpers/utils"));
const main_1 = require("../schemas/main");
const Event_1 = __importDefault(require("../../models/Event"));
const mongo_sanitize_1 = __importDefault(require("mongo-sanitize"));
const { vEvent } = require("../../controllers/validators/vEvent");
//any here
function transformEvent(event) {
    return Object.assign(Object.assign({}, event._doc), { _id: event.id, date: event._doc.date, eventStart: event._doc.eventStart, eventEnd: event._doc.eventEnd });
}
exports.RootQueryType = new graphql_1.GraphQLObjectType({
    name: "Query",
    description: "Root Query",
    fields: () => ({
        event: {
            type: main_1.EventType,
            description: "A single Event",
            args: {
                id: { type: graphql_1.GraphQLString }
            },
            resolve: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const id = mongo_sanitize_1.default(args.id);
                    let [err, event] = yield utils_1.default.to(Event_1.default.findById(id));
                    if (err)
                        throw new Error(errorMessages_1.default.fetchError);
                    if (!event)
                        throw new Error(errorMessages_1.default.noResult);
                    //event = await eHelpers.fetchMainImg(event);
                    event = transformEvent(event);
                    return event;
                }
                catch (err) {
                    console.log("ERROR FETCHING SINGLE EVENT");
                    throw err;
                }
            })
        },
        events: {
            type: new graphql_1.GraphQLList(main_1.EventType),
            description: "A list of all the Events",
            resolve: () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    let [err, event] = yield utils_1.default.to(Event_1.default.find());
                    if (err)
                        throw new Error(errorMessages_1.default.fetchError);
                    if (!event)
                        throw new Error(errorMessages_1.default.noResult);
                    //event = await eHelpers.fetchMainImg(event);
                    return event;
                }
                catch (err) {
                    console.log("ERROR FETCHING EVENTS");
                    throw err;
                }
            })
        }
    })
});
const User_1 = __importDefault(require("../../models/User"));
function userSet(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.session._id;
        if (userId) {
            let [err, user] = yield utils_1.default.to(User_1.default.findById(userId));
            if (err || user == null)
                throw new Error(errorMessages_1.default.userNotFound);
            user.password = undefined;
            req.user = user;
        }
    });
}
function userAuth(req) {
    if (!req.user)
        throw new Error(errorMessages_1.default.logInNeeded);
}
const fs = require("fs");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
aws_sdk_1.default.config.region = process.env.AWS_REGION;
const BUCKET = "" + process.env.S3_BUCKET;
const s3 = new aws_sdk_1.default.S3();
exports.resolvers = {
    Query: {
        event: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const id = mongo_sanitize_1.default(args.id);
                let [err, event] = yield utils_1.default.to(Event_1.default.findById(id));
                if (err)
                    throw new Error(errorMessages_1.default.fetchError);
                if (!event)
                    throw new Error(errorMessages_1.default.noResult);
                //event = await eHelpers.fetchMainImg(event);
                event = transformEvent(event);
                return event;
            }
            catch (err) {
                console.log("ERROR FETCHING SINGLE EVENT");
                throw err;
            }
        })
    },
    Mutation: {
        singleUpload: (parent, args) => {
            return args.file.then((file) => {
                const { createReadStream, filename, mimetype } = file;
                const fileStream = createReadStream();
                fileStream.pipe(fs.createWriteStream(`./uploadedFiles/${filename}`));
                return file;
            });
        },
        singleUploadStream: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            const file = yield args.file;
            const { createReadStream, filename, mimetype } = file;
            const fileStream = createReadStream();
            //Here stream it to S3
            // Enter your bucket name here next to "Bucket: "
            const uploadParams = { Bucket: BUCKET, Key: filename, Body: fileStream }; //change key
            const result = yield s3.upload(uploadParams).promise();
            console.log(result);
            return file;
        }),
        uploadEvent: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                //vEvent;
                //await utils.checkValidity(context);
                let eventData = args.event;
                const obj = {
                    title: eventData.title,
                    description: eventData.description,
                    eventStart: eventData.eventStart,
                    eventEnd: eventData.eventEnd,
                    address: eventData.address,
                    price: eventData.price,
                    staff: eventData.staff,
                    img: [],
                    url: ""
                };
                throw new Error("no");
                if (args.files) {
                    for (let i = 0; i < args.files.length; i++) {
                        const file = yield args.files[i];
                        const { createReadStream, filename, mimetype } = file;
                        const fileStream = createReadStream();
                        const ext = "." + file.mimetype.slice(6);
                        const newFilename = Date.now().toString() + "-" + shortid_1.default.generate() + ext;
                        const uploadParams = { Bucket: BUCKET, Key: newFilename, Body: fileStream };
                        const result = yield s3.upload(uploadParams).promise();
                        obj.img.push(result.Location);
                    }
                }
                if (eventData.staff)
                    obj.staff = yield utils_1.default.parseAuthors(eventData.staff);
                if (eventData.url)
                    obj.url = yield utils_1.default.parseUrl(eventData.url);
                let newEvent = new Event_1.default(obj);
                let [err, event] = yield utils_1.default.to(newEvent.save());
                if (err)
                    throw new Error(errorMessages_1.default.saveError);
                event = transformEvent(event);
                console.log(`Event added: ${newEvent._id}`);
                return event;
            }
            catch (err) {
                console.log(err);
                console.log("ERROR ADDING EVENT");
                throw err;
            }
        }),
        addEvent: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(args);
                let azerty = args.event;
                // console.log(req.files, "??");
                // req.session._id = "5f8448ab18d9c672a47e0c5c";
                // await userSet(req);
                // await userAuth(req);
                const obj = {
                    title: azerty.title,
                    description: azerty.description,
                    eventStart: azerty.eventStart,
                    eventEnd: azerty.eventEnd,
                    address: azerty.address,
                    price: azerty.price,
                    staff: azerty.staff,
                    url: ""
                };
                //let imgData;
                //const files = req.files as Express.MulterS3.File[];
                if (azerty.staff)
                    obj.staff = yield utils_1.default.parseAuthors(azerty.staff);
                if (azerty.url)
                    obj.url = yield utils_1.default.parseUrl(azerty.url);
                //if (req.files.length > 0) imgData = await utils.parseImgData(files);
                let newEvent = new Event_1.default(obj);
                let [err, event] = yield utils_1.default.to(newEvent.save());
                console.log(err);
                if (err)
                    throw new Error(errorMessages_1.default.saveError);
                event = transformEvent(event);
                // if (req.files.length > 0 && imgData) {
                // 	err = await utils.saveImages(imgData, event._id, "event");
                // 	if (err) throw new Error(err);
                // }
                console.log(`Event added: ${newEvent._id}`);
                return event;
            }
            catch (err) {
                console.log(err);
                console.log("ERROR ADDING EVENT");
                throw err;
            }
        })
    }
};
exports.RootMutationType = new graphql_1.GraphQLObjectType({
    name: "Mutation",
    description: "Root Mutation",
    fields: () => ({
        addEvent: {
            type: main_1.EventType,
            description: "Add an Event",
            args: {
                url: {
                    type: graphql_1.GraphQLString
                },
                address: {
                    type: graphql_1.GraphQLString
                },
                price: {
                    type: graphql_1.GraphQLString
                },
                title: {
                    type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString)
                },
                description: {
                    type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString)
                },
                staff: {
                    type: graphql_1.GraphQLList(graphql_1.GraphQLNonNull(graphql_1.GraphQLString))
                },
                eventStart: {
                    type: graphql_1.GraphQLString
                },
                eventEnd: {
                    type: graphql_1.GraphQLString
                }
                // img: {
                // 	//
                // 	type: GraphQLUpload
                // }
            },
            resolve: (parent, args, req) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    // console.log(req.files, "??");
                    // req.session._id = "5f8448ab18d9c672a47e0c5c";
                    // await userSet(req);
                    // await userAuth(req);
                    const obj = {
                        title: args.title,
                        description: args.description,
                        eventStart: args.eventStart,
                        eventEnd: args.eventEnd,
                        address: args.address,
                        price: args.price,
                        staff: args.staff,
                        url: ""
                    };
                    //let imgData;
                    //const files = req.files as Express.MulterS3.File[];
                    if (args.staff)
                        obj.staff = yield utils_1.default.parseAuthors(args.staff);
                    if (args.url)
                        obj.url = yield utils_1.default.parseUrl(args.url);
                    //if (req.files.length > 0) imgData = await utils.parseImgData(files);
                    let newEvent = new Event_1.default(obj);
                    let [err, event] = yield utils_1.default.to(newEvent.save());
                    if (err)
                        throw new Error(errorMessages_1.default.saveError);
                    event = transformEvent(event);
                    // if (req.files.length > 0 && imgData) {
                    // 	err = await utils.saveImages(imgData, event._id, "event");
                    // 	if (err) throw new Error(err);
                    // }
                    console.log(`Event added: ${newEvent._id}`);
                    return event;
                }
                catch (err) {
                    console.log("ERROR ADDING EVENT");
                    throw err;
                }
            })
        },
        delEvent: {
            type: main_1.EventType,
            description: "Edit an Event",
            args: {
                id: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLID) }
            },
            resolve: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const id = mongo_sanitize_1.default(args.id);
                    let err, event, img;
                    [err, event] = yield utils_1.default.to(Event_1.default.findOneAndDelete({ _id: id }));
                    if (err)
                        throw new Error(errorMessages_1.default.delError);
                    if (!event)
                        throw new Error(errorMessages_1.default.noResult);
                    // [err, img] = await utils.to(Image.findOne({ _itemId: id }));
                    // if (err || !img) throw new Error(ERROR_MESSAGE.fetchImg);
                    // let s3 = new aws.S3();
                    // let params = { Bucket: BUCKET, Key: img.key };
                    // s3.deleteObject(params, function (err, data) {
                    // 	if (err) throw new Error(ERROR_MESSAGE.delImg);
                    // });
                    // await Image.deleteOne({ _id: img._id });
                    event = transformEvent(event);
                    console.log(`Event deleted: ${id}`);
                    return event;
                }
                catch (err) {
                    console.log("ERROR DELETING EVENT");
                    throw err;
                }
            })
        },
        patchEvent: {
            type: main_1.EventType,
            description: "Delete an Event",
            args: {
                id: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
                url: {
                    type: graphql_1.GraphQLString
                },
                address: {
                    type: graphql_1.GraphQLString
                },
                price: {
                    type: graphql_1.GraphQLString
                },
                title: {
                    type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString)
                },
                description: {
                    type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString)
                },
                staff: {
                    type: graphql_1.GraphQLList(graphql_1.GraphQLNonNull(graphql_1.GraphQLString))
                },
                eventStart: {
                    type: graphql_1.GraphQLString
                },
                eventEnd: {
                    type: graphql_1.GraphQLString
                }
            },
            resolve: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    // await utils.checkValidity(req);
                    const id = mongo_sanitize_1.default(args.id);
                    const obj = {
                        title: args.title,
                        description: args.description,
                        eventStart: args.eventStart,
                        eventEnd: args.eventEnd,
                        address: args.address,
                        price: args.price,
                        staff: args.staff,
                        url: ""
                    };
                    // let imgData;
                    // const files = req.files as Express.MulterS3.File[];
                    // if (req.body.url) obj.url = await utils.parseUrl(req.body.url);
                    // if (req.files.length > 0) imgData = await utils.parseImgData(files);
                    let [err, event] = yield utils_1.default.to(Event_1.default.findOneAndUpdate({ _id: id }, { $set: obj }, { new: true }));
                    if (err)
                        throw new Error(errorMessages_1.default.updateError);
                    if (!event)
                        throw new Error(errorMessages_1.default.noResult);
                    // if (req.files.length > 0 && imgData) {
                    // 	err = await utils.patchImages(imgData, id, "event");
                    // 	if (err) throw new Error(err);
                    // }
                    event = transformEvent(event);
                    console.log(`Event edited: ${id}`);
                    return event;
                }
                catch (err) {
                    console.log("ERROR UPDATING EVENT");
                    throw err;
                }
            })
        }
    })
});
