const crypto = require("crypto");

const Strings = require.main.require("./resources/strings");

var static = {
	TAG_LEN:16, //Bytes

	IV_FIXED_CLIENT:0,
	IV_FIXED_RELAY:0,

	encrypt:function(iv, key, plaintext){
		var cipher = crypto.createCipheriv("AES-256-GCM", key, iv);
		var ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
		var tag = cipher.getAuthTag();
		var encrypted = Buffer.concat([ciphertext, tag]).toString("base64");
		return Promise.resolve(encrypted);
	},

	decrypt:function(iv, key, ciphertext){
		var encrypted = Buffer.from(ciphertext, "base64");
		var decipher = crypto.createDecipheriv("AES-256-GCM", key, iv);
		decipher.setAuthTag(encrypted.slice(-this.TAG_LEN));
		var decrypted = decipher.update(encrypted.slice(0, encrypted.length - this.TAG_LEN), "binary", "utf8") + decipher.final("utf8");
		return Promise.resolve(decrypted);
	},

	//startIV = random byte array of length 12
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
		var hash = new Uint8Array(crypto.createHash("sha256").update(phrase).digest().buffer);
		var fixedVal = 0;
		fixedVal |= hash[0] << 0;
		fixedVal |= hash[1] << 8;
		fixedVal |= hash[2] << 16;
		fixedVal |= hash[3] << 24;
		return Promise.resolve(fixedVal);
	}
};
static.getIVFixed("client").then(function(code){
	static.IV_FIXED_CLIENT = code;
});
static.getIVFixed("relay").then(function(code){
	static.IV_FIXED_RELAY = code;
});

module.exports = static;