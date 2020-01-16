#!/usr/bin/env node

require("./polyfill/base64.js");
require("./polyfill/random.js");
require("../shared/js/polyfill");

const fs = require("fs");

const Express = require("express");
const Http = require("http");
const WebSocketServer = require("ws").Server;
const BodyParser = require("body-parser");
const UUID = require("node-uuid");

const ErrorHandler = require("./errors/error-handler");
const Settings = require("./global/settings");
const Log = require("./utils/log");
const Resources = require("./resources");
const SocketHandlers = require("./socket-handlers");
const Broadcast = require.main.require("./socket-handlers/broadcast");
const State = require.main.require("./global/state");

module.exports = (function(){
	const CONSOLE_MODE = {
		ROOM:"room"
	};

	var _vars = {
		_server:null,
		_socketServer:null,

		_pageDefaultCache:null,

		_consoleMode:null
	};

	var _methods = {
		init:function(){
			process.on('uncaughtException', ErrorHandler.handler_uncaught_exception);
			process.stdin.on("data", _methods._handler_stdin_data);

			if (Settings.DEBUG){
				console.info("DEBUG ENABLED");
			}
			_methods._displayCommands();
			_methods._initServer();
		},

		_initServer:function(){
			//Express server
			var app = Express();

			//Hosts
			if (Settings.HOSTS && Settings.HOSTS.length){
				app.use(_methods._verifyHost);
			}

			//Body parser
			app.use(BodyParser.urlencoded({extended:false}));
			app.use(BodyParser.json());

			//Get default page and inject with client server data
			app.get("/", _methods._getDefaultPage);
			app.get(Settings.PAGE_DEFAULT, _methods._getDefaultPage);

			//Download portable
			app.get(Settings.PAGE_PORTABLE, (req, res) => {
				res.download(`${Settings.CLIENT_HTML_PATH}/${Settings.PAGE_PORTABLE}`);
			});

			//Static
			app.use(Express.static(Settings.CLIENT_HTML_PATH));

			//Node server
			var server = Http.createServer(app);
			_vars._server = server;

			//Socket server
			var socketServer = new WebSocketServer({server});
			socketServer.on("connection", _methods._handler_socketServer_connection);
			_vars._socketServer = socketServer;

			//Listen
			server.listen(Settings.SERVER_PORT, () => {
				console.log(Resources.Strings.LISTENING.format(Settings.SERVER_PORT));
			});
		},

		destroy:function(){
			if (_vars._socketServer){
				_vars._socketServer.close();
				_vars._socketServer = null;
			}
			if (_vars._server){
				_vars._server.close();
				_vars._server = null;
			}

			process.stdin.removeListener("data", _methods._handler_stdin_data);
			process.removeListener('uncaughtException', ErrorHandler.handler_uncaught_exception);
		},

		reset:function(){
			_methods.destroy();
			_methods.init();
		},

		getClients:function(){
			return Array.from(_vars._socketServer.clients);
		},

		_handler_socketServer_connection:function(socket){
			socket.connectionId = UUID.v4();
			socket.on("message", _methods._handler_socket_message);
			socket.on("close", _methods._handler_socket_close);

			//Designed to mimic Amazon WebSocket API Lambda function for easy porting
			SocketHandlers.OnConnect({
				requestContext:socket
			});
		},

		_handler_socket_message:function(message){
			var socket = this;

			//Designed to mimic Amazon WebSocket API Lambda function for easy porting
			SocketHandlers.OnMessage({
				requestContext:socket,
				body:`{"message":${message}}`
			});
		},

		_handler_socket_close:function(){
			var socket = this;
			socket.removeListener("message", _methods._handler_socket_message);
			socket.removeListener("close", _methods._handler_socket_close);

			//Designed to mimic Amazon WebSocket API Lambda function for easy porting
			SocketHandlers.OnDisconnect({
				requestContext:socket
			});
		},

		//Console input
		_handler_stdin_data:function(data){
			var input = data.toString().trim();

			switch (_vars._consoleMode){
				case CONSOLE_MODE.ROOM:
					if (input == ":q!"){
						Settings.consoleContext = null;
						_vars._consoleMode = null;

						console.clear();
						_methods._displayCommands();
						return;
					}
					var roomName = Resources.Regex.CONTEXT_ROOM.exec(Settings.consoleContext)[2];
					var room = State.getRoom(roomName); //Will be created if doesn't already exist
					Broadcast(room, null, null, {
						content:input
					});
					return;
			}

			//room:${room_name}
			if (Resources.Regex.CONTEXT_ROOM.test(input)){
				Settings.consoleContext = input.toLowerCase();
				_vars._consoleMode = CONSOLE_MODE.ROOM;

				console.clear();
				console.log(Resources.Strings.CONSOLE_CONTEXT.format(Settings.consoleContext));
				return;
			}

			switch (input){
				case "end":
				case "exit":
					_methods.destroy();
					process.exit(0);
					break;
				case "reset":
					_methods.reset();
					break;
				case "cls":
				case "clear":
					console.clear();
					_methods._displayCommands();
					break;
				case "connections":
					console.log(Resources.Strings.ACTIVE_CONNECTIONS.format(_methods.getClients().length));
					break;
				case "passphrase":
					console.log(Settings.PASSPHRASE);
					break;
				case "?":
				default:
					_methods._displayCommands();
					break;
			}
		},

		_displayCommands:function(){
			console.log();
			console.log(Log.COLORS.BG.MAGENTA, Settings.NAME + " " + Settings.VERSION, Log.COLORS.SYSTEM.RESET);
			console.log(Log.COLORS.BG.BLUE, "Commands:", Log.COLORS.SYSTEM.RESET, "[ end | exit ] [ reset ] [ cls | clear ]");
			console.log("          ", Log.COLORS.SYSTEM.RESET, "[ connections ] [ passphrase ] [ room:${room_name} ]");
			console.log();
			console.log();
		},

		_verifyHost:function(req, res, next){
			var host = req.headers.host;
			if (host){
				if (Settings.HOSTS.indexOf(host.replace(/:\d+$/, "")) != -1){
					next();
					return;
				}
			}
			res.statusCode = 404;
			res.end();
		},

		_getDefaultPage:function(req, res, next){
			var promise = null;
			if (Settings.CACHE_PAGE_DEFAULT && !Settings.DEBUG){
				if (_vars._pageDefaultCache){
					promise = Promise.resolve(_vars._pageDefaultCache);
				} else {
					promise = _methods._getPageHtml(Settings.PAGE_DEFAULT)
						.then((html) => {
							_vars._pageDefaultCache = html;

							return Promise.resolve(html);
						});
				}
			} else {
				promise = _methods._getPageHtml(Settings.PAGE_DEFAULT);
			}
			promise
				.then((html) => {
					res.send(html);
				})
				.catch((err) => {
					ErrorHandler.handler_caught_exception(err);
					res.statusCode = 500;
				})
				.finally(() => {
					res.end();
				});
		},

		//Grabs page html from file system and injects client server data
		_getPageHtml:function(relativePath){
			return new Promise((resolve, reject) => {
				fs.readFile(`${Settings.CLIENT_HTML_PATH}/${relativePath}`, Settings.ENCODING, function(err, data){
					if (err){
						reject(err);
						return;
					}
					resolve(data
						.replace(
							new RegExp(`${Settings.CLIENT_BEGIN_REPLACE}([\\s\\S]+)${Settings.CLIENT_END_REPLACE}`),
							`var ServerDefaults = JSON.parse('${JSON.stringify(Settings.CLIENT_SERVER_DEFAULTS)}');`
						)
					);
				});
			});
		}
	};
	_methods.init();

	return {
		init:_methods.init,
		destroy:_methods.destroy,
		reset:_methods.reset,
		getClients:_methods.getClients
	};
})();