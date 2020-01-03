const CryptoHelper = require.main.require("../shared/js/helpers/crypto");

module.exports = function(socket, data, metadata, encrypt){
	metadata = metadata || State.getSocketMetadata(socket.connectionId);
	metadata.seqFromRelay++;
	encrypt = encrypt !== false;

	if (encrypt){
		//TODO
		//console.log("IV:", Buffer.from(CryptoHelper.computeIV(metadata.iv, CryptoHelper.IV_FIXED_RELAY, metadata.seqFromRelay)).toString("hex"));
	}

	socket.send(data);
};