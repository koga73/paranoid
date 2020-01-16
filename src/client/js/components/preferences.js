(function(){
	Vue.component("preferences", {
		data:function(){
			return {
				messages:{
					showTimes:false,
					disableDecryptAnimation:false
				}
			};
		},
		props:[
			//Sync
			"_preferences"
		],
		computed:{
			preferences:{
                get:function(){
                    return this._preferences;
                },
                set:function(value){
                    this.$emit(Events.Sync.PREFERENCES, value);
                }
            }
		},
		mounted:function(){
			this.preferences = {
				messages:this.messages
			};

			//Load from window.ServerDefaults
			if (window.ServerDefaults && window.ServerDefaults.preferences && window.ServerDefaults.preferences.messages){
				this.messages = Object.assign(this.messages, window.ServerDefaults.preferences.messages);
			}
		},
		methods:{

		}
	});
})();