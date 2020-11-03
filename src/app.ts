import express from "express";
import * as bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
//import flash from "flash";
import csurf from "csurf";

import * as expressSanitizer from "express-sanitizer";
import sanitize from "mongo-sanitize";
import * as aws from "aws-sdk";
import path from "path";

const MongoStore = require("connect-mongo")(session);
require("dotenv").config();
aws.config.region = process.env.AWS_REGION;

import pagesRoute from "./controllers/pages";
import contactRoute from "./controllers/contact";
import authRoute from "./controllers/auth";
import videosRoute from "./controllers/videos";
import eventsRoute from "./controllers/events";

const CONNECTION_STRING = process.env.DB_CONNECTION;
const SESSION_SECRET = "" + process.env.SESSION_SECRET;


//Connect to DB
if (CONNECTION_STRING) {
mongoose.connect(
	CONNECTION_STRING,
	{
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true
	},
	err => {
		if (err) throw err;
		console.log("Connected to database");
	}
);}


// Express
const app = express();

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("trust proxy", 1);

//-- Express Session --//
app.use(
	session({
		store: new MongoStore({
			mongooseConnection: mongoose.connection,
			ttl: 365 * 24 * 60 * 60
		}),
		name: "leselephantsrouges",
		secret: SESSION_SECRET,
		resave: true,
		//proxy: true,
		saveUninitialized: true,
		cookie: {
			path: "/",
			maxAge: 14 * 24 * 60 * 60 * 1000,
			httpOnly: false
			//sameSite: "none",
			//secure: true
		} //secure = true (or auto) requires https else it wont work
		//sameSite: "Lax"
	})
);

// Body-Parser
app.use(bodyParser.urlencoded({ extended: true, limit: 25000000 }));
app.use(
	bodyParser.json({
		limit: 25000000
	})
);

interface ResponseError extends Error {
  status?: number;
}

// BP Error handler
app.use(function (err: ResponseError, req: express.Request, res: express.Response, next: express.NextFunction) {
	res.status(err.status || 500);
	if (req.headers["content-type"] === "application/x-www-form-urlencoded") {
		////req.flash("warning", err.message);
		if (!req.headers.referer)
			return res.status(200).json({ error: true, message: "An error occured with the headers" });
		return res.status(403).redirect(req.headers.referer);
	}
	return res.status(200).json({ error: true, message: err.message });
});

//Helmet;
app.use(helmet());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy({ policy: "same-origin" }));
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			reportUri: "/report-violation",
			defaultSrc: ["'self'", "leselephantsrouges.s3.eu-west-1.amazonaws.com", "www.youtube-nocookie.com", "www.youtube.com"],
			connectSrc: ["'self'", "leselephantsrouges.s3.eu-west-1.amazonaws.com"],
			styleSrc: ["'self'", "stackpath.bootstrapcdn.com", "kit-free.fontawesome.com", "fonts.googleapis.com"],
			fontSrc: ["'self'", "fonts.googleapis.com", "kit-free.fontawesome.com", "fonts.gstatic.com"],
			scriptSrc: [
				"'self'",
				"kit.fontawesome.com",
				"stackpath.bootstrapcdn.com",
				"www.gstatic.com",
				"cdn.jsdelivr.net",
				"cdnjs.cloudflare.com",
				"stackpath.bootstrapcdn.com",
				"kit.fontawesome.com",
				"www.youtube.com/iframe_api", //
				"s.ytimg.com", //
				"'unsafe-inline'"
			],
			frameSrc: ["www.youtube-nocookie.com", "www.youtube.com"],
			imgSrc: ["'self'", "leselephantsrouges.s3.amazonaws.com", "leselephantsrouges.s3.eu-west-1.amazonaws.com"]
		},
		reportOnly: false
	})
);

app.use(csurf({ cookie: false }));


// Keep session
app.use((req, res, next) => {
	res.locals.session = req.session;
	next();
});

// Sanitize body and query params
app.use((req, res, next) => {
	req.body = sanitize(req.body);
	req.query = sanitize(req.query);

	next();
});

app.use(expressSanitizer());

app.use(cors());
//app.use(flash());

// Routes
app.use("/", pagesRoute);
app.use("/api/contact", contactRoute);
app.use("/api/auth", authRoute);
app.use("/api/events", eventsRoute);
app.use("/api/videos", videosRoute);

app.post("/report-violation", (req, res) => {
	if (req.body) {
		console.log("CSP Violation: ", req.ip, req.body);
	} else {
		console.log("CSP Violation: No data received!", req.ip);
	}

	res.status(204).end();
});

const port = process.env.PORT;
app.listen(port, () => console.log(`Listening on port ${port}...`));
