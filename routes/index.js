var fs = require("fs");
var express = require("express");
var randomstring = require("randomstring");
var findRemoveSync = require("find-remove");
var router = express.Router();
var rp = require("request-promise");

setInterval(findRemoveSync.bind(this, "data/challenges", {
	age: { seconds: 3600 },
	extensions: [".json"]
}), 600); // every 10 minutes

var topass = process.env.COUPONS_FINISH,
	forcaptcha = process.env.COUPONS_CAPTCHA;

router.get("/", function(req, res, next) {
	if (!req.session.token) {
		// need to authenticate
		res.redirect(process.env.REDIRECT_ON_COMPETE);
		return;
	}
	if (process.env.HOST_SERVICE && req.session.promocodes.length >= topass) {
		rp({
			method: "GET",
			uri: process.env.HOST_SERVICE+"/api/completed",
			qs: {
				secret: process.env.PUZZLE_SECRET,
				token: req.session.token,
			},
			json: true
		});
	}
	res.render("index", {
		title: "Shopping Cart",
		name: req.session.name,
		promos: req.session.promocodes,
		needscaptcha: req.session.promocodes.length >= forcaptcha,
		cancontinue: req.session.promocodes.length >= topass,
		amountdue: topass - req.session.promocodes.length,
		total: topass,
		host: process.env.REDIRECT_ON_COMPETE,
	});
});

router.get("/start", function(req, res, next) {
	if (!req.query.token) {
		// no token?
		res.redirect(process.env.REDIRECT_ON_COMPETE);
	} else if (process.env.HOST_SERVICE) {
		rp({
			method: "GET",
			uri: process.env.HOST_SERVICE+"/api/info",
			qs: {
				secret: process.env.PUZZLE_SECRET,
				token: req.query.token,
			},
			json: true
		}).then(function(data) {
			if (data.status == "success" && data.access) {
				req.session.token = data.data.token;
				req.session.name = data.data.name;
				req.session.promocodes = [];
				res.redirect("/");
			} else {
				// does not have access or something happened
				res.redirect(process.env.REDIRECT_ON_COMPETE);
			}
		}).catch(function(data) {
			res.send(data.error.message);
		});
	} else {
		req.session.token = "sample token";
		req.session.name = "Steve";
		req.session.promocodes = [];
		res.redirect("/");
	}
});

router.post("/applypromo", function(req, res, next) {
	if (req.session.promocodes.length >= topass) {
		res.json({
			status: "invalid",
			reason: "Maximum number of allowed codes has been applied. Refresh page for more information."
		});
	} else if (req.session.promocodes.indexOf(req.body.code) > -1) {
		res.json({
			status: "invalid",
			reason: "Promo code has already been used."
		});
	} else if (req.body.code.toLowerCase()[0] == req.session.name.toLowerCase()[0]) {
		if (req.session.promocodes.length >= forcaptcha) {
			var challengeFile = "data/challenges/"+req.body.challenge+".json";
			if (!req.body.challenge || !req.body.verification || !fs.existsSync(challengeFile)) {
				res.json({
					status: "invalid",
					reason: "Please solve the captcha."
				});
				return;
			}
			var data = JSON.parse(fs.readFileSync(challengeFile, "utf8"));
			if (data.verification != req.body.verification) {
				res.json({
					status: "invalid",
					reason: "Please solve the captcha."
				});
				return;
			}
			fs.unlinkSync(challengeFile);
		}
		req.session.promocodes.push(req.body.code);
		res.json({
			status: "success",
			reason: "Applied!"
		});
	} else {
		res.json({
			status: "invalid",
			reason: "Invalid promo code."
		});
	}
});

module.exports = router;
