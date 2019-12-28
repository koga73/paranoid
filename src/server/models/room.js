const crypto = require("crypto");

module.exports = function(name){
	return {
		name:name,
		iv:crypto.randomBytes(128), //TODO: await
		members:[]
	};
};