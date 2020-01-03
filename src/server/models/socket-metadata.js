const crypto = require("crypto");

module.exports = function(params){
	var _instance = {
		id:null,
		num:-1,
		key:crypto.randomBytes(32), //Note: 32 x 8 = 256 | TODO: await?
		iv:crypto.randomBytes(12), //Note: 12 x 8 = 96 | TODO: await?
		seqFromRelay:0,
		seqFromClient:0
	};
	for (param in params){
		_instance[param] = params[param];
	}
	return _instance;
};