const Settings = require.main.require("./global/settings");
const State = require.main.require("./global/state");
const CryptoHelper = require.main.require("./helpers/crypto");

module.exports = async function(socket, data, metadata, encrypt){
	metadata = metadata || State.getSocketMetadata(socket.connectionId);
	metadata.seqFromRelay++;
	encrypt = encrypt !== false;

	if (encrypt){
		try {
			var iv = Buffer.from(CryptoHelper.computeIV(metadata.iv, CryptoHelper.IV_FIXED_RELAY, metadata.seqFromRelay));
			/*if (Settings.DEBUG){
				console.log("SEND:", metadata.seqFromRelay, iv);
			}*/
			data = await CryptoHelper.encrypt(iv, metadata.key, data);
		} catch (err){
			if (Settings.DEBUG){
				throw err;
			} else {
				throw new Error(Resources.Strings.ERROR_ENCRYPT);
			}
		}
	}

	socket.send(data);
};