(function(){
    OOP.namespace("Events.MsgBus",
    OOP.construct({

        static:new Vue({
			data: {
				JOINED_ROOM:"joined_room",
				SEND_MSG:"send_msg"
			}
		})

    }));
})();