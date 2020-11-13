import {
	graphql,
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLNonNull,
	GraphQLID
} from "graphql";
import shortid from "shortid";
import express, { Request, Response, NextFunction } from "express";
import eHelpers from "../../controllers/helpers/eventHelpers";
import ERROR_MESSAGE from "../../controllers/helpers/errorMessages";
import utils from "../../controllers/helpers/utils";
import { EventType } from "../schemas/main";
import Event from "../../models/Event";

import sanitize from "mongo-sanitize";
const { vEvent } = require("../../controllers/validators/vEvent");

//any here
function transformEvent(event: any) {
	return {
		...event._doc,
		_id: event.id,
		date: event._doc.date, //format dates here
		eventStart: event._doc.eventStart,
		eventEnd: event._doc.eventEnd
	};
}

export const RootQueryType = new GraphQLObjectType({
	name: "Query",
	description: "Root Query",
	fields: () => ({
		event: {
			type: EventType,
			description: "A single Event",
			args: {
				id: { type: GraphQLString }
			},
			resolve: async (parent, args) => {
				try {
					const id = sanitize(args.id);

					let [err, event] = await utils.to(Event.findById(id));
					if (err) throw new Error(ERROR_MESSAGE.fetchError);
					if (!event) throw new Error(ERROR_MESSAGE.noResult);

					//event = await eHelpers.fetchMainImg(event);

					event = transformEvent(event);

					return event;
				} catch (err) {
					console.log("ERROR FETCHING SINGLE EVENT");
					throw err;
				}
			}
		},
		events: {
			type: new GraphQLList(EventType),
			description: "A list of all the Events",
			resolve: async () => {
				try {
					let [err, event] = await utils.to(Event.find());
					if (err) throw new Error(ERROR_MESSAGE.fetchError);
					if (!event) throw new Error(ERROR_MESSAGE.noResult);

					//event = await eHelpers.fetchMainImg(event);

					return event;
				} catch (err) {
					console.log("ERROR FETCHING EVENTS");
					throw err;
				}
			}
		}
	})
});

import User from "../../models/User";
async function userSet(req: Request) {
	const userId = req!.session!._id;

	if (userId) {
		let [err, user] = await utils.to(User.findById(userId));
		if (err || user == null) throw new Error(ERROR_MESSAGE.userNotFound);

		user.password = undefined;
		req.user = user;
	}
}

function userAuth(req: Request) {
	if (!req.user) throw new Error(ERROR_MESSAGE.logInNeeded);
}

import upload from "../../controllers/helpers/multer";
import { GraphQLUpload } from "graphql-upload";

const fs = require("fs");
import aws from "aws-sdk";
aws.config.region = process.env.AWS_REGION;
const BUCKET = "" + process.env.S3_BUCKET;
const s3 = new aws.S3();

export const resolvers = {
	Query: {
		event: async (parent: any, args: any) => {
			try {
				const id = sanitize(args.id);

				let [err, event] = await utils.to(Event.findById(id));
				if (err) throw new Error(ERROR_MESSAGE.fetchError);
				if (!event) throw new Error(ERROR_MESSAGE.noResult);

				//event = await eHelpers.fetchMainImg(event);

				event = transformEvent(event);

				return event;
			} catch (err) {
				console.log("ERROR FETCHING SINGLE EVENT");
				throw err;
			}
		}
	},
	Mutation: {
		singleUpload: (parent: any, args: any) => {
			return args.file.then((file: any) => {
				const { createReadStream, filename, mimetype } = file;

				const fileStream = createReadStream();

				fileStream.pipe(fs.createWriteStream(`./uploadedFiles/${filename}`));

				return file;
			});
		},
		singleUploadStream: async (parent: any, args: any) => {
			const file = await args.file;
			const { createReadStream, filename, mimetype } = file;
			const fileStream = createReadStream();

			//Here stream it to S3
			// Enter your bucket name here next to "Bucket: "
			const uploadParams = { Bucket: BUCKET, Key: filename, Body: fileStream }; //change key
			const result = await s3.upload(uploadParams).promise();

			console.log(result);

			return file;
		},
		uploadEvent: async (parent: any, args: any) => {
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
					img: [] as any,
					url: ""
				};

				if (args.files) {
					for (let i = 0; i < args.files.length; i++) {
						const file = await args.files[i];
						const { createReadStream, filename, mimetype } = file;
						const fileStream = createReadStream();

						const ext = "." + file.mimetype.slice(6);
						const newFilename = Date.now().toString() + "-" + shortid.generate() + ext;
						const uploadParams = { Bucket: BUCKET, Key: newFilename, Body: fileStream };
						const result = await s3.upload(uploadParams).promise();

						obj.img.push(result.Location);
					}
				}

				if (eventData.staff) obj.staff = await utils.parseAuthors(eventData.staff);
				if (eventData.url) obj.url = await utils.parseUrl(eventData.url);

				let newEvent = new Event(obj);
				let [err, event] = await utils.to(newEvent.save());
				if (err) throw new Error(ERROR_MESSAGE.saveError);

				event = transformEvent(event);
				console.log(`Event added: ${newEvent._id}`);
				return event;
			} catch (err) {
				console.log(err);
				console.log("ERROR ADDING EVENT");
				throw err;
			}
		},
		addEvent: async (parent: any, args: any) => {
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

				if (azerty.staff) obj.staff = await utils.parseAuthors(azerty.staff);
				if (azerty.url) obj.url = await utils.parseUrl(azerty.url);
				//if (req.files.length > 0) imgData = await utils.parseImgData(files);

				let newEvent = new Event(obj);
				let [err, event] = await utils.to(newEvent.save());
				console.log(err);
				if (err) throw new Error(ERROR_MESSAGE.saveError);

				event = transformEvent(event);

				// if (req.files.length > 0 && imgData) {
				// 	err = await utils.saveImages(imgData, event._id, "event");
				// 	if (err) throw new Error(err);
				// }

				console.log(`Event added: ${newEvent._id}`);
				return event;
			} catch (err) {
				console.log(err);
				console.log("ERROR ADDING EVENT");
				throw err;
			}
		}
	}
};

export const RootMutationType = new GraphQLObjectType({
	name: "Mutation",
	description: "Root Mutation",
	fields: () => ({
		addEvent: {
			type: EventType,
			description: "Add an Event",
			args: {
				url: {
					type: GraphQLString
				},
				address: {
					type: GraphQLString
				},
				price: {
					type: GraphQLString
				},
				title: {
					type: GraphQLNonNull(GraphQLString)
				},
				description: {
					type: GraphQLNonNull(GraphQLString)
				},
				staff: {
					type: GraphQLList(GraphQLNonNull(GraphQLString))
				},
				eventStart: {
					type: GraphQLString
				},
				eventEnd: {
					type: GraphQLString
				}
				// img: {
				// 	//
				// 	type: GraphQLUpload
				// }
			},
			resolve: async (parent, args, req) => {
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

					if (args.staff) obj.staff = await utils.parseAuthors(args.staff);
					if (args.url) obj.url = await utils.parseUrl(args.url);
					//if (req.files.length > 0) imgData = await utils.parseImgData(files);

					let newEvent = new Event(obj);
					let [err, event] = await utils.to(newEvent.save());
					if (err) throw new Error(ERROR_MESSAGE.saveError);

					event = transformEvent(event);

					// if (req.files.length > 0 && imgData) {
					// 	err = await utils.saveImages(imgData, event._id, "event");
					// 	if (err) throw new Error(err);
					// }

					console.log(`Event added: ${newEvent._id}`);
					return event;
				} catch (err) {
					console.log("ERROR ADDING EVENT");
					throw err;
				}
			}
		},
		delEvent: {
			type: EventType,
			description: "Edit an Event",
			args: {
				id: { type: GraphQLNonNull(GraphQLID) }
			},
			resolve: async (parent, args) => {
				try {
					const id = sanitize(args.id);
					let err, event, img;

					[err, event] = await utils.to(Event.findOneAndDelete({ _id: id }));
					if (err) throw new Error(ERROR_MESSAGE.delError);
					if (!event) throw new Error(ERROR_MESSAGE.noResult);

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
				} catch (err) {
					console.log("ERROR DELETING EVENT");
					throw err;
				}
			}
		},
		patchEvent: {
			type: EventType,
			description: "Delete an Event",
			args: {
				id: { type: GraphQLNonNull(GraphQLID) },
				url: {
					type: GraphQLString
				},
				address: {
					type: GraphQLString
				},
				price: {
					type: GraphQLString
				},
				title: {
					type: GraphQLNonNull(GraphQLString)
				},
				description: {
					type: GraphQLNonNull(GraphQLString)
				},
				staff: {
					type: GraphQLList(GraphQLNonNull(GraphQLString))
				},
				eventStart: {
					type: GraphQLString
				},
				eventEnd: {
					type: GraphQLString
				}
			},
			resolve: async (parent, args) => {
				try {
					// await utils.checkValidity(req);
					const id = sanitize(args.id);
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

					let [err, event] = await utils.to(Event.findOneAndUpdate({ _id: id }, { $set: obj }, { new: true }));
					if (err) throw new Error(ERROR_MESSAGE.updateError);
					if (!event) throw new Error(ERROR_MESSAGE.noResult);

					// if (req.files.length > 0 && imgData) {
					// 	err = await utils.patchImages(imgData, id, "event");
					// 	if (err) throw new Error(err);
					// }
					event = transformEvent(event);

					console.log(`Event edited: ${id}`);
					return event;
				} catch (err) {
					console.log("ERROR UPDATING EVENT");
					throw err;
				}
			}
		}
	})
});
