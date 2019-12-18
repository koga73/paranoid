(function(){
    OOP.namespace("Models.Account",
    OOP.construct({

        instance:{
			username:"",
			publicKey:"",
			privateKey:"",
			showPrivate:false
        },

        simple:true //We don't want OOP to add _super and _interface to the class since we are saving this in localStorage
    }));
})();