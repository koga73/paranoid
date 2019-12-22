(function(){
	Vue.component("chat", {
		data:function(){
			return {
				messages:[],
				message:"",
				rooms:[],
				room:null,
				users:[],
				username:"anonymous"
			};
		},
		mounted:function(){
			this.rooms.push({name:"public"});
			this.room = this.rooms[0];
			for (var i = 0; i < 100; i++){
				this.rooms.push({name:"test-" + i});
			}
		},
		methods:{
			handler_message_send:function(evt){
				evt.preventDefault();

				//Validate form
                var form = this.$refs["frmChat"];
                if (!form.checkValidity()) {
                    try {
                        form.reportValidity();
                    } catch(error) {
                        //IE11 doesn't support
                    }
                    return false;
				}

				//TODO
				this.message = "";

				return false;
			},

			handler_room_click:function(room){
				this.room = room;
			},

			handler_newRoom_click:function(){
				console.log("chat::handler_newRoom_click");
			},

			handler_newDirect_click:function(){
				console.log("chat::handler_newDirect_click");
			}
		}
	});
})();