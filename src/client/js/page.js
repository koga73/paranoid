(function(){
	new Vue({
		el: "#page",
		data:{
			route:window.location.hash.substr(1),

			ciphers:[],
			relays:[],
			accounts:[],

			numConnected:0,
			totalConnections:0,
			connectionSummary:""
		},
		computed:{
			accessKeyShortcut:function(){
				return this.isFirefox ? "Alt + Shift + " : "Alt + ";
			},

			isFirefox:function(){
				return navigator.userAgent.indexOf("Firefox") != -1;
			},

			isIE:function(){
				return window.navigator.userAgent.match(/(MSIE|Trident)/);
			},

			isEdge:function(){
				return navigator.userAgent.indexOf("Edge") != -1;
			},

			isCryptoSupported:function(){
				//At time of writing this code Edge does not support ECDH
				return Helpers.Crypto.isSupported(this.isEdge);
			}
		},
		mounted:function(){
			window.onhashchange = this.handler_hash_change;

			if (this.isCryptoSupported){
				Helpers.Crypto.initIV();
			}
		},
		methods:{
			handler_hash_change:function(evt){
				this.route = window.location.hash.substr(1);
			}
		}
	});
})();