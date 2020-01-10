const Protocol = require.main.require("../shared/js/models/protocol");

const STATE = {
	KEY:"key",
	ESTABLISHED:"established"
};
const STATE_KEY_CODES = [
	Protocol.KEY.code
];
const STATE_ESTABLISHED_CODES = [
	Protocol.READY.code,
	Protocol.MSG.code,
	Protocol.JOIN.code
];

var _class = function(params){
	var _instance = {
		id:null,
		num:-1,
		key:null,
		iv:null,
		seqFromRelay:0,
		seqFromClient:0,
		state:STATE.KEY,

		//Returns true if code is valid for state
		validate:function(code){
			return _class.validate(this.state, code);
		}
	};
	for (param in params){
		_instance[param] = params[param];
	}
	return _instance;
};
_class.STATE = STATE;
_class.validate = function(state, code){
	switch (state){

		case STATE.KEY:
			return STATE_KEY_CODES.indexOf(code) != -1;

		case STATE.ESTABLISHED:
			return STATE_ESTABLISHED_CODES.indexOf(code) != -1;

	}
	return false;
}
module.exports = _class;