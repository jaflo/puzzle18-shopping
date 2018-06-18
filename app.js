var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var lessMiddleware = require("less-middleware");
var session = require("express-session");
var Sequelize = require("sequelize");
var SequelizeStore = require("connect-session-sequelize")(session.Store);
require("dotenv").config();

var index = require("./routes/index");
var users = require("./routes/users");
var listing = require("./routes/listing");
var captcha = require("./routes/captcha");

var app = express();
app.set("env", process.env.ENV || "development");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

var sequelizeStore = new SequelizeStore({
	db: new Sequelize({
		host: process.env.DB_HOST || "localhost",
		port: process.env.DB_PORT || 3306,
		database: process.env.DB_NAME || "puzzles",
		username: process.env.DB_USER || "root",
		password: process.env.DB_PASSWORD || "",
		dialect: process.env.DB_DIALECT || "mysql",
	})
});
sequelizeStore.sync();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));
var sess = {
	secret: process.env.SESSION_SECRET,
	cookie: { maxAge: 24*60*60*1000 },
	store: sequelizeStore,
	resave: true,
	saveUninitialized: true,
	name: "shopping-session"
}
if (app.get("env") === "production") {
	app.set("trust proxy", 1);
	sess.cookie.secure = true;
}
app.use(session(sess));

app.use("/", index);
app.use("/users", users);
app.use("/images", listing);
app.use("/captcha", captcha);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error("Not Found");
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
