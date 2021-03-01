import * as openpgp from "openpgp";
openpgp.config.encryptionCipher = "curve25519";
openpgp.config.compression = openpgp.enums.compression.zip;


/**
 * 
 */
async function generateKeyPair(passphrase, { name, email }) {
    const { privateKeyArmored,
        publicKeyArmored,
        revocationCertificate } = await openpgp.generateKey({
            type: "ecc", // Type of the key, defaults to ECC
            passphrase: passphrase,
            userIds: [{ name, email }] // you can pass multiple user IDs
        })
    return {
        privateKeyArmored,
        publicKeyArmored,
        revocationCertificate
    }
}


/**
 * encrypt works on textual data, encrypts it using a random `sessionKey` which is encrypted using
 * the `publicKey` of the reciever
 * @param {string} message text to encrypt
 * @param {string} publicKey used to encrypt the `sessionKey` which is used to encrypt `message`
 * @returns {{encryptedMessage: string, sessionKey: string}} `encryptedMessage` and `sessionKey`
 */
async function encrypt(message, publicKey) {
    const pgpPublicKey = await openpgp.readKey({ armoredKey: publicKey });
    const pgpSessionKey = await openpgp.generateSessionKey({
        publicKeys: pgpPublicKey
    });

    return {
        encryptedMessage: await openpgp.encrypt({
            message: openpgp.Message.fromText(message),
            publicKeys: pgpPublicKey,
            sessionKey: pgpSessionKey
        }),
        sessionKey: btoa(String.fromCodePoint(...pgpSessionKey.data))
    }
}


/**
 * decrypt works on an encrypted message that is base-64 encoded (armored)
 * The returned `decryptedMessage` requires `sessionKey` which requires `privateKey` which requires `passphrase`
 * @param {string} message base-64, encrypted message (armored)
 * @param {string} privateKey required to decrypt sessionKey which is required to decrypt message
 * @param {string} passphrase required to decrypt privateKey
 * @returns {string} `decryptedMessage`. The original message.
 */
async function decrypt(message, privateKey, passphrase) {
    const pgpMessage = await openpgp.readMessage({
        armoredMessage: message // parse armored message
    });
    const pgpPrivateKey = await openpgp.readKey({ armoredKey: privateKey });
    await pgpPrivateKey.decrypt(passphrase);
    const sessionKey = await openpgp.decryptSessionKeys({
        message: pgpMessage,
        privateKeys: pgpPrivateKey
    });
    const { data: decrypted } = await openpgp.decrypt({
        message: pgpMessage,
        sessionKeys: sessionKey
    });
    return decrypted;
}

export default {
    generateKeyPair,
    encrypt,
    decrypt
}