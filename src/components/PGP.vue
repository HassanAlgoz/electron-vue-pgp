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
import pgp from "../pgp";

export default {
  name: "PGP",
  components: {},
  data() {
    return {
      username: "hgoz",
      email: "hgoz@example.com",
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
  created() {},
  computed: {},
  async mounted() {},
  methods: {
    async generateKeyPair() {
      const {
        privateKeyArmored,
        publicKeyArmored,
        revocationCertificate,
      } = await pgp.generateKeyPair(this.passphrase, {
        name: this.username,
        email: this.email,
      });
      this.privateKey = privateKeyArmored;
      this.publicKey = publicKeyArmored;
      this.revocationCertificate = revocationCertificate;
    },
    async encryptMessage() {
      const { encryptedMessage, sessionKey } = await pgp.encrypt(
        this.message,
        this.publicKey
      );
      this.encryptedMessage = encryptedMessage;
      this.sessionKey = sessionKey;
    },
    async decryptMessage() {
      this.decryptedMessage = await pgp.decrypt(
        this.encryptedMessage,
        this.privateKey,
        this.passphrase
      );
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>


