const State = require.main.require("./global/state");
const Settings = require.main.require("./global/settings");
const Resources = require.main.require("./resources");
const Send = require.main.require("./socket-handlers/send");
const Protocol = require.main.require("../shared/js/models/protocol");
const Models = require.main.require("./models");

module.exports = function(evt, context, callback){
	context = context || null;
	callback = callback || null;

	var socket = evt.requestContext;
	if (Settings.DEBUG){
		console.info(Resources.Strings.CLIENT_CONNECTED.format(socket.connectionId));
	}

	var metadata = new Models.SocketMetadata({
		id:socket.connectionId,
		num:State.getCount() //Auto-increments
	});
	State.addSocketMetadata(metadata);

	if (callback){
		callback(null, {
			statusCode:200
		});
	}
};