//Provides atob and btoa functions for interoperability with client code

global.atob = function(base64Encoded){
	return Buffer.from(base64Encoded).toString('base64');
}

global.btoa = function(unencoded){
	return Buffer.from(unencoded, "base64").toString();
}