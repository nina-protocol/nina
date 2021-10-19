import { get, set } from 'idb-keyval'

const NINA_ENCRYPTION_KEY = 'NINA_ENCRYPTION_KEY'

export const encryptData = async (data, publicKey, size, iv = null) => {
  let keys = await get(NINA_ENCRYPTION_KEY)
  if (!keys) {
    keys = await makeKeys()
    await set(NINA_ENCRYPTION_KEY, keys)
  }

  const importedKey = await importKey(publicKey)
  const secretKey = await deriveSecretKey(keys.privateKey, importedKey)

  if (!iv) {
    iv = window.crypto.getRandomValues(new Uint8Array(16))
  }

  const buffer = Buffer.from(data)
  const padding = size - 16 - buffer.byteLength

  var encrypted = await encrypt(
    Buffer.concat([buffer, Buffer.alloc(padding)]),
    secretKey,
    iv
  )
  return [Buffer.from(encrypted), Buffer.from(iv)]
}

export const decryptData = async (data, publicKey, iv) => {
  let keys = await get(NINA_ENCRYPTION_KEY)
  if (!keys) {
    throw new Error('Cannot decrypt data, No Keypair found')
  }

  const importedKey = await importKey(new Buffer.from(publicKey))
  const derivedKey = await deriveSecretKey(keys.privateKey, importedKey)
  const decrypted = await decrypt(
    new Buffer.from(data),
    derivedKey,
    new Uint8Array(iv)
  )
  return new TextDecoder()
    .decode(new Uint8Array(decrypted))
    .replaceAll(/\u0000/g, '');
}

export const exportPublicKey = async () => {
  let keys = await get(NINA_ENCRYPTION_KEY)
  if (!keys) {
    keys = await makeKeys()
    await set(NINA_ENCRYPTION_KEY, keys)
  }

  var key = await window.crypto.subtle.exportKey('spki', keys.publicKey)
  return key
}

export const decodeNonEncryptedByteArray = (byteArray) => {
  return new TextDecoder()
    .decode(new Uint8Array(byteArray))
    .replaceAll(/\u0000/g, '');
}

const importKey = async (publicKey) => {
  return await window.crypto.subtle.importKey(
    'spki',
    publicKey,
    {
      name: 'ECDH',
      namedCurve: 'P-384',
    },
    false,
    []
  )
}

const deriveSecretKey = async (privateKey, publicKey) => {
  return await window.crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: publicKey,
    },
    privateKey,
    {
      name: 'AES-CBC',
      length: 128,
    },
    false,
    ['encrypt', 'decrypt']
  )
}

const encrypt = async (data, key, iv) => {
  return await window.crypto.subtle.encrypt(
    {
      name: 'AES-CBC',
      iv: iv,
    },
    key,
    data
  )
}

const decrypt = async (data, key, iv) => {
  return await window.crypto.subtle.decrypt(
    {
      name: 'AES-CBC',
      iv: iv,
    },
    key,
    data
  )
}

const makeKeys = () => {
  return window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-384',
    },
    false,
    ['deriveKey']
  )
}
