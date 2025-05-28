const crypto = require('crypto');
const { modPow } = require('bigint-mod-arith');

const G = BigInt(7);
const N = BigInt('0x894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7');

function generateSalt() {
  return crypto.randomBytes(32);
}

function generateVerifier(username, password, salt) {
  username = username.toUpperCase();
  password = password.toUpperCase();

  const h1 = crypto.createHash('sha1').update(`${username}:${password}`).digest();
  const h2 = crypto.createHash('sha1').update(Buffer.concat([salt, h1])).digest();
  const h2BigInt = BigInt('0x' + h2.toString('hex').match(/../g).reverse().join(''));
  const verifierBigInt = modPow(G, h2BigInt, N);

  let verifierBuffer = Buffer.from(verifierBigInt.toString(16).padStart(64, '0'), 'hex').reverse();
  if (verifierBuffer.length > 32) {
    verifierBuffer = verifierBuffer.slice(0, 32);
  }

  return verifierBuffer;
}

module.exports = { generateSalt, generateVerifier };
