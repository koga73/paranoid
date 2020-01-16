(function(){
    OOP.namespace("Events.Sync",
    OOP.construct({

        static:new Vue({
			data: {
				PREFERENCES:"update:_preferences",
				RELAYS:"update:_relays",
				ACCOUNTS:"update:_accounts"
			}
		})

    }));
})();