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
			room:null
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

			return JSON.stringify(tmp);
		}
	});
})();