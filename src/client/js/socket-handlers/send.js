(function(){
	OOP.namespace("SocketHandlers.Send",
		function(sockets, protocol, from, to, content){
			from = from || null;
			to = to || null;
			content = content || null;

			var obj = {};
			if (from){
				obj.from = from;
			}
			if (to){
				obj.to = to;
			}
			if (content){
				obj.content = content;
			}
			var data = Protocol.create(protocol, obj);

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

		if (socket.metadata.state != Models.SocketMetadata.STATE.KEY){
			//Encrypt
			var iv = Helpers.Crypto.computeIV(socket.metadata.iv, Helpers.Crypto.IV_FIXED_CLIENT, socket.metadata.seqFromClient);
			var key = socket.metadata.key;
			//console.log("SEND:", socket.metadata.seqFromClient, buf2hex(iv));
			Helpers.Crypto.encrypt(iv, key, msg)
				.then(function(ciphertext){
					//Send
					socket.send(ciphertext);
				})
				.catch(Global.ErrorHandler.caught);
		} else {
			socket.send(msg);
		}
	}
})();