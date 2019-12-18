(function(){
	Vue.component("preferences", {
		data:function(){
			return {
				cryptoVisible:false,
				ciphers:[],
				cipherNew:new Models.Cipher()
			};
		},
		computed:{
			cipherTypes:function(){
				return Object.values(Models.Cipher.TYPES);
			}
		},
		mounted:function(){
			//TODO: Load from window.ServerDefaults
		},
		methods:{
			handler_showMeCrypto_click:function(){
				this.cryptoVisible = true;
			},

			handler_cipher_unload:function(cipher, index){
				this.ciphers.splice(index, 1);
			},

			handler_cipher_loadSource:function(){
				this.ciphers.push(this.cipherNew);
				this.cipherNew = new Models.Cipher();
			},

			handler_cipher_loadDevice:function(){
				console.log("cipher::handler_cipher_loadDevice");
			}
		}
	});
})();