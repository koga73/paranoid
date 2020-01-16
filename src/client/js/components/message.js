(function(){
	var INTERVAL = 30; //ms
	var DELAY = 300; //ms

	Vue.component("message", {
		data:function(){
			return {
				content:""
			};
		},
		props:[
			"message"
		],
		mounted:function(){
			//TODO: Add check if not animating just show this.message.content
			decryptAnimate(this, "content", this.message.raw, this.message.content);
		},
		computed:{
			time:function(){
				var dateTime = new Date(this.message.time);
				return (dateTime.getMonth() + 1) + "/" + dateTime.getDate() + "/" + dateTime.getFullYear() + " " + dateTime.getHours() + ":" + dateTime.getMinutes() + "." + dateTime.getMilliseconds();
			},

			title:function(){
				return this.message.from + "\n" + this.time;
			}
		}
	});

	function decryptAnimate(scopeObj, scopeProp, encrypted, decrypted){
		var len = decrypted.length;
		//Set encrypted to same length as decrypted
		encrypted = encrypted.slice(0, len);

		//Randomize order
		var allIndices = [];
		for (var i = 0; i < len; i++){
			allIndices.push(i);
		}
		var orderIndices = [];
		for (var i = 0; i < len; i++){
			var rnd = Math.random() * allIndices.length >> 0;
			orderIndices.push(allIndices.splice(rnd, 1)[0]);
		}

		//Set initial to encrypted
		scopeObj[scopeProp] = encrypted;

		//Delay
		var timeout = setTimeout(function(){
			var tickNum = 0;
			var output = encrypted.split("");

			//Interval
			var interval = setInterval(function(){
				//Display one decrypted character per tick
				output[orderIndices[tickNum]] = decrypted[orderIndices[tickNum]];
				tickNum++;
				//Display
				scopeObj[scopeProp] = output.join("");
				if (tickNum == len){
					clearInterval(interval);
				}
			}, INTERVAL);
			clearTimeout(timeout);
		}, DELAY);
	}
})();