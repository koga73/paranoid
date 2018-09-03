module.exports = {
	handler_caught_exception:function(error, dontLog){
		dontLog = dontLog === true;
		
		if (error.isFatal === true){
			_methods.handler_caught_fatal(error);
		} else if (!dontLog){
			console.warn("CAUGHT ERROR:\n", error, "\n"); //Recoverable
		}
	},
	
	handler_uncaught_exception:function(error){
		console.error("UNCAUGHT FATAL ERROR:\n", error, "\n");
		process.exit(1); //Uncaught fatal error
	},
	
	handler_caught_fatal:function(error){
		console.error("CAUGHT FATAL ERROR:\n", error, "\n");
		process.exit(5); //Fatal error
	}
};