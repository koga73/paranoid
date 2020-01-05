(function(){
    OOP.namespace("Helpers.Crypto",
    OOP.construct({

        static:{
			TAG_LEN:16, //Bytes

			IV_FIXED_CLIENT:0,
			IV_FIXED_RELAY:0,

			encrypt:function(iv, key, plaintext){
				var _this = this;
				return new Promise(function(resolve, reject){
					crypto.subtle.encrypt({
						name:"AES-GCM",
						iv:iv
					}, key, new TextEncoder().encode(plaintext))
						.then(function(ciphertext){
							resolve('"' + _this.ArrayBufferToBase64(ciphertext) + '"');
						})
						.catch(reject);
				});
			},

			decrypt:function(iv, key, ciphertext){
				var _this = this;
				return new Promise(function(resolve, reject){
					crypto.subtle.decrypt({
						name:"AES-GCM",
						iv:iv
					}, key, _this.base64ToArrayBuffer(ciphertext))
						.then(function(plaintext){
							resolve(new TextDecoder().decode(plaintext));
						})
						.catch(reject);
				});
			},

			//startIV = random byte array of length 12
			computeIV:function(startIV, fixed, incremental){
				if (startIV.byteLength != 12){
					throw new Error(Resources.Strings.ERROR_INVALID_ARRAY_LENGTH);
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
				return crypto.subtle.digest("SHA-256", new TextEncoder().encode(phrase))
					.then(function(hash){
						hash = new Uint8Array(hash);
						var fixedVal = 0;
						fixedVal |= hash[0] << 0;
						fixedVal |= hash[1] << 8;
						fixedVal |= hash[2] << 16;
						fixedVal |= hash[3] << 24;
						return Promise.resolve(fixedVal);
					});
			},

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
			}
		}

	}));

	Helpers.Crypto.getIVFixed("client").then(function(code){
		Helpers.Crypto.IV_FIXED_CLIENT = code;
	});
	Helpers.Crypto.getIVFixed("relay").then(function(code){
		Helpers.Crypto.IV_FIXED_RELAY = code;
	});
})();