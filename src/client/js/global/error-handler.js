(function(){
    OOP.namespace("Global.ErrorHandler",
    OOP.construct({

        static:{
			//Network handler for failed service calls and dropped connectivity
			network:function(error){
				var message = Resources.Strings.ERROR_GENERAL;
				if (error && typeof error !== typeof undefined && error.userFriendlyMessage) {
					message = error.userFriendlyMessage;
				}

				var networkResponse = error.response || error;
				var code = (networkResponse) ? networkResponse.status : error.code;
				switch (code){
					case -1: //Timeout
					case 0: //Timeout
					case "ECONNABORTED": //Timeout
					case 503: //Gateway unavailable
						message = Resources.Strings.ERROR_NETWORK;
						break;
				}

				console.info("ErrorHandler::network - networkResponse:", networkResponse);

				_showMessage(message);
			},

			//Caught handler can be referenced usage
			caught:function(error){
				console.error("ErrorHandler::caught:", error);

				var message = Resources.Strings.ERROR_GENERAL;
				if (error && typeof error !== typeof undefined && error.userFriendlyMessage) {
					message = error.userFriendlyMessage;
				}
				_showMessage(message);
			},

			//Uncaught handler - these errors should be considered fatal
			uncaught:function(error){
				console.error("ErrorHandler::uncaught:", error);

				var message = Resources.Strings.ERROR_UNCAUGHT;
				if (error && typeof error !== typeof undefined && error.userFriendlyMessage) {
					message = error.userFriendlyMessage;
				}
				_showMessage(message);
			},

			//Warn handler for referenced usage
			warn:function(warning){
				console.warn("ErrorHandler::warn:", warning);

				var message = Resources.Strings.ERROR_GENERAL;
				if (warning && typeof warning !== typeof undefined && warning.userFriendlyMessage) {
					message = warning.userFriendlyMessage;
				}
				_showMessage(message);
			}
		}
	}));

	function _showMessage(message){
		//TODO
	}

	(function init(){
		//VueJS uncaught error hook
		if (typeof Vue !== typeof undefined){
			Vue.config.errorHandler = function(err, vm, info){
				Global.ErrorHandler.uncaught(err);
			}
			Vue.config.warnHandler = function(msg, vm, trace){
				Global.ErrorHandler.warn(msg);
			}
		}

		//Browser uncaught error hook
		window.onerror = function(message, source, lineno, colno, error){
			Global.ErrorHandler.uncaught(error);
			return true; //Prevent default
		}
	})();
})();