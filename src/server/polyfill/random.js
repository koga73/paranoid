const crypto = require("crypto");

(function(){
	Math.random = function(){
		return crypto.randomBytes(4).readUInt32LE() / 0xFFFFFFFF;
	};
})();