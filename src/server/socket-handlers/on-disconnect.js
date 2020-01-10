const Settings = require.main.require("./global/settings");
const Resources = require.main.require("./resources");
const State = require.main.require("./global/state");

module.exports = function(evt, context, callback){
	context = context || null;
	callback = callback || null;

	var socket = evt.requestContext;
	var metadata = State.getSocketMetadata(socket.connectionId);
	if (Settings.DEBUG){
		console.info(Resources.Strings.CLIENT_DISCONNECTED.format(socket.connectionId));
	}

	metadata.rooms.forEach((roomName, index) => {
		var room = State.getRoom(roomName);
		var memberIndex = room.members.indexOf(socket);
		if (memberIndex != -1){
			room.members.splice(memberIndex, 1);
		}
		metadata.rooms.splice(index, 1);
	});
	State.removeSocketMetadata(socket.connectionId);

	if (callback){
		callback(null, {
			statusCode:200
		});
	}
};