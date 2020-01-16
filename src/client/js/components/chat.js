(function(){
	var MsgBus = Events.MsgBus;

	Vue.component("chat", {
		data:function(){
			return {
				message:"",

				users:[],

				username:"",
				account:null,

				roomChangeHackVal:0
			};
		},
		props:[
			//Non-sync
			"isCryptoSupported",
			"accounts",
			"context",
			"systemMessages"
		],
		computed:{
			//We don't want observers on the rooms so instead we use this hack value to indicate changes
			roomChangeHack:{
				get:function(){
					return this.roomChangeHackVal;
				},
				set:function(){
					this.roomChangeHackVal = new Date().getTime();
				}
			},

			rooms:function(){
				this.roomChangeHack;

				//Filter duplicates
				return Models.Room.rooms.reduce(function(roomNames, room){
					if (roomNames.indexOf(room.name) == -1){
						roomNames.push({
							name:room.name
							//TODO: Member count?
						});
					}
					return roomNames;
				}, []);
			},

			messages:function(){
				var allMsgs = this.systemMessages;
				if (this.context){
					allMsgs = allMsgs.concat(this.context.messages);
				}
				//This is somewhat expensive :\
				allMsgs.sort(function(a, b){
					return a.time - b.time;
				});

				//If we are scrolled to bottom, add message then scroll again
				var scrolledBottom = this.isMessagesScrolledBottom();
				if (scrolledBottom){
					this.$nextTick(function(){
						this.messagesScrollToBottom();
					});
				}

				return allMsgs;
			}
		},
		mounted:function(){
			this.account = this.accounts[0];
			this.username = this.account.username;

			var txtMessage = this.$refs["txtMessage"];
			txtMessage.focus();
			txtMessage.addEventListener("keydown", this.handler_message_keydown);

			MsgBus.$on(MsgBus.JOINED_ROOM, this.handler_msgBus_joinedRoom);
		},
		methods:{
			handler_options_click:function(){
				console.log("chat::handler_options_click");
			},

			handler_message_keydown:function(evt){
				switch (evt.keyCode){
					case 13:
						if (!evt.shiftKey){
							this.handler_message_send(evt);
						}
						break;
				}
			},

			handler_message_send:function(evt){
				evt.preventDefault();

				//TODO: Show message?
				if (!this.context){
					return false;
				}

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

				//Send message!
				MsgBus.$emit(MsgBus.SEND_MSG, {
					from:this.username,
					to:"room:" + this.context.name,
					content:this.message
				});

				//Reset form
				this.message = "";
				this.$refs["txtMessage"].focus();

				return false;
			},

			handler_room_click:function(room){
				this.context = "room:" + room.name;
			},

			handler_newRoom_click:function(){
				console.log("chat::handler_newRoom_click");
			},

			handler_newDirect_click:function(){
				console.log("chat::handler_newDirect_click");
			},

			handler_username_change:function(){
				console.log("chat::handler_username_change");
			},

			isRoomActive:function(room){
				if (!this.context){
					return false;
				}
				return this.context.name.toLowerCase() == (room.name).toLowerCase();
			},

			isMessagesScrolledBottom:function(){
				var messagesScroll = this.$refs["messages-scroll"];
				if (!messagesScroll){
					return true;
				}
				return messagesScroll.scrollTop - 2 == messagesScroll.scrollHeight - messagesScroll.offsetHeight; //2 for border
			},

			messagesScrollToBottom:function(){
				var messagesScroll = this.$refs["messages-scroll"];
				if (!messagesScroll){
					return;
				}
				messagesScroll.scrollTop = messagesScroll.scrollHeight - messagesScroll.offsetHeight + 2; //2 for border
			},

			handler_msgBus_joinedRoom:function(){
				this.roomChangeHack=1;
			}
		}
	});
})();