(function(){
    OOP.namespace("Models.Relay",
    OOP.construct({

        instance:{
			enabled:true,
			name:"",
			address:"",
			passphrase:"",
			fromServer:false
        },

        simple:true //We don't want OOP to add _super and _interface to the class since we are saving this in localStorage
    }));
})();