<template>
  <main id="pgp" class="container-fluid">
    <div class="row my-4">
      <div class="col">
        <label for="passphrase">Passphrase</label>
        <input
          type="text"
          id="passphrase"
          v-model="passphrase"
          class="form-control"
        />
        <button class="btn btn-primary" @click="generateKeyPair">
          Generate Key Pair
        </button>
      </div>
    </div>
    <div class="row my-4">
      <div class="col">
        <label for="selectedUsers">Recepients</label>
        <select
          v-model="selectedUsers"
          multiple
          class="custom-select"
          id="selectedUsers"
        >
          <option v-for="user in userIds" :key="user.email" :value="user">
            {{ user.name }} &lt;{{ user.email }}&gt;
          </option>
        </select>
      </div>
    </div>
    <div class="row my-4">
      <div class="col-6">
        <label for="publicKey">Public Key</label>
        <textarea
          class="form-control"
          readonly
          v-model="publicKey"
          id="publicKey"
        ></textarea>
      </div>
      <div class="col-6">
        <label for="privateKey">Private Key</label>
        <textarea
          class="form-control"
          readonly
          v-model="privateKey"
          id="privateKey"
        ></textarea>
      </div>
    </div>
    <div class="row my-4">
      <div class="col-6 mx-auto">
        <label for="sessionKey">Session Key</label>
        <textarea
          class="form-control"
          readonly
          v-model="sessionKey"
          id="sessionKey"
        ></textarea>
      </div>
    </div>
    <div class="row my-4">
      <div class="col-4">
        <label for="message">Message</label>
        <textarea
          id="message"
          class="form-control"
          v-model="message"
        ></textarea>
        <button class="btn btn-primary" @click="encryptMessage">
          Encrypt Message
        </button>
      </div>
      <div class="col-4">
        <label for="encryptedMessage">Encrypted Message</label>
        <textarea
          class="form-control"
          readonly
          v-model="encryptedMessage"
          id="encryptedMessage"
        ></textarea>
        <button class="btn btn-primary" @click="decryptMessage">
          Decrypt Message
        </button>
      </div>
      <div class="col-4">
        <label for="decryptedMessage">Decrypted Message</label>
        <textarea
          class="form-control"
          readonly
          v-model="decryptedMessage"
          id="decryptedMessage"
        ></textarea>
      </div>
    </div>
  </main>
</template>

<script>
import * as openpgp from "openpgp";

openpgp.config.encryptionCipher = "curve25519";
openpgp.config.compression = openpgp.enums.compression.zip;

export default {
  name: "PGP",
  components: {},
  data() {
    return {
      publicKey: "",
      privateKey: "",
      sessionKey: "",
      revocationCertificate: "",
      message: "garden 8:45pm",
      encryptedMessage: "",
      decryptedMessage: "",
      passphrase: "super long and hard to guess secret",
      userIds: [
        {
          name: "Jon Smith",
          email: "jon@example.com",
          publicKey: "",
          privateKey: "",
          revocationCertificate: "",
        },
        {
          name: "Tortoise Pumpkin",
          email: "tortp@example.com",
          publicKey: "",
          privateKey: "",
          revocationCertificate: "",
        },
        {
          name: "Steve Hare",
          email: "steven@example.com",
          publicKey: "",
          privateKey: "",
          revocationCertificate: "",
        },
      ],
      selectedUsers: [],
    };
  },
  created() {
    this.selectedUsers.push(this.userIds[0]);
  },
  computed: {},
  async mounted() {},
  methods: {
    async generateKeyPair() {
      const userIds = this.selectedUsers.map((u) => ({
        name: u.name,
        email: u.email,
      }));
      const {
        privateKeyArmored,
        publicKeyArmored,
        revocationCertificate,
      } = await openpgp.generateKey({
        type: "ecc", // Type of the key, defaults to ECC
        userIds: userIds, // you can pass multiple user IDs
        passphrase: this.passphrase, // protects the private key
      });
      this.privateKey = privateKeyArmored;
      this.publicKey = publicKeyArmored;
      this.revocationCertificate = revocationCertificate;
    },
    async encryptMessage() {
      const publicKey = await openpgp.readKey({ armoredKey: this.publicKey });
      const sessionKey = await openpgp.generateSessionKey({
        publicKeys: publicKey,
      });

      this.sessionKey = btoa(String.fromCodePoint(...sessionKey.data));

      const enc = await openpgp.encrypt({
        message: openpgp.Message.fromText(this.message),
        publicKeys: publicKey,
        sessionKey: sessionKey,
      });
      this.encryptedMessage = enc;
    },
    async decryptMessage() {
      const message = await openpgp.readMessage({
        armoredMessage: this.encryptedMessage, // parse armored message
      });
      const privateKey = await openpgp.readKey({ armoredKey: this.privateKey });
      await privateKey.decrypt(this.passphrase);
      const sessionKey = await openpgp.decryptSessionKeys({
        message,
        privateKeys: privateKey,
      });
      const { data: decrypted } = await openpgp.decrypt({
        message,
        sessionKeys: sessionKey,
      });
      this.decryptedMessage = decrypted;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>


