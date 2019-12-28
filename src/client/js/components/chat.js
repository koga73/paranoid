(function(){
	var sockets = [];

	Vue.component("chat", {
		data:function(){
			return {
				context:null,

				messages:[],
				message:"",

				rooms:[],
				users:[],

				username:"",
				account:null,

				socketChangeHackVal:0
			};
		},
		props:[
			//Non-sync
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
					if (isConnected(sockets[i])){
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

				var connected = sockets.filter(isConnected);
				if (connected.length){
					summary += Resources.Strings.CONNECTED + "\n";
					summary += connected.reduce(function(summary, socket){
						return "  " + summary + socket.name + ' - "' + socket.url + '"\n';
					}, "");
					summary += "\n";
				}

				var disconnected = sockets.filter(function(socket){
					return !isConnected(socket);
				});
				if (disconnected.length){
					summary += Resources.Strings.DISCONNECTED + "\n";
					summary += disconnected.reduce(function(summary, socket){
						return "  " + summary + socket.name + ' - "' + socket.url + '"\n';
					}, "");
					summary += "\n";
				}

				return summary.trim();
			},

			//We don't want observers on the sockets themselves so instead we use this hack value to indicate changes
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
			}
		},
		mounted:function(){
			this.account = this.accounts[0];
			this.username = this.account.username;
		},
		methods:{
			connect:function(relay){
				var socket = new WebSocket(relay.address);
				socket.name = relay.name;
				socket.onopen = this.handler_socket_open;
				socket.onclose = this.handler_socket_close;
				socket.onmessage = this.handler_socket_message;
				sockets.push(socket);
			},

			handler_socket_open:function(evt){
				console.log("chat::handler_socket_open", evt);
				this.socketChangeHack=1;
			},

			handler_socket_close:function(evt){
				console.log("chat::handler_socket_close", evt);
				evt.target.onclose = null;
				this.socketChangeHack=1;
			},

			handler_socket_message:function(evt){
				console.log("chat::handler_socket_message", evt);

				var data = JSON.parse(evt.data);
				switch (data.code){
					case Protocol.WELCOME.code:
						if (data.room){
							this.rooms.push({
								name:data.room
							});
							this.context = "room:" + data.room;
						}
						break;
				}

				this.messages.push(data);
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

				send(this.username, this.context, this.message);
				this.message = "";

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
			}
		},
		watch:{
			relays:{
				deep:true,
				handler:function(){
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
			if (socket.name == name){
				return socket;
			}
		}
		return null;
	}

	function isConnected(socket){
		return socket && socket.readyState == WebSocket.OPEN;
	}

	function send(from, to, content){
		var data = Protocol.create(Protocol.MSG, {
			from:from, //This is verified on the relay
			to:to,
			content:content
		});

		var socketsLen = sockets.length;
		for (var i = 0; i < socketsLen; i++){
			var socket = sockets[i];
			if (isConnected(socket)){
				socket.send(data);
			}
		}
	}
})();