//https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
//Auto-upgrade Math.random with a more secure implementation only if crypto is available
(function() {
	var rng = window.crypto || window.msCrypto;
	if (rng === undefined)
	  return;

	Math.random = function() {
	  return rng.getRandomValues(new Uint32Array(1))[0] / 4294967296;
	};
  })();