(function(){
    OOP.namespace("Helpers",
    OOP.construct({

        static:{
			socketIsConnected:function(socket){
				return socket && socket.readyState == WebSocket.OPEN;
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