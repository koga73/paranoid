(function(){
	OOP.namespace("SocketHandlers.Send",
		function(sockets, protocol, from, to, content){
			from = from || null;
			to = to || null;
			content = content || null;

			var data = Protocol.create(protocol, {
				from:from, //This is verified on the relay
				to:to,
				content:content
			});

			var socketsLen = sockets.length;
			for (var i = 0; i < socketsLen; i++){
				var socket = sockets[i];
				if (Helpers.socketIsConnected(socket)){
					send(socket, data);
				}
			}
		}
	);

	function send(socket, msg){
		socket.metadata.seqFromClient++;

		//Encrypt
		var iv = Helpers.Crypto.computeIV(socket.metadata.iv, Helpers.Crypto.IV_FIXED_CLIENT, socket.metadata.seqFromClient);
		var key = socket.metadata.sessionKey;
		//console.log("SEND:", socket.metadata.seqFromClient, buf2hex(iv));
		Helpers.Crypto.encrypt(iv, key, msg)
			.then(function(ciphertext){
				//Send
				socket.send(ciphertext);
			})
			.catch(Global.ErrorHandler.caught);
	}
})();