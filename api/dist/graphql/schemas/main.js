"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventType = exports.typeDefs = void 0;
const graphql_1 = require("graphql");
const { ApolloServer, gql } = require("apollo-server-express");
exports.typeDefs = gql `
	type File {
		filename: String!
		mimetype: String!
		encoding: String!
	}

	type Event {
		_id: ID
		url: String
		img: [String!]
		address: String
		price: String
		title: String!
		description: String!
		staff: [String!]
		eventStart: String
		eventEnd: String
		createdAt: String
		updatedAt: String
	}

	input EventPost {
		url: String
		img: String
		address: String
		price: String
		title: String!
		description: String!
		staff: String
		eventStart: String
		eventEnd: String
		createdAt: String
		updatedAt: String
	}

	type Query {
		event(id: String!): Event!
		_: Boolean #Added here to satisfy requirement of having at least one query defined
	}

	type Mutation {
		singleUpload(file: Upload!): File!
		singleUploadStream(file: Upload!): File!
		uploadEvent(files: [Upload!], event: EventPost!): Event!
		addEvent(event: EventPost): Event!
	}
`;
// type EventInput {
// 	url: String
// 	address: String
// 	price: String
// 	title:  String!
// 	description: String!
// 	staff: GraphQLList(GraphQLNonNull(GraphQLString))  ###
// 	eventStart: String
// 	eventEnd: String
// 	createdAt: String
// 	updatedAt:String
// }
// type EventInputx {
// 	_id: ID!
// 	url: String
// 	address: String
// 	price: String
// 	title:  String!
// 	description: String!
// 	staff: GraphQLList(GraphQLNonNull(GraphQLString))  ###
// 	eventStart: String
// 	eventEnd: String
// 	createdAt: String
// 	updatedAt:String
// }
// type EventDel {
// 	_id: ID!
// }
// type RootQuery {
// 	event(id: ID!): Event!
// 	events: [Event!]!
// }
// type RootMutation {
// 	addEvent(EventInput)
// 	delEvent(id: ID!)
// 	patchEvent(eventInput: EventInputx)
// }
// schema {
// 	query: RootQuery
// 	mutation: RootMutation
// }
exports.EventType = new graphql_1.GraphQLObjectType({
    name: "Event",
    description: "This represents an Event",
    fields: () => ({
        _id: {
            type: graphql_1.GraphQLNonNull(graphql_1.GraphQLID)
        },
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
            type: graphql_1.GraphQLString //date
        },
        eventEnd: {
            type: graphql_1.GraphQLString //date
        },
        createdAt: {
            type: graphql_1.GraphQLString //date
        },
        updatedAt: {
            type: graphql_1.GraphQLString //date
        }
    })
});
