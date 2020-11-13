import {
	graphql,
	buildSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLNonNull,
	GraphQLID
} from "graphql";
const { ApolloServer, gql } = require("apollo-server-express");

export const typeDefs = gql`
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

export const EventType = new GraphQLObjectType({
	name: "Event",
	description: "This represents an Event",
	fields: () => ({
		_id: {
			type: GraphQLNonNull(GraphQLID)
		},
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
			type: GraphQLString //date
		},
		eventEnd: {
			type: GraphQLString //date
		},
		createdAt: {
			type: GraphQLString //date
		},
		updatedAt: {
			type: GraphQLString //date
		}
	})
});
