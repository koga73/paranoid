(function(){
    OOP.namespace("Helpers",
    OOP.construct({

        static:{
			clean:function(str){
				if (!str) {
					return "";
				}
				return str.replace(/&.+;|[^a-z0-9\s:\.\|_]/gi, '').toLowerCase().replace(/\s/g, '_');
			}
		}

    }));
})();