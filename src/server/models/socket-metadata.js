const STATE = {
	KEY:"key",
	ESTABLISHED:"established"
};

module.exports = function(params){
	var _instance = {
		id:null,
		num:-1,
		seqFromRelay:0,
		seqFromClient:0,
		state:STATE.KEY,
		key:null,
		iv:null
	};
	for (param in params){
		_instance[param] = params[param];
	}
	return _instance;
};
module.exports.STATE = STATE;