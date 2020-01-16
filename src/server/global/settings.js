const Settings = {
	NAME:"Paranoid",
	VERSION:"0.0.1",

	DEBUG:getArg("--debug") !== null,
	SERVER_PORT:getArg("--port") || getArg("-p") || process.env.PORT || 8888, //Used for both WebServer and SocketServer

	//Request host must match
	//To disable host check set to empty array or null
	HOSTS:[
		"localhost"
	],
	PASSPHRASE:"#pjY5?p.qZ+U;E!nF72W]p*C", //Optional - If set client must match to send data

	//Relative to this file
	CLIENT_HTML_PATH:`${__dirname}/../../../www`,

	//Caches index server-side - DEBUG must also be set to false to enable caching
	CACHE_PAGE_DEFAULT:true,
	PAGE_DEFAULT:"index.html",

	PAGE_PORTABLE:"paranoid-portable.html",

	CLIENT_BEGIN_REPLACE:"\\/\\*\\s+?BEGIN_REPLACE_FROM_SERVER\\s+?\\*\\/",
	CLIENT_END_REPLACE:"\\/\\*\\s+?END_REPLACE_FROM_SERVER\\s+?\\*\\/",

	DEFAULT_USER:"Anonymous",
	DEFAULT_ROOM:"Public",

	MAX_BODY_SIZE:512,
	MAX_USERNAME_SIZE:32,
	MAX_CONTENT_SIZE:255,

	ENCODING:"utf8",

	consoleContext:null //This gets set by using the "room" command in console
};
//Grab last HOST entry
const primaryHost = Settings.HOSTS[Settings.HOSTS.length - 1];
//This block gets written into script tag of hosted page
Settings.CLIENT_SERVER_DEFAULTS = {
	"preferences":{
		"messages":{
			"showTimes":false,
			"disableDecryptAnimation":false
		}
	},
	"relays":[
		{
			"enabled":true,
			"name":primaryHost,
			"address":`ws://${primaryHost}:${Settings.SERVER_PORT}`,
			"passphrase":Settings.PASSPHRASE
		}
	],
	"accounts":[
		{
			"username":Settings.DEFAULT_USER
		}
	]
};
module.exports = Settings;

function getArg(key) {
	var index = process.argv.indexOf(key);
	var next = process.argv[index + 1];
	return index < 0 ? null : !next || next[0] === "-" ? true : next;
}