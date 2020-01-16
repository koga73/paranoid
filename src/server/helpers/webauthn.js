const {
	generateRegistrationChallenge,
	parseRegisterRequest,
	generateLoginChallenge,
	parseLoginRequest,
	verifyAuthenticatorAssertion,
} = require('@webauthn/server');

const Settings = require.main.require("./global/Settings");

module.exports = {
	requestRegister:function(userId, userName){
		return generateRegistrationChallenge({
			relayingParty:{
				name:Settings.NAME
			},
			user:{
				id:userId,
				name:userName
			}
		});
	},

	register:function(registerRequest){
		const {key, challenge} = parseRegisterRequest(registerRequest);

	}
};