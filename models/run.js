module.exports = function(sequelize, DataTypes) {
	var Run = sequelize.define("Run", {
		experiment: DataTypes.STRING,
		crossref: DataTypes.STRING,
		status: DataTypes.STRING,
		attempts: DataTypes.INTEGER,
		formsNeeded: DataTypes.INTEGER,
		endsAt: DataTypes.BIGINT,
		switches: DataTypes.INTEGER,
	});

	return Run;
};
