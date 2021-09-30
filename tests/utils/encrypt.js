const { get, set } = require('idb-keyval');
const crypto = require('crypto').webcrypto;

const NINA_ENCRYPTION_KEY = 'NINA_ENCRYPTION_KEY';

const encryptData = async (data, publicKey, keys, size, iv=null) => {
  const importedKey = await importKey(publicKey);
  const derivedKey = await deriveSecretKey(keys.privateKey, importedKey);
  
  if (!iv) {
    iv = await crypto.getRandomValues(new Uint8Array(16));
  }
  const enc = new TextEncoder();
  const buffer = Buffer.from(data);
  const padding = size - 16 - buffer.byteLength;

  var encrypted = await encrypt(Buffer.concat([buffer, Buffer.alloc(padding)]), derivedKey, iv);
  return [Buffer.from(encrypted), Buffer.from(iv)];
}

const decryptData = async (data, publicKey, iv, keys) => {
  const importedKey = await importKey(publicKey);
  const derivedKey = await deriveSecretKey(keys.privateKey, importedKey);
  const decrypted = await decrypt(Buffer.from(data), derivedKey, new Uint8Array(iv));
  return new TextDecoder().decode(new Uint8Array(decrypted)).replaceAll(/\u0000/g, '');
}

const exportPublicKey = async () => {
  const keys = await makeKeys();
  const key = await crypto.subtle.exportKey('spki', keys.publicKey);
  return [key, keys];
}

const importKey = async (publicKey) => {
  return await crypto.subtle.importKey(
    'spki',
    publicKey, {
      name: "ECDH",
      namedCurve: "P-384"
    }, 
    false,
    ["deriveKey"]
  );
}

const deriveSecretKey = async (privateKey, publicKey) => {
  return await crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: publicKey
    },
    privateKey,
    {
      name: "AES-CBC",
      length: 128
    },
    false,
    ["encrypt", "decrypt"]
  );
}

const encrypt = async (data, key, iv) => {
  return await crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    key,
    data
  );
}


const decrypt = async (data, key, iv) => {
  return await crypto.subtle.decrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    key,
    data
  );
}

const makeKeys = () => {
  return crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-384"
    },
    false,
    ["deriveKey"]
   )
}

const decode = (byteArray) => {
  return new TextDecoder().decode(new Uint8Array(byteArray)).replaceAll(/\u0000/g, '');
}

module.exports = {
  encryptData,
  decryptData,
  exportPublicKey,
  decode,
}
