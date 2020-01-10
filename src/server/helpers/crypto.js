const crypto = require("crypto");

const Strings = require.main.require("./resources/strings");

var _class = {
	ALGORITHM_SYMMETRIC:"AES-256-GCM",
	KEY_LEN:32, //Bytes (32 * 8 = 256-bit)
	TAG_LEN:16, //Bytes

	NAMED_CURVE:"secp521r1",

	ALGORITHM_HASH:"sha256",

	IV_LEN:12, //Bytes
	IV_FIXED_CLIENT:0,
	IV_FIXED_RELAY:0,

	encrypt:function(iv, key, plaintext){
		var cipher = crypto.createCipheriv(this.ALGORITHM_SYMMETRIC, key, iv);
		var ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
		var tag = cipher.getAuthTag();
		var encrypted = Buffer.concat([ciphertext, tag]).toString("base64");
		return Promise.resolve(encrypted);
	},

	decrypt:function(iv, key, ciphertext){
		var encrypted = Buffer.from(ciphertext, "base64");
		var decipher = crypto.createDecipheriv(this.ALGORITHM_SYMMETRIC, key, iv);
		decipher.setAuthTag(encrypted.slice(-this.TAG_LEN));
		var decrypted = decipher.update(encrypted.slice(0, encrypted.length - this.TAG_LEN), "binary", "utf8") + decipher.final("utf8");
		return Promise.resolve(decrypted);
	},

	generateKeyAsym:function(clientPublicKey){
		var ecdh = crypto.createECDH(this.NAMED_CURVE);
		ecdh.generateKeys();
		var sharedSecret = ecdh.computeSecret(clientPublicKey, "hex");
		return {
			publicKey:ecdh.getPublicKey("hex"),
			iv:sharedSecret.slice(0, this.IV_LEN),
			key:sharedSecret.slice(-this.KEY_LEN)
		};
	},

	//GCM MUST NOT REUSE IV WITH SAME KEY
	//Although GCM key length can be variable, 12-bit is recommended
	//NIST SP-800-38D: 8.2.1 Deterministic Construction
	//
	//startIV = random byte array of length 12
	//Fixed numerical value stays same per message
	//Incremental numerical value that changes per message (sequence number)
	computeIV:function(startIV, fixed, incremental){
		if (startIV.byteLength != 12){
			throw new Error(Strings.ERROR_INVALID_ARRAY_LENGTH);
		}
		var nums = [];
		startIV = new Uint8Array(startIV);
		for (var i = 0; i < startIV.byteLength; i += 4){
			var num = 0;
			num |= startIV[i] << 0;
			num |= startIV[i + 1] << 8;
			num |= startIV[i + 2] << 16;
			num |= startIV[i + 3] << 24;
			nums.push(num);
		}
		nums[0] ^= fixed;
		nums[1] ^= incremental;
		nums[2] ^= incremental;
		return new Uint32Array(nums).buffer;
	},

	//Hash the input and turn the first 4 bytes into a 32-bit number
	//This doesn't need to be super unique as this value will get XOR'd with randomBytes
	getIVFixed:function(phrase){
		var hash = new Uint8Array(crypto.createHash(this.ALGORITHM_HASH).update(phrase).digest().buffer);
		var fixedVal = 0;
		fixedVal |= hash[0] << 0;
		fixedVal |= hash[1] << 8;
		fixedVal |= hash[2] << 16;
		fixedVal |= hash[3] << 24;
		return Promise.resolve(fixedVal);
	}
};
//TODO: Make dynamic? Based on room?
_class.getIVFixed("client").then(function(code){
	_class.IV_FIXED_CLIENT = code;
});
_class.getIVFixed("relay").then(function(code){
	_class.IV_FIXED_RELAY = code;
});

module.exports = _class;