(function(){
	var MsgBus = Events.MsgBus;

	OOP.namespace("SocketHandlers.OnMessage",
		function(evt){
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
					var data = JSON.parse(msg);
					switch (data.code){

						case Protocol.KEY.code:
							caseKey(socket, metadata, data);
							break;

						case Protocol.WELCOME.code:
							MsgBus.$emit(MsgBus.SEND_MSG, {
								protocol:Protocol.JOIN,
								to:data.room
							});
							break;

						case Protocol.ROOM.code:
							MsgBus.$emit(MsgBus.JOINED_ROOM, Object.assign({}, data, {
								relayName:metadata.relay.name
							}));
							break;
					}

					return Promise.resolve(data);
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
				var promise = (hasRelayPassphrase) ? Helpers.Crypto.hash(metadata.relay.passphrase, ivKey.extra) : Promise.resolve(null);
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
})();