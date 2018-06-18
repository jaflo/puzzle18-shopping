var fs = require("fs");
var filesize = require("filesize");
var dateFormat = require("dateformat");
var leftPad = require("left-pad"); // haha
var rightPad = require("right-pad");
var express = require("express");
var router = express.Router();

var exposedFolders = ["", "cats", "dogs", "captcha"];

exposedFolders.forEach(function(folder) {
	router.get("/"+folder, function(req, res, next) {
		renderFileListing(folder, res);
	});
});

function renderFileListing(path, res) {
	var list = fs.readdirSync("./public/images/"+path),
		files = [], maxlen = 18;
	list.forEach(function(file) {
		if (file.length > maxlen) maxlen = file.length;
	});
	maxlen = maxlen + 2;
	list.forEach(function(file) {
		var stats = fs.statSync("./public/images/"+path+"/"+file);
		files.push({
			name: file,
			dir: stats.isDirectory(),
			time: leftPad("", maxlen-file.length)+dateFormat(stats.mtime, "dd-mmm-yyyy HH:MM"),
			size: leftPad(filesize(stats.size, { unix: true }), 8)
		});
	});
	res.render("listing", {
		title: "Index of /images/"+path,
		path: "/images/"+path,
		nameHeading: rightPad("Name", maxlen),
		partime: leftPad("", maxlen-16)+dateFormat(fs.statSync("./public/images/"+path).mtime, "dd-mmm-yyyy HH:MM"),
		contents: files
	});
}

module.exports = router;
