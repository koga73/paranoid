(function(){
    OOP.namespace("Helpers",
    OOP.construct({

        static:{
			send:function(socket, str){
				socket.metadata.seqFromClient++;

				//Encrypt
				var iv = Helpers.Crypto.computeIV(socket.metadata.iv, Helpers.Crypto.IV_FIXED_CLIENT, socket.metadata.seqFromClient);
				var key = socket.metadata.sessionKey;
				//console.log("SEND:", socket.metadata.seqFromClient, buf2hex(iv));
				Helpers.Crypto.encrypt(iv, key, str)
					.then(function(ciphertext){
						//Send
						socket.send(ciphertext);
					});
					//.catch(ErrorHandler); //TODO: Error handling
			},

			clean:function(str){
				if (!str) {
					return "";
				}
				return str.replace(/&.+;|[^a-z0-9\s:\.\|_]/gi, '').toLowerCase().replace(/\s/g, '_');
			}
		}

    }));
})();

//TODO: REMOVE! - Testing only
function buf2hex(buffer) { // buffer is an ArrayBuffer
	return Array.prototype.map.call(new Uint8Array(buffer), function(x){
		return ('00' + x.toString(16)).slice(-2);
	}).join(' ');
}