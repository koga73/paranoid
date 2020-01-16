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
		KEY:{
			type:_TYPE.SYSTEM,
			code:100,
			content:null
		},
		WELCOME:{
			type:_TYPE.SYSTEM,
			code:110,
			from:Strings.NAME_SYS || null,
			content:Strings.PROTOCOL_WELCOME || null,
			room:Strings.DEFAULT_ROOM
		},
		ROOM:{
			type:_TYPE.SYSTEM,
			code:120,
			from:Strings.NAME_SYS || null,
			content:Strings.PROTOCOL_ROOM || null,
			name:null,
			members:0
		},
		SYS_MSG:{
			type:_TYPE.SYSTEM,
			code:130,
			from:Strings.NAME_SYS || null,
			to:null,
			content:null
		},

		//User
		READY:{
			type:_TYPE.USER,
			code:200,
		},
		JOIN:{
			type:_TYPE.USER,
			code:210,
			from:null,
			to:null, //Example: "room:public"
			content:"join"
		},
		MSG:{
			type:_TYPE.USER,
			code:220,
			from:null,
			to:null,
			content:null,
			self:false
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