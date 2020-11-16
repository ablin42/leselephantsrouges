"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bodyParser = __importStar(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_session_1 = __importDefault(require("express-session"));
const { graphqlUploadExpress } = require("graphql-upload-minimal");
const express_sanitizer_1 = __importDefault(require("express-sanitizer"));
const mongo_sanitize_1 = __importDefault(require("mongo-sanitize"));
const aws = __importStar(require("aws-sdk"));
const path_1 = __importDefault(require("path"));
const MongoStore = require("connect-mongo")(express_session_1.default);
require("dotenv").config({ path: "../.env" });
aws.config.region = process.env.AWS_REGION;
const contact_1 = __importDefault(require("./controllers/contact"));
const auth_1 = __importDefault(require("./controllers/auth"));
const videos_1 = __importDefault(require("./controllers/videos"));
const events_1 = __importDefault(require("./controllers/events"));
const CONNECTION_STRING = process.env.DB_CONNECTION;
const SESSION_SECRET = "" + process.env.SESSION_SECRET;
//Connect to DB
if (CONNECTION_STRING) {
    mongoose_1.default.connect(CONNECTION_STRING, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    }, err => {
        if (err)
            throw err;
        console.log("Connected to database");
    });
}
// Express
const app = express_1.default();
app.use(express_1.default.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "views"));
app.set("trust proxy", 1);
//-- Express Session --//
app.use(express_session_1.default({
    store: new MongoStore({
        mongooseConnection: mongoose_1.default.connection,
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
}));
// Body-Parser
app.use(bodyParser.urlencoded({ extended: true, limit: 25000000 }));
app.use(bodyParser.json({
    limit: 25000000
}));
// BP Error handler
app.use(function (err, req, res, next) {
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
app.use(helmet_1.default());
app.use(helmet_1.default.permittedCrossDomainPolicies());
app.use(helmet_1.default.referrerPolicy({ policy: "same-origin" }));
app.use(helmet_1.default.contentSecurityPolicy({
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
            "www.youtube.com/iframe_api",
            "s.ytimg.com",
            "'unsafe-inline'"
        ],
        frameSrc: ["www.youtube-nocookie.com", "www.youtube.com"],
        imgSrc: ["'self'", "leselephantsrouges.s3.amazonaws.com", "leselephantsrouges.s3.eu-west-1.amazonaws.com"]
    },
    reportOnly: false
}));
//app.use(csurf({ cookie: false }));
// Keep session
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});
// Sanitize body and query params
app.use((req, res, next) => {
    req.body = mongo_sanitize_1.default(req.body);
    req.query = mongo_sanitize_1.default(req.query);
    next();
});
app.use(express_sanitizer_1.default());
app.use(cors_1.default());
//app.use(flash());
// Routes
//app.use("/", pagesRoute);
app.use("/api/contact", contact_1.default);
app.use("/api/auth", auth_1.default);
app.use("/api/events", events_1.default);
app.use("/api/videos", videos_1.default);
app.post("/report-violation", (req, res) => {
    if (req.body) {
        console.log("CSP Violation: ", req.ip, req.body);
    }
    else {
        console.log("CSP Violation: No data received!", req.ip);
    }
    res.status(204).end();
});
const port = process.env.PORT;
app.listen(port, () => console.log(`Listening on port ${port}...`));
