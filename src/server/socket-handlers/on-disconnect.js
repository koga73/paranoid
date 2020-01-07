const Settings = require.main.require("./global/settings");
const Resources = require.main.require("./resources");
const State = require.main.require("./global/state");

module.exports = function(evt, context, callback){
	context = context || null;
	callback = callback || null;

	var socket = evt.requestContext;
	if (Settings.DEBUG){
		console.info(Resources.Strings.CLIENT_DISCONNECTED.format(socket.connectionId));
	}

	State.removeSocketMetadata(socket.connectionId);
	//TODO: Remove socket from room!

	if (callback){
		callback(null, {
			statusCode:200
		});
	}
};