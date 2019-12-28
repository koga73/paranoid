const State = require.main.require("./global/state");
const Settings = require.main.require("./global/settings");
const Resources = require.main.require("./resources");
const Protocol = require.main.require("../shared/js/models/protocol");

module.exports = function(evt, context, callback){
	context = context || null;
	callback = callback || null;

	var socket = evt.requestContext;
	if (Settings.DEBUG){
		console.info(Resources.Strings.CLIENT_CONNECTED.format(socket.connectionId));
	}
	//Auto-increments
	socket.num = State.getCount();

	var defaultRoom = State.getRoom(Resources.Strings.DEFAULT_ROOM);
	defaultRoom.members.push(socket);

	socket.send(Protocol.create(Protocol.WELCOME, {
		room:Resources.Strings.DEFAULT_ROOM
	}));

	if (callback){
		callback(null, {
			statusCode:200
		});
	}
};