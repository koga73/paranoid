//Directory loader - Makes files uppercase and directories objects
//Example: foo.Bar vs foo.foo.Bar
module.exports = {
	//Enumerates files / subdirectories and creates an object
	//Path should be: require("path").join(__dirname, "./")
	enumDirectory:function(path){
		var exports = {};
		require("fs").readdirSync(path).forEach(function(file){
			switch (true){
				case (/^.+\.js$/.test(file)): //js file
					if (file !== "index.js"){
						//Remove js
						//Example: test.js = test
						var moduleName = file.replace(/\.js$/i, '');
						
						//Make camel case
						//Example: test_test = testTest
						(moduleName.match(/_[a-z0-9]/g) || []).forEach((match) => {
							moduleName = moduleName.replace(match, match.toUpperCase().replace('_', ''));
						});
						
						//Make first letter uppercase
						//Example: test = Test
						moduleName = moduleName.substr(0, 1).toUpperCase() + moduleName.substr(1, moduleName.length - 1);
						exports[moduleName] = require(path + file);
					}
					break;
				case (/^[^.]+$/.test(file)): //directory
					exports[file] = require(path + file);
					break;
			}
		});
		return exports;
	}
};