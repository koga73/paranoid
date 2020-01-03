(function(){
    OOP.namespace("Models.SocketMetadata",
    OOP.construct({

        instance:{
			name:"",
			iv:null,
			sessionKey:null,
			seqFromRelay:0,
			seqFromClient:0
        },

        simple:true //We don't want OOP to add _super and _interface to the class since we are saving this in localStorage
    }));
})();