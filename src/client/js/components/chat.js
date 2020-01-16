(function(){
	var sockets = [];

	Vue.component("chat", {
		data:function(){
			return {
				context:null,

				messages:[],
				message:"",

				users:[],

				username:"",
				account:null,

				socketChangeHackVal:0,
				roomChangeHackVal:0
			};
		},
		props:[
			//Non-sync
			"isCryptoSupported",
			"ciphers",
			"relays",
			"accounts",
			//Sync
			"_numConnected",
			"_totalConnections",
			"_connectionSummary"
		],
		computed:{
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
					this.$emit(Events.Sync.NUM_CONNECTED, this.numConnected);
					this.$emit(Events.Sync.TOTAL_CONNECTIONS, this.totalConnections);
					this.$emit(Events.Sync.CONNECTION_SUMMARY, this.connectionSummary);
				}
			},

			contextName:function(){
				if (!this.context){
					return null;
				}
				return this.context.split(':')[1];
			},

			//We don't want observers on the rooms so instead we use this hack value to indicate changes
			roomChangeHack:{
				get:function(){
					return this.roomChangeHackVal;
				},
				set:function(){
					this.roomChangeHackVal = new Date().getTime();
				}
			},

			rooms:function(){
				this.roomChangeHack;

				//Filter duplicates
				return Models.Room.rooms.reduce(function(roomNames, room){
					if (roomNames.indexOf(room.name) == -1){
						roomNames.push({
							name:room.name
							//TODO: Member count
						});
					}
					return roomNames;
				}, []);
			}
		},
		mounted:function(){
			this.account = this.accounts[0];
			this.username = this.account.username;

			var txtMessage = this.$refs["txtMessage"];
			txtMessage.focus();
			txtMessage.addEventListener("keydown", this.handler_message_keydown);
		},
		methods:{
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
				console.log("chat::handler_socket_open", evt);
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
				console.log("chat::handler_socket_close", evt);
				evt.target.onclose = null;
				this.socketChangeHack=1;
			},

			handler_socket_message:function(evt){
				console.log("chat::handler_socket_message", evt);

				var socket = evt.srcElement;

				var _this = this;
				SocketHandlers.OnMessage(evt, sockets, this.username)
					.then(function(data){
						var context = data.context || null;
						if (context){
							_this.context = context;
							_this.roomChangeHack=1;
						}
						if (socket.metadata.state != Models.SocketMetadata.STATE.KEY){
							var scrolledBottom = _this.isMessagesScrolledBottom();

							_this.messages.push(Object.assign({}, data.msg, {
								raw:evt.data
							}));

							//If we are scrolled to bottom, add message then scroll again
							if (scrolledBottom){
								_this.$nextTick(function(){
									_this.messagesScrollToBottom();
								});
							}
						}
					})
					.catch(Global.ErrorHandler.caught);
			},

			handler_options_click:function(){
				console.log("chat::handler_options_click");
			},

			handler_message_keydown:function(evt){
				switch (evt.keyCode){
					case 13:
						if (!evt.shiftKey){
							this.handler_message_send(evt);
						}
						break;
				}
			},

			handler_message_send:function(evt){
				evt.preventDefault();

				//TODO: Show message?
				if (!this.context){
					return false;
				}

				//Validate form
                var form = this.$refs["frmChat"];
                if (!form.checkValidity()) {
                    try {
                        form.reportValidity();
                    } catch(error) {
                        //IE11 doesn't support
                    }
                    return false;
				}

				SocketHandlers.Send(sockets, Protocol.MSG, this.username, this.context, this.message);
				this.message = "";
				this.$refs["txtMessage"].focus();

				return false;
			},

			handler_room_click:function(room){
				this.context = "room:" + room.name;
			},

			handler_newRoom_click:function(){
				console.log("chat::handler_newRoom_click");
			},

			handler_newDirect_click:function(){
				console.log("chat::handler_newDirect_click");
			},

			handler_username_change:function(){
				console.log("chat::handler_username_change");
			},

			isRoomActive:function(room){
				if (!this.context){
					return false;
				}
				return this.context.toLowerCase() == ("room:" + room.name).toLowerCase();
			},

			isMessagesScrolledBottom:function(){
				var messagesScroll = this.$refs["messages-scroll"];
				return messagesScroll.scrollTop - 2 == messagesScroll.scrollHeight - messagesScroll.offsetHeight; //2 for border
			},

			messagesScrollToBottom:function(){
				var messagesScroll = this.$refs["messages-scroll"];
				messagesScroll.scrollTop = messagesScroll.scrollHeight - messagesScroll.offsetHeight + 2; //2 for border
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