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

	welcome(socket, metadata);

	if (callback){
		callback(null, {
			statusCode:200
		});
	}
};

function welcome(socket, metadata){
	Send(socket, Protocol.create(Protocol.WELCOME, {
		iv:metadata.iv.toString("base64"),
		//Note: Currently MITM has to be active during connection to get this key
		//TODO: Future use ECDH to generate and exchange key securely
		key:metadata.key.toString("base64")
	}), metadata, false);
}