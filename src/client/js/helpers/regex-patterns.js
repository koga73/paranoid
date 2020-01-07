(function(){
    OOP.namespace("Helpers.RegexPatterns",
    OOP.construct({

        static:{
			URL_JS:/^(\w+:\/\/)?[\w\/.:-]+\.js$/i, //https://regex101.com/r/KI0j3S/1
			ECDH_KEY:/^[a-z0-f]{266}$/i
		}

    }));
})();