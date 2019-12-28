const Settings = require.main.require("./global/settings");
const Resources = require.main.require("./resources");
const Protocol = require.main.require("../shared/js/models/protocol");

//Note that count is intended to be stateful as to assign incrementing ids
var count = 0;

module.exports = function(evt, context, callback){
	context = context || null;
	callback = callback || null;

	var socket = evt.requestContext;
	if (Settings.DEBUG){
		console.info(Resources.Strings.CLIENT_CONNECTED.format(socket.connectionId));
	}

	//Assign incremental
	count++;
	socket.num = count;

	socket.send(Protocol.create(Protocol.WELCOME));

	if (callback){
		callback(null, {
			statusCode:200
		});
	}
};