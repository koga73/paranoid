(function(){
	Vue.component("relays", {
		data:function(){
			return {
				relays:[],
				relayNew:new Models.Relay()
			};
		},
		methods:{
			handler_relay_remove:function(relay, index){
				this.relays.splice(index, 1);
			},

			handler_relay_export:function(){
				console.log("relays::handler_relay_export");
			},

			handler_relay_add:function(){
				this.relays.push(this.relayNew);
				this.relayNew = new Models.Relay();
			},

			handler_relay_import:function(){
				console.log("relays::handler_relay_import");
			},

			handler_relays_export:function(){
				console.log("relays::handler_relays_export");
			},

			handler_relays_import:function(){
				console.log("relays::handler_relays_import");
			},

			handler_relays_save:function(){
				console.log("relays::handler_relays_save");
			}
		}
	});
})();