(function(){
	new Vue({
		el: "#page",
		data: {
			test:"TEST ME 123"
		},
		computed: {
			accessKeyShortcut: function() {
				return this.isFirefox ? "Alt + Shift + " : "Alt + ";
			},

			isFirefox: function() {
				return isFirefox = navigator.userAgent.indexOf("Firefox") != -1;
			},

			isIE: function() {
				return window.navigator.userAgent.match(/(MSIE|Trident)/);
			}
		},
		mounted: function() {

		}
	});
})();