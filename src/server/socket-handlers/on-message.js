const Send = require.main.require("./socket-handlers/send");
const Broadcast = require.main.require("./socket-handlers/broadcast");
const ErrorHandler = require.main.require("./errors/error-handler");
const RequestError = require.main.require("./errors/request-error");
const Settings = require.main.require("./global/settings");
const State = require.main.require("./global/state");
const Resources = require.main.require("./resources");
const Protocol = require.main.require("../shared/js/models/protocol");
const Models = require.main.require("./models");
const CryptoHelper = require.main.require("./helpers/crypto");

module.exports = async function(evt, context, callback){
	context = context || null;
	callback = callback || null;

	var socket = evt.requestContext;
	var metadata = State.getSocketMetadata(socket.connectionId);
	metadata.seqFromClient++;

	//Lots of error checks, if anything goes wrong terminate the connection!
	var debugObj = evt.body;
	try {
		if (evt.body > Settings.MAX_BODY_SIZE){
			throw new RequestError(Resources.Strings.ERROR_EXCEEDED_BODY);
		}

		var data = null;
		//Parse JSON
		try {
			data = JSON.parse(evt.body).message;
			debugObj = data;
		} catch (err){
			throw new RequestError(Resources.Strings.ERROR_INVALID_JSON);
		}

		if (metadata.state != Models.SocketMetadata.STATE.KEY){
			//Decrypt
			try {
				var iv = Buffer.from(CryptoHelper.computeIV(metadata.iv, CryptoHelper.IV_FIXED_CLIENT, metadata.seqFromClient));
				/*if (Settings.DEBUG){
					console.log("RECEIVE:", metadata.seqFromClient, iv);
				}*/
				data = await CryptoHelper.decrypt(iv, metadata.key, data);
				debugObj = data;
			} catch (err){
				if (Settings.DEBUG){
					throw err;
				} else {
					throw new RequestError(Resources.Strings.ERROR_DECRYPT);
				}
			}
			//Parse JSON
			try {
				data = JSON.parse(data);
				debugObj = data;
			} catch (err){
				throw new RequestError(Resources.Strings.ERROR_INVALID_JSON);
			}
		}

		//Validate that code passed is allowed for current state
		if (!metadata.validate(data.code)){
			throw new RequestError(Resources.Strings.ERROR_INVALID_CODE);
		}

		switch (data.code){

			case Protocol.KEY.code:
				caseKey(socket, metadata, data);
				break;

			case Protocol.READY.code:
				caseReady(socket, metadata, data);
				break;

			case Protocol.MSG.code:
				caseMsg(socket, metadata, data);
				break;

			case Protocol.JOIN.code:
				caseJoin(socket, metadata, data);
				break;

			default:
				throw new RequestError(Resources.Strings.ERROR_INVALID_CODE);

		}

		if (callback){
			callback(null, {
				statusCode:200
			});
		}
	} catch (err){
		if (err instanceof RequestError){
			ErrorHandler.handler_bad_request(err, debugObj);
		} else {
			ErrorHandler.handler_caught_exception(err);
		}

		if (callback){
			callback(null, {
				statusCode:400,
				body:err.message
			});
		}
		socket.terminate();
	}
};

function caseKey(socket, metadata, data){
	var publicKey = data.content || null;
	if (!Resources.Regex.ECDH_KEY.test(publicKey)){
		throw new RequestError(Resources.Strings.ERROR_INVALID_KEY);
	}

	var keyPair = CryptoHelper.generateKeyAsym(publicKey);
	Send(socket, Protocol.create(Protocol.KEY, {
		content:keyPair.publicKey.toString("hex")
	}), metadata, false);

	//console.log("IV:", keyPair.iv);
	//console.log("KEY:", keyPair.key);

	metadata.iv = keyPair.iv;
	metadata.key = keyPair.key;
	metadata.state = Models.SocketMetadata.STATE.ESTABLISHED;
}

function caseReady(socket, metadata, data){
	Send(socket, Protocol.create(Protocol.WELCOME), metadata);
}

function caseMsg(socket, metadata, data){
	var from = validateFrom(data.from).format(metadata.num);
	var to = validateTo(data.to);
	var content = validateContent(data.content);

	if (Resources.Regex.TO.test(to)){
		var roomName = Resources.Regex.TO.exec(to)[3];
		var room = State.getRoom(roomName); //Will be created if doesn't already exist
		Broadcast(room, socket, metadata, {
			from:from,
			content:content
		});
		return;
	}

	throw new RequestError(Resources.Strings.ERROR_INVALID_TO);
}

function caseJoin(socket, metadata, data){
	var to = validateTo(data.to);

	var room = State.getRoom(to);
	var roomName = room.name;
	if (metadata.rooms.indexOf(roomName) == -1){
		metadata.rooms.push(roomName);
		room.members.push(socket);

		Send(socket, Protocol.create(Protocol.ROOM, {
			content:Protocol.ROOM.content.format(roomName),
			name:roomName,
			members:room.members.length
		}), metadata);
	}
}

//Validates "from" and returns value
function validateFrom(from, required){
	from = from || null;
	required = required !== false;

	if (!from && required){
		throw new RequestError(Resources.Strings.ERROR_NO_FROM);
	}
	if (from.length > Settings.MAX_USERNAME_SIZE){
		throw new RequestError(Resources.Strings.ERROR_EXCEEDED_USERNAME);
	}
	if (!Resources.Regex.USERNAME.test(from)){
		throw new RequestError(Resources.Strings.ERROR_INVALID_FROM);
	}

	const DEFAULT_USER = Resources.Strings.DEFAULT_USER;
	if (from.toLowerCase() == DEFAULT_USER.toLowerCase()){
		return `${DEFAULT_USER}-{0}`;
	}

	//TODO: Validate digital signature for "from" username
	//For now lets throw an error
	throw new RequestError(Resources.Strings.ERROR_INVALID_FROM);

	return from;
}

function validateTo(to, required){
	to = to || null;
	required = required !== false;

	if (!to && required){
		throw new RequestError(Resources.Strings.ERROR_NO_TO);
	}
	if (to.length > Settings.MAX_USERNAME_SIZE){
		throw new RequestError(Resources.Strings.ERROR_EXCEEDED_USERNAME);
	}
	if (!Resources.Regex.TO.test(to)){
		throw new RequestError(Resources.Strings.ERROR_INVALID_TO);
	}

	return to;
}

function validateContent(content, required){
	content = content || null;
	required = required !== false;

	if (!content && required){
		throw new RequestError(Resources.Strings.ERROR_NO_CONTENT);
	}
	if (content.length > Settings.MAX_CONTENT_SIZE){
		throw new RequestError(Resources.Strings.ERROR_INVALID_CONTENT);
	}

	return content;
}