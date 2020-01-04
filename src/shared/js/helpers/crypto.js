(function(){
    var creationContext = function(instance){
		typeof OOP !== typeof undefined ? OOP.namespace("Helpers.Crypto", instance) : module.exports = instance; //For client + server compatibility
	};
	var Strings = typeof Resources !== typeof undefined ? Resources.Strings : require.main.require("./resources/strings");
	var cryp = typeof crypto !== typeof undefined ? crypto : require("crypto");

	var obj = {
		TAG_LEN:16, //Bytes

		IV_FIXED_CLIENT:null,
		IV_FIXED_RELAY:null,

		//Grabbed from: https://stackoverflow.com/a/21797381/3610169
		base64ToArrayBuffer:function(base64){
			var binary_string = atob(base64);
			var len = binary_string.length;
			var bytes = new Uint8Array(len);
			for (var i = 0; i < len; i++) {
				bytes[i] = binary_string.charCodeAt(i);
			}
			return bytes.buffer;
		},

		//Grabbed from: https://stackoverflow.com/a/42334410/3610169
		ArrayBufferToBase64:function(arrayBuffer){
			return btoa(
				new Uint8Array(arrayBuffer).reduce(function(data, byte){
					return data + String.fromCharCode(byte);
				}, "")
			);
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

		encrypt:function(iv, key, plaintext){
			var _this = this;
			return new Promise(function(resolve, reject){
				if (typeof cryp.subtle !== typeof undefined){
					cryp.subtle.encrypt({
						name:"AES-GCM",
						iv:iv
					}, key, new TextEncoder().encode(plaintext))
						.then(function(ciphertext){
							resolve('"' + _this.ArrayBufferToBase64(ciphertext) + '"');
						})
						.catch(reject);
				} else {
					var cipher = cryp.createCipheriv("AES-256-GCM", key, iv);
					var ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
					var tag = cipher.getAuthTag();
					var encrypted = Buffer.concat([ciphertext, tag]).toString("base64");
					resolve(encrypted);
				}
			});
		},

		decrypt:function(iv, key, ciphertext){
			var _this = this;
			return new Promise(function(resolve, reject){
				if (typeof cryp.subtle !== typeof undefined){
					cryp.subtle.decrypt({
						name:"AES-GCM",
						iv:iv
					}, key, _this.base64ToArrayBuffer(ciphertext))
						.then(function(plaintext){
							resolve(new TextDecoder().decode(plaintext));
						})
						.catch(reject);
				} else {
					var encrypted = Buffer.from(ciphertext, "base64");
					var decipher = cryp.createDecipheriv("AES-256-GCM", key, iv);
					decipher.setAuthTag(encrypted.slice(-_this.TAG_LEN));
					var decrypted = decipher.update(encrypted.slice(0, encrypted.length - _this.TAG_LEN), "binary", "utf8") + decipher.final("utf8");
					resolve(decrypted);
				}
			});
		}
	};
	getIVFixed("client").then(function(hash){
		obj.IV_FIXED_CLIENT = hash;
	});
	getIVFixed("relay").then(function(hash){
		obj.IV_FIXED_RELAY = hash;
	});
	creationContext(obj);

	//Hash the input and turn the first 4 bytes into a 32-bit number
	//This doesn't need to be super unique as this value will get XOR'd with randomBytes
	function getIVFixed(phrase){
		var hashPromise = null;
		if (typeof cryp.subtle !== typeof undefined){
			hashPromise = cryp.subtle.digest("SHA-256", new TextEncoder().encode(phrase));
		} else {
			hashPromise = Promise.resolve(cryp.createHash("sha256").update(phrase).digest().buffer);
		}
		return hashPromise.then(function(hash){
			hash = new Uint8Array(hash);
			var fixedVal = 0;
			fixedVal |= hash[0] << 0;
			fixedVal |= hash[1] << 8;
			fixedVal |= hash[2] << 16;
			fixedVal |= hash[3] << 24;
			return Promise.resolve(fixedVal);
		});
	}
})();