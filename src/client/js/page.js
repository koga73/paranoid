(function(){
	var MsgBus = Events.MsgBus;
	var sockets = [];

	new Vue({
		el: "#page",
		data:{
			route:window.location.hash.substr(1),

			ciphers:[],
			relays:[],
			accounts:[],

			systemMessages:[], //Messages that are system related and do not belong to a separate context
			context:null, //Room or Direct Message object

			socketChangeHackVal:0
		},
		computed:{
			accessKeyShortcut:function(){
				return this.isFirefox ? "Alt + Shift + " : "Alt + ";
			},

			isFirefox:function(){
				return navigator.userAgent.indexOf("Firefox") != -1;
			},

			isIE:function(){
				return window.navigator.userAgent.match(/(MSIE|Trident)/);
			},

			isEdge:function(){
				return navigator.userAgent.indexOf("Edge") != -1;
			},

			isCryptoSupported:function(){
				//At time of writing this code Edge does not support ECDH
				return Helpers.Crypto.isSupported(this.isEdge);
			},

			numConnected:function(){
				this.socketChangeHackVal;

				var count = 0;
				var socketsLen = sockets.length;
				for (var i = 0; i < socketsLen; i++){
					if (Helpers.socketIsConnected(sockets[i])){
						count++;
					}
				}
				return count;
			},

			totalConnections:function(){
				this.socketChangeHackVal;

				return sockets.length;
			},

			connectionSummary:function(){
				this.socketChangeHackVal;

				var summary = "";

				var connected = sockets.filter(Helpers.socketIsConnected);
				if (connected.length){
					summary += Resources.Strings.CONNECTED + "\n";
					summary += connected.reduce(function(summary, socket){
						return "  " + summary + socket.metadata.name + ' - "' + socket.url + '"\n';
					}, "");
					summary += "\n";
				}

				var disconnected = sockets.filter(function(socket){
					return !Helpers.socketIsConnected(socket);
				});
				if (disconnected.length){
					summary += Resources.Strings.DISCONNECTED + "\n";
					summary += disconnected.reduce(function(summary, socket){
						return "  " + summary + socket.metadata.name + ' - "' + socket.url + '"\n';
					}, "");
					summary += "\n";
				}

				return summary.trim();
			},

			//We don't want observers on the sockets so instead we use this hack value to indicate changes
			socketChangeHack:{
				get:function(){
					return this.socketChangeHackVal;
				},
				set:function(){
					this.socketChangeHackVal = new Date().getTime();
				}
			},

			contextStr:function(){
				console.log(this.context);
				if (this.context){
					console.log(OOP.isType(this.context, Models.Room));
				}
				if (this.context && OOP.isType(this.context, Models.Room)){
					return "room:" + this.context.name;
				}
				return null;
			}
		},
		mounted:function(){
			window.onhashchange = this.handler_hash_change;

			if (this.isCryptoSupported){
				Helpers.Crypto.initIV();
			}

			MsgBus.$on(MsgBus.JOINED_ROOM, this.handler_msgBus_joinedRoom);
			MsgBus.$on(MsgBus.SEND_MSG, this.handler_msgBus_sendMsg);
		},
		methods:{
			handler_hash_change:function(evt){
				this.route = window.location.hash.substr(1);
			},

			connect:function(relay){
				var socket = new WebSocket(relay.address);
				socket.metadata = new Models.SocketMetadata({
					name:relay.name,
					relay:relay
				});
				socket.onopen = this.handler_socket_open;
				socket.onclose = this.handler_socket_close;
				socket.onmessage = this.handler_socket_message;
				sockets.push(socket);
			},

			handler_socket_open:function(evt){
				console.log("page::handler_socket_open", evt);
				this.socketChangeHack=1;

				var socket = evt.srcElement;

				Helpers.Crypto.generateKeyAsym()
					.then(function(keyPair){
						socket.metadata.keyPair = keyPair;
						SocketHandlers.Send(sockets, Protocol.KEY, null, null, keyPair.publicKey);
					})
					.catch(Global.ErrorHandler.caught);
			},

			handler_socket_close:function(evt){
				console.log("page::handler_socket_close", evt);
				evt.target.onclose = null;
				this.socketChangeHack=1;
			},

			handler_socket_message:function(evt){
				//console.log("page::handler_socket_message", evt);

				var socket = evt.srcElement;

				var _this = this;
				SocketHandlers.OnMessage(evt, sockets)
					.then(function(data){
						console.log("page::handler_socket_message", data);

						if (socket.metadata.state != Models.SocketMetadata.STATE.KEY){
							var msg = Object.assign({}, data, {raw:evt.data});
							var to = msg.to || null;
							//Hard-coded for now until we have more than one room
							if (to && to.toLowerCase() == "room:public"){
								_this.context.messages.push(msg);
							} else {
								_this.systemMessages.push(msg);
							}
						}
					})
					.catch(Global.ErrorHandler.caught);
			},

			handler_msgBus_joinedRoom:function(data){
				if (!data){
					throw new Error(Resources.Strings.ERROR_NO_DATA);
				}
				var room = new Models.Room({
					name:data.name,
					relayName:data.relayName,
					members:data.members
				});
				//TODO: Account for room already existing
				Models.Room.rooms.push(room);

				this.context = room;
			},

			handler_msgBus_sendMsg:function(data){
				if (!data){
					throw new Error(Resources.Strings.ERROR_NO_DATA);
				}
				SocketHandlers.Send(sockets, data.protocol || Protocol.MSG, data.from, data.to, data.content);
			}
		},
		watch:{
			relays:{
				deep:true,
				handler:function(){
					if (!this.isCryptoSupported){
						return;
					}
					var relays = this.relays;
					var relaysLen = this.relays.length;
					for (var i = 0; i < relaysLen; i++){
						var relay = relays[i];
						var socket = findSocket(relay.name);
						if (relay.enabled && !socket){
							this.connect(relay);
						}
						if (!relay.enabled && socket){
							disconnect(socket);
						}
						this.socketChangeHack=1;
					}
				}
			}
		}
	});

	function disconnect(socket){
		socket.metadata = null;
		socket.onopen = null;
		socket.onmessage = null;
		socket.close();

		var index = sockets.indexOf(socket);
		if (index != -1){
			sockets.splice(index, 1);
		}
	}

	function findSocket(name){
		var socketsLen = sockets.length;
		for (var i = 0; i < socketsLen; i++){
			var socket = sockets[i];
			if (socket.metadata.name == name){
				return socket;
			}
		}
		return null;
	}
})();