#!/usr/bin/env node

require("../shared/js/polyfill");

const Express = require("express");
const Http = require("http");
const WebSocketServer = require("ws").Server;
const BodyParser = require("body-parser");
const UUID = require("node-uuid");

const ErrorHandler = require("./global/error-handler");
const Settings = require("./global/settings");
const Log = require("./utils/log");
const Resources = require("./resources");
const SocketHandlers = require("./socket-handlers");

module.exports = (function(){
	var _vars = {
		_server:null,
		_socketServer:null
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

			//Body parser
			app.use(BodyParser.urlencoded({extended:false}));
			app.use(BodyParser.json());

			//Static
			app.use(Express.static(__dirname + "/../../www"));

			//Download portable
			app.get("paranoid-portable.html", (req, res) => {
				res.download(__dirname + "/../../www/paranoid-portable.html");
			});

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
			console.log("          ", Log.COLORS.SYSTEM.RESET, "[ connections ]");
			console.log();
			console.log();
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