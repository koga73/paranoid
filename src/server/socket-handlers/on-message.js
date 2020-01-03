const crypto = require("crypto");

const ErrorHandler = require.main.require("./global/error-handler");
const Settings = require.main.require("./global/settings");
const Resources = require.main.require("./resources");
const Send = require.main.require("./socket-handlers/send");
const Protocol = require.main.require("../shared/js/models/protocol");
const State = require.main.require("./global/state");
const CryptoHelper = require.main.require("../shared/js/helpers/crypto");

module.exports = async function(evt, context, callback){
	context = context || null;
	callback = callback || null;

	var socket = evt.requestContext;
	var metadata = State.getSocketMetadata(socket.connectionId);
	metadata.seqFromClient++;
	var seqNum = metadata.seqFromClient;

	//Lots of error checks, if anything goes wrong terminate the connection!
	var debugObj = evt.body;
	try {
		if (evt.body > Settings.MAX_BODY_SIZE){
			throw new Error(Resources.Strings.ERROR_EXCEEDED_BODY);
		}

		var data = null;
		//Parse JSON
		try {
			data = JSON.parse(evt.body).message;
			debugObj = data;
		} catch (err){
			throw new Error(Resources.Strings.ERROR_INVALID_JSON);
		}

		//Decrypt
		try {
			var tagLen = 16; //Bytes
			var encrypted = Buffer.from(data, "base64");
			var iv = Buffer.from(CryptoHelper.computeIV(metadata.iv, CryptoHelper.IV_FIXED_CLIENT, seqNum));

			var decipher = crypto.createDecipheriv("aes-256-gcm", metadata.key, iv);
			decipher.setAuthTag(encrypted.slice(-tagLen));
			data = decipher.update(encrypted.slice(0, encrypted.length - tagLen), "binary", "utf8") + decipher.final("utf8");

			debugObj = data;
		} catch (err){
			if (Settings.DEBUG){
				throw err;
			} else {
				throw new Error(Resources.Strings.ERROR_DECRYPT);
			}
		}

		//Parse JSON
		try {
			data = JSON.parse(data);
			debugObj = data;
		} catch (err){
			throw new Error(Resources.Strings.ERROR_INVALID_JSON);
		}

		switch (data.code){
			case Protocol.MSG.code:
				caseMessage(socket, metadata, data);
				break;
			default:
				throw new Error(Resources.Strings.ERROR_INVALID_CODE);
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

function caseMessage(socket, metadata, data){
	var content = data.content || null;
	if (!content){
		throw new Error(Resources.Strings.ERROR_NO_CONTENT);
	}
	if (content.length > Settings.MAX_CONTENT_SIZE){
		throw new Error(Resources.Strings.ERROR_CONTENT_MESSAGE);
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
		from = `${ANONYMOUS}-{0}`.format(metadata.num);
	} else {
		//TODO
	}

	var to = data.to || null;
	if (!to){
		throw new Error(Resources.Strings.ERROR_NO_TO);
	}
	if (to.length > Settings.MAX_USERNAME_SIZE){
		throw new Error(Resources.Strings.ERROR_EXCEEDED_USERNAME);
	}

	if (Resources.Regex.TO_ROOM.test(to)){
		var roomName = Resources.Regex.TO_ROOM.exec(to)[1];

		broadcast(socket, metadata, roomName, {
			from:from,
			to:`room:${roomName}`,
			content:content
		});
		return;
	}

	throw new Error(Resources.Strings.ERROR_INVALID_TO);
}

function handle_message_error(socket, err, debugObj){
	socket.terminate();
	ErrorHandler.handler_invalid_message(err, debugObj);
}

function broadcast(fromSocket, metadata, roomName, data){
	//TODO: Channels

	var dataObj = Protocol.create(Protocol.MSG, data);

	var room = State.getRoom(roomName);
	room.members.forEach((socket) => {
		if (fromSocket.connectionId == socket.connectionId){
			Send(socket, Protocol.create(Protocol.MSG, Object.assign({self:true}, data)), metadata);
		} else {
			Send(socket, dataObj, metadata);
		}
	});
}