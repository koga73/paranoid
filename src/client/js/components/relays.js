(function(){
	Vue.component("relays", {
		data:function(){
			return {
				relays:[],
				relayNew:new Models.Relay()
			};
		},
		methods:{
			handler_relay_remove:function(evt, relay, index){
				evt.preventDefault();

				this.relays.splice(index, 1);

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

				this.relays.push(this.relayNew);
				this.relayNew = new Models.Relay();

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
})();