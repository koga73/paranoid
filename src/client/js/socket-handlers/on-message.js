(function(){
	OOP.namespace("SocketHandlers.OnMessage",
		function(evt, sockets, fromUsername){
			var socket = evt.srcElement;
			socket.metadata.seqFromRelay++;
			var seqNum = socket.metadata.seqFromRelay;

			var promise;
			if (socket.metadata.state != Models.SocketMetadata.STATE.KEY){
				//Decrypt
				var iv = Helpers.Crypto.computeIV(socket.metadata.iv, Helpers.Crypto.IV_FIXED_RELAY, seqNum);
				//console.log("RECEIVE:", seqNum, buf2hex(iv));
				var key = socket.metadata.key;
				promise = Helpers.Crypto.decrypt(iv, key, evt.data);
			} else {
				promise = Promise.resolve(evt.data);
			}
			return promise
				.then(function(msg){
					var ret = {};

					var data = JSON.parse(msg);
					switch (data.code){

						case Protocol.KEY.code:
							var publicKey = data.content;
							if (!Helpers.RegexPatterns.ECDH_KEY.test(publicKey)){
								throw new Error(Resources.Strings.ERROR_INVALID_KEY);
							}

							Helpers.Crypto.deriveSecretKey(socket.metadata.keyPair.privateKey, publicKey)
								.then(function(ivKey){
									//console.log("IV:", Helpers.Crypto.buf2hex(ivKey.iv, " "));
									//console.log("KEY:", Helpers.Crypto.buf2hex(ivKey.key, " "));

									delete socket.metadata.keyPair;
									socket.metadata.iv = ivKey.iv;
									Helpers.Crypto.loadKeySymmetric(ivKey.key)
										.then(function(loadedKey){
											socket.metadata.key = loadedKey;
											socket.metadata.state = Models.SocketMetadata.STATE.ESTABLISHED;

											SocketHandlers.Send(sockets, Protocol.READY);
										});
								})
								.catch(Global.ErrorHandler.caught);
							break;

						case Protocol.WELCOME.code:
							SocketHandlers.Send(sockets, Protocol.JOIN, fromUsername, data.room);
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