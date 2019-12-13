#!/usr/bin/env node

const Express = require("express");
const Http = require("http");
const WebSocketServer = require("ws").Server;
const BodyParser = require("body-parser");

const ErrorHandler = require("./global/error_handler");
const Settings = require("./global/settings");
const Log = require("./utils/log");

(() => {
	var _vars = {
		_server:null,
		_socketServer:null,
		_pingInterval:0
	};

	var _methods = {
		init:function(){
			process.on('uncaughtException', ErrorHandler.handler_uncaught_exception);
			process.stdin.on("data", _methods._handler_stdin_data);

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

			//Node server
			var server = Http.createServer(app);
			_vars._server = server;

			//Socket server
			var socketServer = new WebSocketServer({server});
			socketServer.on("connection", _methods._handler_socketServer_connection);
			_vars._socketServer = socketServer;

			//Listen
			server.listen(Settings.SERVER_PORT, () => {
				console.log("Listening on", `http://localhost:${Settings.SERVER_PORT}`);
			});

			_vars._pingInterval = setInterval(_methods._handler_ping_interval, Settings.PING_INTERVAL);
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

			if (_vars._pingInterval){
				clearInterval(_vars._pingInterval);
				_vars._pingInterval = 0;
			};

			process.stdin.removeListener("data", _methods._handler_stdin_data);
			process.removeListener('uncaughtException', ErrorHandler.handler_uncaught_exception);
		},

		reset:function(){
			_methods.destroy();
			_methods.init();
		},

		_handler_socketServer_connection:function(socket){
			socket.isAlive = true;
			socket.on("pong", _methods._handler_socket_pong);
		},

		_handler_ping_interval:function(){
			_vars._socketServer.clients.forEach((socket) => {
				if (!socket.isAlive){
					return socket.terminate();
				}
				socket.isAlive = false; //Set to not alive and wait for pong to revive
				socket.ping("ping", false, true);
			});
		},

		_handler_socket_pong:function(){
			this.isAlive = true;
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
			console.log();
			console.log();
		}
	};
	_methods.init();
})();