const ErrorHandler = require.main.require("./global/error-handler");
const Settings = require.main.require("./global/settings");
const Resources = require.main.require("./resources");
const Protocol = require.main.require("../shared/js/models/protocol");

module.exports = function(evt, context, callback){
	context = context || null;
	callback = callback || null;

	var socket = evt.requestContext;

	//Lots of error checks, if anything goes wrong terminate the connection!
	var debugObj = null;
	try {
		if (evt.body > Settings.MAX_BODY_SIZE){
			debugObj = evt.body;
			throw new Error(Resources.Strings.ERROR_EXCEEDED_BODY);
		}

		var data = null;
		try {
			data = JSON.parse(evt.body).message;
			debugObj = data;
		} catch (err){
			throw new Error(Resources.Strings.ERROR_INVALID_JSON);
		}
		if (!data){
			throw new Error(Resources.Strings.ERROR_NO_DATA);
		}

		var message = data.message || null;
		if (!message){
			throw new Error(Resources.Strings.ERROR_NO_MESSAGE);
		}
		if (message.length > Settings.MAX_MESSAGE_SIZE){
			throw new Error(Resources.Strings.ERROR_EXCEEDED_MESSAGE);
		}

		var from = data.from || null;
		if (!from){
			throw new Error(Resources.Strings.ERROR_NO_FROM);
		}
		if (from.length > Settings.MAX_USERNAME_SIZE){
			throw new Error(Resources.Strings.ERROR_EXCEEDED_USERNAME);
		}
		const ANONYMOUS = Resources.Strings.ANONYMOUS;
		if (from.toLowerCase() == ANONYMOUS.toLowerCase()){
			from = `${ANONYMOUS}-{0}`.format(socket.num);
		} else {
			//TODO
		}

		var to = data.to || null;
		if (to){
			if (from.length > Settings.MAX_USERNAME_SIZE){
				throw new Error(Resources.Strings.ERROR_EXCEEDED_USERNAME);
			}
			//TODO
		} else {
			broadcast(socket, {
				from:from,
				message:message
			});
		}

		if (callback){
			callback(null, {
				statusCode:200
			});
		}
	} catch (err){
		//TODO: Filter between custom validation errors above and actual uncaught errors
		handle_message_error(socket, err, debugObj);

		if (callback){
			callback(null, {
				statusCode:400,
				body:err.message
			});
		}
	}
};

var App = null;
function broadcast(fromSocket, data){
	//TODO: Channels

	//This has to be here, if up top it returns an empty object
	if (!App){
		App = require.main.require("./app");
	}

	var dataObj = Protocol.create(Protocol.MSG, data);

	var clients = App.getClients();
	clients.forEach((client) => {
		if (fromSocket.connectionId == client.connectionId){
			client.send(Protocol.create(Protocol.MSG, Object.assign({self:true}, data)));
		} else {
			client.send(dataObj);
		}
	});
}

function handle_message_error(socket, err, debugObj){
	socket.terminate();
	ErrorHandler.handler_invalid_message(err, debugObj);
}