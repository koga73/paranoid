(function(){
	new Vue({
		el: "#page",
		data: {
			route:window.location.hash.substr(1),

			ciphers:[],
			relays:[],
			accounts:[
				new Models.Account({
					username:"Anonymous"
				})
			],

			numConnected:0,
			totalConnections:0,
			connectionSummary:""
		},
		computed: {
			accessKeyShortcut:function() {
				return this.isFirefox ? "Alt + Shift + " : "Alt + ";
			},

			isFirefox:function() {
				return isFirefox = navigator.userAgent.indexOf("Firefox") != -1;
			},

			isIE:function() {
				return window.navigator.userAgent.match(/(MSIE|Trident)/);
			}
		},
		mounted:function() {
			window.onhashchange = this.handler_hash_change;
		},
		methods:{
			handler_hash_change:function(evt){
				this.route = window.location.hash.substr(1);
			}
		}
	});
})();