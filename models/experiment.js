module.exports = function(sequelize, DataTypes) {
	var Experiment = sequelize.define("Experiment", {
		short: DataTypes.STRING, // short ID for URLs
		title: DataTypes.STRING,
		leftUrl: DataTypes.STRING,
		leftIsYoutube: DataTypes.BOOLEAN,
		rightUrl: DataTypes.STRING,
		rightIsYoutube: DataTypes.BOOLEAN,
		exitUrl: DataTypes.STRING,
		timeLimit: DataTypes.INTEGER,
		formsNeeded: DataTypes.INTEGER,
		submissions: DataTypes.INTEGER,
	});

	return Experiment;
};
