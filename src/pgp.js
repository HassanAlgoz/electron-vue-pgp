import * as openpgp from "openpgp";
openpgp.config.encryptionCipher = "curve25519";
openpgp.config.compression = openpgp.enums.compression.zip;


async function generateKeyPair(passphrase, { name, email }) {
    const { privateKeyArmored,
        publicKeyArmored,
        revocationCertificate } = await openpgp.generateKey({
            type: "ecc", // Type of the key, defaults to ECC
            passphrase: passphrase,
            userIds: { name, email } // you can pass multiple user IDs (as an array)
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
 * @param {string} text text to encrypt
 * @param {string} recepientPublicKey used to encrypt the `sessionKey` which is used to encrypt `message`
 * @param {string} privateKey used to sign the message
 * @param {string} passphrase used to decrypt `privateKey` which is then used to sign
 */
async function encryptAndSign(text, recepientPublicKey, privateKey, passphrase) {
    const pgpPublicKey = await openpgp.readKey({ armoredKey: recepientPublicKey });
    const pgpSessionKey = await openpgp.generateSessionKey({
        publicKeys: pgpPublicKey
    });
    const pgpPrivateKey = await openpgp.readKey({ armoredKey: privateKey });
    await pgpPrivateKey.decrypt(passphrase)
    return {
        encryptedMessage: await openpgp.encrypt({
            message: openpgp.Message.fromText(text),
            publicKeys: pgpPublicKey,
            sessionKey: pgpSessionKey,
            privateKeys: pgpPrivateKey, // for signing
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
 * @param {string} senderPublicKey required to verify signature
 */
async function decryptAndVerify(message, privateKey, passphrase, senderPublicKey) {
    const pgpMessage = await openpgp.readMessage({
        armoredMessage: message // parse armored message
    });
    const pgpPrivateKey = await openpgp.readKey({ armoredKey: privateKey });
    await pgpPrivateKey.decrypt(passphrase);
    const pgpPublicKey = await openpgp.readKey({ armoredKey: senderPublicKey });
    const sessionKey = await openpgp.decryptSessionKeys({
        message: pgpMessage,
        privateKeys: pgpPrivateKey,
    });

    const dec = await openpgp.decrypt({
        message: pgpMessage,
        sessionKeys: sessionKey,
        publicKeys: pgpPublicKey,
    });
    return {
        text: dec.data,
        valid: dec.signatures[0].valid
    };

}

export default {
    generateKeyPair,
    encryptAndSign,
    decryptAndVerify
}