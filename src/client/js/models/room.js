(function(){
    OOP.namespace("Models.Room",
    OOP.construct({

        instance:{
			name:"",
			relayName:"",
			iv:"",
			memberCount:0
		},

		static:{
			rooms:[],

			get:function(name, relayName){
				relayName = relayName || null;

				var namedRooms = this.rooms.filter(function(room){
					return room.name == name;
				});
				if (!relayName){
					return (namedRooms.length) ? namedRooms : null;
				} else {
					var relayNamedRooms = namedRooms.filter(function(room){
						return room.relayName == relayName;
					});
					return (relayNamedRooms.length) ? namedRooms : null;
				}
			}
		},

        simple:true //We don't want OOP to add _super and _interface to the class since we are saving this in localStorage
    }));
})();