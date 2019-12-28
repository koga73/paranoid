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
	ERROR_INVALID_JSON:"invalid json",
	ERROR_NO_DATA:"no data",
	ERROR_EXCEEDED_BODY:"exceeded body size",
	ERROR_NO_CONTENT:"no content",
	ERROR_EXCEEDED_CONTENT:"exceeded content size",
	ERROR_NO_FROM:"no from",
	ERROR_NO_TO:"no to",
	ERROR_EXCEEDED_USERNAME:"exceeded username size",
	ERROR_INVALID_CODE:"invalid code",
	ERROR_INVALID_TO:"invalid to",

	//Protocol strings
	PROTOCOL_WELCOME:`Connected to ${Settings.NAME} ${Settings.VERSION}`
};