var Models = require.main.require("./models");

//Assuming the rest of the application is stateless... this is the application state
//Note this is stored in memory but could be put into database
module.exports = (function(){
	var count = 0;
	var rooms = {};

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
		}
	};
})();