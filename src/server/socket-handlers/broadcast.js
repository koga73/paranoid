const Send = require.main.require("./socket-handlers/send");
const Settings = require.main.require("./global/settings");
const Log = require.main.require("./utils/log");
const Protocol = require.main.require("../shared/js/models/protocol");

module.exports = function(room, fromSocket, fromSocketMetadata, data){
	var toRoom = `room:${room.name}`;
	if (Settings.consoleContext == toRoom.toLowerCase()){
		if (data.from){
			console.log(`${Log.COLORS.FG.BLUE}${data.from}: ${data.content}${Log.COLORS.SYSTEM.RESET}`);
		} else {
			console.log(`${Log.COLORS.FG.GREEN}${data.content}${Log.COLORS.SYSTEM.RESET}`);
		}
	}

	var dataObj = null;
	if (fromSocket){
		dataObj = Protocol.create(Protocol.MSG, Object.assign({to:toRoom}, data));
	} else {
		dataObj = Protocol.create(Protocol.SYS_MSG, Object.assign({to:toRoom}, data));
	}
	room.members.forEach((socket) => {
		if (fromSocket && fromSocket.connectionId == socket.connectionId){
			Send(socket, Protocol.create(Protocol.MSG, Object.assign({self:true}, data)), fromSocketMetadata);
		} else {
			Send(socket, dataObj);
		}
	});
};