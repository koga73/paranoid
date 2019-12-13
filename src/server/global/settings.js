module.exports = {
	NAME:"Paranoid",
	VERSION:"0.0.1",
	
	DEBUG:getArg("--debug") !== null,
	SERVER_PORT:getArg("--port") || getArg("-p") || process.env.PORT || 8888, //Used for both WebServer and SocketServer
	PING_INTERVAL:10000 //Number of milliseconds to ping clients to ensure active connections
};

function getArg(key) {
	var index = process.argv.indexOf(key);
	var next = process.argv[index + 1];
	return index < 0 ? null : !next || next[0] === "-" ? true : next;
}