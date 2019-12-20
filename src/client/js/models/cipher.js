(function(){
    OOP.namespace("Models.Cipher",
    OOP.construct({

		static:{
			TYPES:{
				SYMMETRIC:"asymmetric",
				ASYMMETRIC:"symmetric",
				HASH:"hash" //Yes I know a hash is not a crypto cipher but it fits well here
			}
		},

        instance:{
			name:"",
			source:"",
			type:"",
			fromServer:false
        },

        simple:true //We don't want OOP to add _super and _interface to the class since we are saving this in localStorage
    }));
})();