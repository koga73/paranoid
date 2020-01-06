(function(){
	OOP.namespace("SocketHandlers.OnMessage",
		function(evt, sockets, fromUsername){
			var socket = evt.srcElement;
			socket.metadata.seqFromRelay++;
			var seqNum = socket.metadata.seqFromRelay;

			var promise;
			if (seqNum - 1){ //First message is unencrypted... for now
				//Decrypt
				var iv = Helpers.Crypto.computeIV(socket.metadata.iv, Helpers.Crypto.IV_FIXED_RELAY, seqNum);
				//console.log("RECEIVE:", seqNum, buf2hex(iv));
				var key = socket.metadata.sessionKey;
				promise = Helpers.Crypto.decrypt(iv, key, evt.data);
			} else {
				promise = Promise.resolve(evt.data);
			}
			return promise
				.then(function(msg){
					var ret = {};

					var data = JSON.parse(msg);
					switch (data.code){

						case Protocol.WELCOME.code:
							socket.metadata.iv = Helpers.Crypto.base64ToArrayBuffer(data.iv);
							Helpers.Crypto.loadKeySymmetric(data.key)
								.then(function(secretKey){
									socket.metadata.sessionKey = secretKey;
									SocketHandlers.Send(sockets, Protocol.JOIN, fromUsername, data.room);
								});
							break;

						case Protocol.ROOM.code:
							Models.Room.rooms.push(new Models.Room({
								name:data.name,
								relayName:socket.metadata.name,
								members:data.members
							}));
							ret.context = "room:" + data.name;
							break;
					}

					return Promise.resolve(Object.assign(ret, {
						msg:data
					}));
				})
				.catch(Global.ErrorHandler.caught);
		}
	);
})();