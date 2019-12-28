var Settings = require.main.require("./global/settings");

module.exports = {
	LISTENING:"Listening on http://localhost:{0}",
	CLIENT_CONNECTED:"Client connected: {0}",
	CLIENT_DISCONNECTED:"Client disconnected: {0}",
	ACTIVE_CONNECTIONS:"Active connections: {0}",

	ANONYMOUS:"Anonymous",

	//Errors
	ERROR_INVALID_JSON:"invalid json",
	ERROR_NO_DATA:"no data",
	ERROR_EXCEEDED_BODY:"exceeded body size",
	ERROR_NO_MESSAGE:"no message",
	ERROR_EXCEEDED_MESSAGE:"exceeded message size",
	ERROR_NO_FROM:"no from",
	ERROR_EXCEEDED_USERNAME:"exceeded username size",

	//Protocol strings
	PROTOCOL_WELCOME:`Connected to ${Settings.NAME} ${Settings.VERSION}`
};