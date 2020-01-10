(function(){
	var STATE = {
		KEY:"key",
		ESTABLISHED:"established"
	};

    OOP.namespace("Models.SocketMetadata",
    OOP.construct({

        instance:{
			name:"",
			iv:null,
			key:null,
			seqFromRelay:0,
			seqFromClient:0,
			state:STATE.KEY
		},

		static:{
			STATE:STATE
		},

        simple:true //We don't want OOP to add _super and _interface to the class since we are saving this in localStorage
    }));
})();