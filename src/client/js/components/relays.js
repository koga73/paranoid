(function(){
	Vue.component("relays", {
		data:function(){
			return {
				relayNew:new Models.Relay()
			};
		},
		props:[
			//Sync
			"_relays"
		],
		computed:{
			relays:{
                get:function(){
                    return this._relays;
                },
                set:function(value){
                    this.$emit(Events.Sync.RELAYS, value);
                }
			},
		},
		mounted:function(){
			//Load from window.ServerDefaults
			if (window.ServerDefaults && window.ServerDefaults.relays){
				var relays = window.ServerDefaults.relays;
				var relaysLen = relays.length;
				for (var i = 0; i < relaysLen; i++){
					var relay = relays[i];
					this.addRelay(new Models.Relay({
						enabled:relay.enabled,
						name:relay.name,
						address:relay.address,
						passphrase:relay.passphrase,
						fromServer:true
					}));
				}
			}
		},
		methods:{
			addRelay:function(newRelay){
				var newName = cleanName(newRelay.name);

				//Does name already exist?
				var relays = this.relays;
				var relaysLen = relays.length;
				for (var i = 0; i < relaysLen; i++){
					var name = cleanName(relays[i].name);
					if (newName == name){ //Already exists
						console.warn(Resources.Strings.EXISTS_RELAY.format(name));
						return false;
					}
				}

				this.relays.push(newRelay);

				return true;
			},

			removeRelay:function(relay, index){
				index = index || this.relays.indexOf(relay);
				this.relays.splice(index, 1);
			},

			handler_relay_remove:function(evt, relay, index){
				evt.preventDefault();

				this.removeRelay(relay, index);

				return false;
			},

			handler_relay_export:function(evt){
				evt.preventDefault();

				console.log("relays::handler_relay_export");

				return false;
			},

			handler_relay_add:function(evt){
				evt.preventDefault();

				//Validate form
                var form = this.$refs["frmRelays"];
                if (!form.checkValidity()) {
                    try {
                        form.reportValidity();
                    } catch(error) {
                        //IE11 doesn't support
                    }
                    return false;
				}

				if (this.addRelay(this.relayNew)){
					this.relayNew = new Models.Relay();
				}

				return false;
			},

			handler_relay_import:function(evt){
				evt.preventDefault();

				console.log("relays::handler_relay_import");

				return false;
			},

			handler_relays_export:function(){
				console.log("relays::handler_relays_export");
			},

			handler_relays_import:function(){
				console.log("relays::handler_relays_import");
			}
		}
	});

	function cleanName(name){
		return Helpers.clean(name);
	}
})();