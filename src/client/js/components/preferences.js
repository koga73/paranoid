(function(){
	Vue.component("preferences", {
		data:function(){
			return {
				cryptoVisible:false,
				cipherNew:new Models.Cipher()
			};
		},
		props:[
			//Sync
			"_ciphers"
		],
		computed:{
			ciphers:{
                get:function(){
                    return this._ciphers;
                },
                set:function(value){
                    this.$emit(Events.Sync.CIPHERS, value);
                }
            },

			cipherTypes:function(){
				return Object.values(Models.Cipher.TYPES);
			}
		},
		mounted:function(){
			//Load from window.ServerDefaults
			if (window.ServerDefaults && window.ServerDefaults.preferences && window.ServerDefaults.preferences.ciphers){
				var ciphers = window.ServerDefaults.preferences.ciphers;
				var ciphersLen = ciphers.length;
				for (var i = 0; i < ciphersLen; i++){
					var cipher = ciphers[i];
					this.addCipher(new Models.Cipher({
						name:cipher.name,
						source:cipher.source,
						type:cipher.type,
						fromServer:true
					}));
				}
			}
		},
		methods:{
			addCipher:function(newCipher){
				var newName = cleanName(newCipher.name);

				//Does name already exist?
				var ciphers = this.ciphers;
				var ciphersLen = ciphers.length;
				for (var i = 0; i < ciphersLen; i++){
					var name = cleanName(ciphers[i].name);
					if (newName == name){ //Already exists
						console.warn(Resources.Strings.EXISTS_CIPHER.format(name));
						return false;
					}
				}

				this.ciphers.push(newCipher);
				loadCipher(newCipher);

				return true;
			},

			removeCipher:function(cipher, index){
				index = index || this.ciphers.indexOf(cipher);
				this.ciphers.splice(index, 1);
				unloadCipher(cipher);
			},

			handler_showMeCrypto_click:function(){
				this.cryptoVisible = true;
			},

			handler_cipher_remove:function(evt, cipher, index){
				evt.preventDefault();

				this.removeCipher(cipher, index);

				return false;
			},

			handler_cipher_loadSource:function(evt){
				evt.preventDefault();

				//Validate form
                var form = this.$refs["frmCrypto"];
                if (!form.checkValidity()) {
                    try {
                        form.reportValidity();
                    } catch(error) {
                        //IE11 doesn't support
                    }
                    return false;
                }

				if (this.addCipher(this.cipherNew)){
					this.cipherNew = new Models.Cipher();
				}

				return false;
			},

			handler_cipher_loadDevice:function(evt){
				evt.preventDefault();

				//Validate form
                var form = this.$refs["frmCrypto"];
                if (!form.checkValidity()) {
                    try {
                        form.reportValidity();
                    } catch(error) {
                        //IE11 doesn't support
                    }
                    return false;
                }

				console.info("cipher::handler_cipher_loadDevice - TODO");

				return false;
			}
		}
	});

	//Adds script tag with cipher js
	function loadCipher(cipher){
		var script = document.createElement("script");
		script.id = buildScriptId(cipher.name);

		//Is source a URL?
		if (Resources.Regex.URL_JS.test(cipher.source)){
			script.src = cipher.source;
		} else {
			script.innerHTML = cipher.source;
		}
		//TODO: Validate cipher

		console.info(Resources.Strings.LOADED_CIPHER.format(cipher.name));

		document.body.appendChild(script);
	}

	//Removes script tag for cipher js
	function unloadCipher(cipher){
		var script = document.getElementById(buildScriptId(cipher.name));
		document.body.removeChild(script);
	}

	function cleanName(name){
		return Helpers.clean(name);
	}

	function buildScriptId(name){
		return "script_" + cleanName(name);
	}
})();