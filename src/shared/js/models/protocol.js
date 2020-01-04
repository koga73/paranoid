(function(){
	var creationContext = function(instance){
		typeof OOP !== typeof undefined ? OOP.namespace("Protocol", instance) : module.exports = instance; //For client + server compatibility
	};
	var Strings = typeof Resources !== typeof undefined ? Resources.Strings : require.main.require("./resources/strings");

	var _TYPE = {
		SYSTEM:"system",
		USER:"user"
	};

	creationContext({
		TYPE:_TYPE,

		//System
		WELCOME:{
			type:_TYPE.SYSTEM,
			code:100,
			content:Strings.PROTOCOL_WELCOME || null,
			iv:null, //Base IV for future communication
			key:null, //Encrypt all future communication using this key
			room:Strings.DEFAULT_ROOM
		},
		ROOM:{
			type:_TYPE.SYSTEM,
			code:110,
			content:Strings.PROTOCOL_ROOM || null,
			name:null,
			members:0
		},

		//User
		MSG:{
			type:_TYPE.USER,
			code:200,
			from:null,
			to:null,
			content:null,
			self:false
		},
		JOIN:{
			type:_TYPE.USER,
			code:210,
			from:null,
			to:null,
			content:"join"
		},

		create:function(payload, params){
			params = params || null;

			//Copy message object
			var tmp = {
				time:new Date().getTime()
			};
			for (var prop in payload){
				tmp[prop] = payload[prop];
			}

			//Override from params
			if (params){
				for (var prop in params){
					tmp[prop] = params[prop];
				}
			}

			var jsonStr = JSON.stringify(tmp);

			//Add random value at beginning and end of object to make sequences less predictable
			var rnds = [];
			do {
				var digits = (Math.random() * 4 >> 0) + 1; //Up to 4 digits in length
				var rnd = Math.random().toFixed(digits) * Math.pow(10, digits) >> 0;
				if (rnds.indexOf(rnd) == -1){ //No duplicates
					rnds.push(rnd);
				}
			} while (rnds.length < 4);
			//Chance it won't get prepended
			if (Math.random() < .73){
				jsonStr = jsonStr.replace(/^{/, '{"' + rnds[0] + '":' + rnds[2] + ',');
			}
			//Chance it won't get appended
			if (Math.random() < .37){
				jsonStr = jsonStr.replace(/}$/, ',"' + rnds[1] + '":' + rnds[3] + '}');
			}
			return jsonStr;
		}
	});
})();