var Models = require.main.require("./models");
var Strings = require.main.require("./resources/strings");

//Assuming the rest of the application is stateless... this is the application state
//Note this is stored in memory but could be put into database
module.exports = (function(){
	var count = 0;
	var rooms = {};
	var socketMetadata = {};

	return {
		getCount:function(){
			count++;
			return count;
		},

		getRoom:function(name){
			name = name.toLowerCase();

			var room = rooms[name] || null;
			if (!room){
				room = new Models.Room(name);
				rooms[name] = room;
			}
			return room;
		},

		addSocketMetadata:function(smd){
			var id = smd.id;
			if (id in socketMetadata){
				throw new Error(Strings.ERROR_EXISTS_SOCKET_ID.format(id));
			}
			socketMetadata[id] = smd;
		},

		getSocketMetadata:function(id){
			return socketMetadata[id] || null;
		},

		removeSocketMetadata:function(id){
			delete socketMetadata[id];
		}
	};
})();