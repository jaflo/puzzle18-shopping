var fs = require("fs");
var arrayShuffle = require("array-shuffle");
var randomstring = require("randomstring");
var express = require("express");
var router = express.Router();

var cats = fs.readFileSync("data/cats.txt", "utf8").split("\n").filter(function(e){return !!e});
var dogs = fs.readFileSync("data/dogs.txt", "utf8").split("\n").filter(function(e){return !!e});
var sets = [cats, dogs];
var labels = ["cats", "dogs"];

router.get("/get", function(req, res, next) {
	var images = [],
		correct = (Math.random()*2)|0,
		yes = sets[correct],
		no = sets[1-correct],
		correctImages = [],
		correctCount = (Math.random()*2+3)|0,
		challenge = randomstring.generate();

	for (var i = 0; i < correctCount; i++) {
		var selected = yes[(Math.random()*yes.length|0)];
		correctImages.push(selected);
		images.push(selected);
	}
	for (var i = images.length; i < 9; i++) {
		images.push(no[(Math.random()*no.length|0)]);
	}
	fs.writeFileSync("data/challenges/"+challenge+".json", JSON.stringify({
		correct: correctImages,
		images: images
	}));
	res.json({
		challenge: challenge,
		label: labels[correct],
		images: arrayShuffle(images)
	});
});

router.post("/verify", function(req, res, next) {
	var challengeFile = "data/challenges/"+req.body.challenge+".json",
		data = JSON.parse(fs.readFileSync(challengeFile, "utf8"));
		verification = randomstring.generate(),
		challenge = req.body.challenge,
		wrong = 0,
		selected = req.body.selected,
		correct = data.correct;
	selected = Array.from(new Set(selected));
	correct.forEach(function(item) {
		item = item.split(".")[0];
		var index = selected.indexOf(item);
		if (index == -1) wrong++;
		else selected.splice(index, 1);
	});
	if (wrong + selected.length <= 1) {
		fs.writeFileSync(challengeFile, JSON.stringify({
			correct: data.correct,
			verification: verification
		}));
		res.json({
			challenge: challenge,
			status: "passed",
			verification: verification
		});
	} else {
		res.json({
			challenge: challenge,
			status: "failed"
		});
		fs.unlinkSync(challengeFile);
	}
});

module.exports = router;
