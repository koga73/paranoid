(function(){
    OOP.namespace("Events.Sync",
    OOP.construct({

        static:new Vue({
			data: {
				CIPHERS:"update:_ciphers",
				RELAYS:"update:_relays",
				ACCOUNTS:"update:_accounts",
				NUM_CONNECTED:"update:_numConnected",
				TOTAL_CONNECTIONS:"update:_totalConnections",
				CONNECTION_SUMMARY:"update:_connectionSummary"
			}
		})

    }));
})();