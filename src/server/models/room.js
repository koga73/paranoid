const crypto = require("crypto");

module.exports = function(name){
	return {
		name:name,
		members:[]
	};
};