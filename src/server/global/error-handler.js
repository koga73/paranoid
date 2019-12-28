const Settings = require.main.require("./global/settings");

module.exports = {
	handler_invalid_message:function(error, debugObj){
		debugObj = debugObj || null;

		if (error.isFatal === true){
			_methods.handler_caught_fatal(error);
		} else {
			//Recoverable
			console.warn(`INVALID MESSAGE: ${error.message}`);
			if (Settings.DEBUG && debugObj){
				console.log(debugObj);
			}
		}
	},

	handler_caught_exception:function(error, dontLog){
		dontLog = dontLog === true;

		if (error.isFatal === true){
			_methods.handler_caught_fatal(error);
		} else if (!dontLog){
			console.warn(`CAUGHT ERROR:\n${error}`); //Recoverable
		}
	},

	handler_uncaught_exception:function(error){
		console.error(`UNCAUGHT FATAL ERROR:\n${error}`);
		process.exit(1); //Uncaught fatal error
	},

	handler_caught_fatal:function(error){
		console.error(`CAUGHT FATAL ERROR:\n${error}`);
		process.exit(5); //Fatal error
	}
};