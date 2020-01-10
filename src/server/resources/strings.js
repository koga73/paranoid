var Settings = require.main.require("./global/settings");

module.exports = {
	LISTENING:"Listening on http://localhost:{0}",
	CLIENT_CONNECTED:"Client connected: {0}",
	CLIENT_DISCONNECTED:"Client disconnected: {0}",
	ACTIVE_CONNECTIONS:"Active connections: {0}",

	//DEFAULTS
	ANONYMOUS:"Anonymous",
	DEFAULT_ROOM:"Public",

	//Errors
	ERROR_EXISTS_SOCKET_ID:"socket id {0} already exists",

	ERROR_INVALID_JSON:"invalid json",
	ERROR_INVALID_CODE:"invalid code",
	ERROR_INVALID_FROM:"invalid from",
	ERROR_INVALID_TO:"invalid to",
	ERROR_INVALID_CONTENT:"invalid content",
	ERROR_INVALID_ARRAY_LENGTH:"invalid array length",
	ERROR_INVALID_KEY:"invalid key",

	ERROR_NO_DATA:"no data",
	ERROR_NO_CONTENT:"no content",
	ERROR_NO_FROM:"no from",
	ERROR_NO_TO:"no to",

	ERROR_EXCEEDED_BODY:"exceeded body size",
	ERROR_EXCEEDED_CONTENT:"exceeded content size",
	ERROR_EXCEEDED_USERNAME:"exceeded username size",

	ERROR_DECRYPT:"could not decrypt",
	ERROR_ENCRYPT:"could not encrypt",

	//Protocol strings
	PROTOCOL_WELCOME:`Connected to ${Settings.NAME} ${Settings.VERSION}`,
	PROTOCOL_ROOM:`Joined room {0}`
};