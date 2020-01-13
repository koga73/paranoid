(function(){
	OOP.namespace("SocketHandlers.OnMessage",
		function(evt, sockets, fromUsername, relayPassphrase){
			var socket = evt.srcElement;
			var metadata = socket.metadata;
			metadata.seqFromRelay++;
			var seqNum = metadata.seqFromRelay;

			var promise;
			if (metadata.state != Models.SocketMetadata.STATE.KEY){
				//Decrypt
				var iv = Helpers.Crypto.computeIV(metadata.iv, Helpers.Crypto.IV_FIXED_RELAY, seqNum);
				//console.log("RECEIVE:", seqNum, buf2hex(iv));
				var key = metadata.key;
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
							caseKey(socket, metadata, data, relayPassphrase);
							break;

						case Protocol.WELCOME.code:
							caseWelcome(socket, metadata, data, sockets, fromUsername);
							break;

						case Protocol.ROOM.code:
							ret.context = caseRoom(socket, metadata, data);
							break;
					}

					return Promise.resolve(Object.assign(ret, {
						msg:data
					}));
				})
				.catch(Global.ErrorHandler.caught);
		}
	);

	function caseKey(socket, metadata, data){
		var publicKey = data.content;
		if (!Resources.Regex.ECDH_KEY.test(publicKey)){
			throw new Error(Resources.Strings.ERROR_INVALID_KEY);
		}

		Helpers.Crypto.deriveSecretKey(metadata.keyPair.privateKey, publicKey)
			.then(function(ivKey){
				delete metadata.keyPair;
				metadata.iv = ivKey.iv;

				var key = new Uint8Array(ivKey.key);
				var hasRelayPassphrase = metadata.relay && metadata.relay.passphrase && metadata.relay.passphrase.length;
				var promise = (hasRelayPassphrase) ? Helpers.Crypto.hash(metadata.relay.passphrase) : Promise.resolve(null);
				promise.then(function(hash){
					if (hasRelayPassphrase){
						//XOR key with passphrase hash
						var keyLen = key.byteLength;
						for (var i = 0; i < keyLen; i++){
							key[i] ^= hash[i];
						}
					}
					//console.log("IV:", Helpers.Crypto.buf2hex(ivKey.iv, " "));
					//console.log("KEY:", Helpers.Crypto.buf2hex(ivKey.key, " "));

					Helpers.Crypto.loadKeySymmetric(key)
						.then(function(loadedKey){
							metadata.key = loadedKey;
							metadata.state = Models.SocketMetadata.STATE.ESTABLISHED;

							SocketHandlers.Send([socket], Protocol.READY);
						});
				});
			})
			.catch(Global.ErrorHandler.caught);
	}

	function caseWelcome(socket, metadata, data, sockets, fromUsername){
		SocketHandlers.Send(sockets, Protocol.JOIN, fromUsername, data.room);
	}

	function caseRoom(socket, metadata, data){
		Models.Room.rooms.push(new Models.Room({
			name:data.name,
			relayName:metadata.name,
			members:data.members
		}));
		return "room:" + data.name; //Context
	}
})();