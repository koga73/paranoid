module.exports = {
	NAME:"Paranoid",
	VERSION:"0.0.1",
	PASSPHRASE:"#pjY5?p.qZ+U;E!nF72W]p*C", //Optional - If set client must match to send data

	DEBUG:getArg("--debug") !== null,
	SERVER_PORT:getArg("--port") || getArg("-p") || process.env.PORT || 8888, //Used for both WebServer and SocketServer

	MAX_BODY_SIZE:512,
	MAX_USERNAME_SIZE:32,
	MAX_CONTENT_SIZE:255,

	consoleContext:null //This gets set by using the "room" command in console
};

function getArg(key) {
	var index = process.argv.indexOf(key);
	var next = process.argv[index + 1];
	return index < 0 ? null : !next || next[0] === "-" ? true : next;
}