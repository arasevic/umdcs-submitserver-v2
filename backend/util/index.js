var crypto = require('crypto');

// random string of length n
function randomStr(n) {
  const chars = "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ",
        r = crypto.randomBytes(n),
        s = new Array(n),
        d = 256 / chars.length;
  for (var i=0; i<n; i++) s[i] = chars[Math.floor(r[i]/d)];
  return s.join('');
}

// better than Math.random()
function randomNat(max) {
  if (max < 1) return 0;
  const maxBytes = 6,
	      maxDec = 281474976710656,
	      randbytes = parseInt(crypto.randomBytes(maxBytes).toString('hex'), 16);
	return Math.min(max-1, Math.floor(randbytes / maxDec * max));
}

module.exports = {
  randomStr, randomNat
};
