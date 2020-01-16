(function(){
    OOP.namespace("Events.Sync",
    OOP.construct({

        static:new Vue({
			data: {
				CIPHERS:"update:_ciphers",
				RELAYS:"update:_relays",
				ACCOUNTS:"update:_accounts"
			}
		})

    }));
})();