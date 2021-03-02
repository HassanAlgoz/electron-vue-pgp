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
      <div class="col-6">
        <label for="message">Message</label>
        <textarea
          id="message"
          class="form-control"
          v-model="message"
        ></textarea>
      </div>
      <div class="col-6">
        <label for="selectedRecepients">Recepients</label>
        <select
          v-model="selectedRecepients"
          multiple
          class="custom-select"
          id="selectedRecepients"
        >
          <option v-for="user in recepients" :key="user.email" :value="user">
            {{ user.name }} &lt;{{ user.email }}&gt;
          </option>
        </select>
      </div>
    </div>
    <div class="row">
      <div class="col-6 mx-auto text-center">
        <button
          class="btn btn-primary"
          @click="encryptMessage"
          :disabled="selectedRecepients.length === 0"
        >
          <span
            >Encrypt <br />
            <small>(for each recepient)</small></span
          >
        </button>
      </div>
    </div>
    <div class="row my-4">
      <div
        v-for="recepient in selectedRecepients"
        :key="recepient.email"
        class="col d-flex flex-column"
      >
        <div>
          <label for="publicKey">Public Key ({{ recepient.name }})</label>
          <textarea
            class="form-control"
            readonly
            v-model="recepient.publicKey"
            id="publicKey"
          ></textarea>
        </div>
        <div>
          <label for="sessionKey">Session Key</label>
          <textarea
            class="form-control"
            readonly
            v-model="recepient.sessionKey"
            id="sessionKey"
          ></textarea>
        </div>
        <div>
          <label for="encryptedMessage">Encrypted Message</label>
          <textarea
            class="form-control"
            readonly
            v-model="recepient.messageSent"
            id="encryptedMessage"
          ></textarea>
          <button
            class="btn btn-primary"
            @click="() => decryptMessage(recepient)"
          >
            Decrypt
          </button>
        </div>
        <div>
          <label for="decryptedMessage">Decrypted Message</label>
          <textarea
            class="form-control"
            readonly
            v-model="recepient.decryptedMessage"
            id="decryptedMessage"
          ></textarea>
          <div v-if="recepient.decryptedMessage">
            <span>Signature is: </span>
            <span v-if="recepient.validSignature" class="text-success"
              >Valid</span
            >
            <span v-else class="text-danger">NOT valid!</span>
          </div>
        </div>
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
      recepients: [
        {
          name: "Jon Smith",
          email: "jon@example.com",
          publicKey: `-----BEGIN PGP PUBLIC KEY BLOCK-----

xjMEYD35FRYJKwYBBAHaRw8BAQdARohrEikSvLsDY6JZAo76iU8oI6oGHEzv
kY6D80LGaDTNF2hnb3ogPGhnb3pAZXhhbXBsZS5jb20+wo0EEBYKAB4FAmA9
+RUFCwAJBwgDFQgKBBYBAgACGQECGwMCHgEAIQkQwtHIj6i7eVYWIQQm28ra
s3OcmfrjoMTC0ciPqLt5VhEdAQDjMUySAauoLHewWS5eJtIqpNH/vcCZ3ZE0
1ar9Rv5W1QEA32ecHcMp492ZZ1rexwv9Gd2OarZEJgu5s51+aKyJqA3OOARg
PfkVEgorBgEEAZdVAQUBAQdAqP9s0yojGpsd6RT99uE4P3trvfbZ3ccuQFyr
0lB94TMDAQgHwngEGBYIAAkFAmA9+RUCGwwAIQkQwtHIj6i7eVYWIQQm28ra
s3OcmfrjoMTC0ciPqLt5VigGAQCvCIuzZ63WWsqiHXeJetQEDABb+zUTnCrn
y1YjRhj+kQEAw2RJiy8TDrYzmA5SXeF8vkhdpxNlSc5VzDEErQ6FpAw=
=Pcg2
-----END PGP PUBLIC KEY BLOCK-----
`,
          privateKey: `-----BEGIN PGP PRIVATE KEY BLOCK-----

xYYEYD35FRYJKwYBBAHaRw8BAQdARohrEikSvLsDY6JZAo76iU8oI6oGHEzv
kY6D80LGaDT+CQMI0vCiVbNgP3jgEQz7TYkcd24Gb51hzrmC4T3CDQKT1uz/
82YtOvXEJolHZzY0z+otJW3gt/vPKTOxS2tLLWXQSJ+mkjv8TAEzCriEEvot
d80XaGdveiA8aGdvekBleGFtcGxlLmNvbT7CjQQQFgoAHgUCYD35FQULAAkH
CAMVCAoEFgECAAIZAQIbAwIeAQAhCRDC0ciPqLt5VhYhBCbbytqzc5yZ+uOg
xMLRyI+ou3lWER0BAOMxTJIBq6gsd7BZLl4m0iqk0f+9wJndkTTVqv1G/lbV
AQDfZ5wdwynj3ZlnWt7HC/0Z3Y5qtkQmC7mznX5orImoDceLBGA9+RUSCisG
AQQBl1UBBQEBB0Co/2zTKiMamx3pFP324Tg/e2u99tndxy5AXKvSUH3hMwMB
CAf+CQMIwvei1OxPy2rgkXfx5o8IjW2mN0BLOOPMDtTvmVrHup9O+zBPWG2V
7x6h9ncjBWc0c4AC1C/JgULndZNh7y/d2WPlu9DZdV8u74i90QX7QcJ4BBgW
CAAJBQJgPfkVAhsMACEJEMLRyI+ou3lWFiEEJtvK2rNznJn646DEwtHIj6i7
eVYoBgEArwiLs2et1lrKoh13iXrUBAwAW/s1E5wq58tWI0YY/pEBAMNkSYsv
Ew62M5gOUl3hfL5IXacTZUnOVcwxBK0OhaQM
=y9dc
-----END PGP PRIVATE KEY BLOCK-----
`,
          passphrase: "super long and hard to guess secret",
          sessionKey: "",
          messageSent: "",
          decryptedMessage: "",
          validSignature: false,
        },
        {
          name: "Tortoise Pumpkin",
          email: "tortp@example.com",
          publicKey: `-----BEGIN PGP PUBLIC KEY BLOCK-----

xjMEYD35LBYJKwYBBAHaRw8BAQdAF4KgvR6b4EeJWIL7twZt+a3r6OAZSDr0
Zw8QQHEZeU/NF2hnb3ogPGhnb3pAZXhhbXBsZS5jb20+wo0EEBYKAB4FAmA9
+SwFCwAJBwgDFQgKBBYBAgACGQECGwMCHgEAIQkQZV379itkzKwWIQQGytQu
vTfIeNQ7TvJlXfv2K2TMrPTFAP9AH8V/2kyj1JGGw8xzR7Nkfd0BkAqp/L0P
FbraVOpgagEA15XhuRXvYIq5gPIq2I/OO13K2Fjs88lH0KM+GID7ig/OOARg
PfksEgorBgEEAZdVAQUBAQdAPGRlMhj+KW9tOsyB3Q8hEEtYZlmZb1RI2mcT
Wi2yUVgDAQgHwngEGBYIAAkFAmA9+SwCGwwAIQkQZV379itkzKwWIQQGytQu
vTfIeNQ7TvJlXfv2K2TMrOW8AP9A/BiYZ/eWcUNaf+5x4786kTn1pHWfUsqu
zSWnif3MqAEAnCxdXERD6dTs/mvCFDNQhF7FYu9ICBRh/TgShi0DJQk=
=1/qc
-----END PGP PUBLIC KEY BLOCK-----
`,
          privateKey: `-----BEGIN PGP PRIVATE KEY BLOCK-----

xYYEYD35LBYJKwYBBAHaRw8BAQdAF4KgvR6b4EeJWIL7twZt+a3r6OAZSDr0
Zw8QQHEZeU/+CQMINcPdZ0RP3ffgC1nPylvWVkVpCf6gkWr6hC0tor8uMSX4
VU7/CxWTNIcKlJsnaEHTIHbsxr9Wtl6ecrwqZLHmNn0l04y3LTf8YG10CZZp
Gc0XaGdveiA8aGdvekBleGFtcGxlLmNvbT7CjQQQFgoAHgUCYD35LAULAAkH
CAMVCAoEFgECAAIZAQIbAwIeAQAhCRBlXfv2K2TMrBYhBAbK1C69N8h41DtO
8mVd+/YrZMys9MUA/0AfxX/aTKPUkYbDzHNHs2R93QGQCqn8vQ8VutpU6mBq
AQDXleG5Fe9girmA8irYj847XcrYWOzzyUfQoz4YgPuKD8eLBGA9+SwSCisG
AQQBl1UBBQEBB0A8ZGUyGP4pb206zIHdDyEQS1hmWZlvVEjaZxNaLbJRWAMB
CAf+CQMIUcELPUI798Lg1LQeU3LtWaW1SHK/EDMqBgQzi4JaV5zwfR/oYucw
AKiEBeERrA3Da1X61RWrmbpYORR71VG1/Ywpq2j5M1GM18N6piQ06sJ4BBgW
CAAJBQJgPfksAhsMACEJEGVd+/YrZMysFiEEBsrULr03yHjUO07yZV379itk
zKzlvAD/QPwYmGf3lnFDWn/uceO/OpE59aR1n1LKrs0lp4n9zKgBAJwsXVxE
Q+nU7P5rwhQzUIRexWLvSAgUYf04EoYtAyUJ
=v6og
-----END PGP PRIVATE KEY BLOCK-----
`,
          passphrase: "super long and hard to guess secret",
          sessionKey: "",
          messageSent: "",
          decryptedMessage: "",
          validSignature: false,
        },
        {
          name: "Steve Hare",
          email: "steven@example.com",
          publicKey: `-----BEGIN PGP PUBLIC KEY BLOCK-----

xjMEYD35RRYJKwYBBAHaRw8BAQdA6fxnf0n1w3cFN6yYLTDPbIyzD+qmnxEw
+uWcat9xd8bNF2hnb3ogPGhnb3pAZXhhbXBsZS5jb20+wo0EEBYKAB4FAmA9
+UUFCwAJBwgDFQgKBBYBAgACGQECGwMCHgEAIQkQ5onmjfnMMm4WIQTU9tZm
aulv/r4djlfmieaN+cwyboXcAP9ozmG/xhZLI63SRq4HVUXTasgPhZPgWkJw
cki4UeIZ3QD/Ryt+uJrI5NycTSdUo7wGxsX4I5ce8ZhgPunm7sNP+QvOOARg
PflFEgorBgEEAZdVAQUBAQdAT7xCGKXBxcT7IewXZcFtauKVuAOietVfIhDH
51H5bhoDAQgHwngEGBYIAAkFAmA9+UUCGwwAIQkQ5onmjfnMMm4WIQTU9tZm
aulv/r4djlfmieaN+cwybnGtAP97+pBNwgXlFMi3/tF9voXEZFbjdGfv/xle
KGOT/TB2hwD+LWZxFLQDJqAHwRW7KjTIL3ZbKv186LE6veK4bWgL3wk=
=/j9C
-----END PGP PUBLIC KEY BLOCK-----
`,
          privateKey: `-----BEGIN PGP PRIVATE KEY BLOCK-----

xYYEYD35RRYJKwYBBAHaRw8BAQdA6fxnf0n1w3cFN6yYLTDPbIyzD+qmnxEw
+uWcat9xd8b+CQMIH0g1PljYQLfgfcZKemfiRo/iVtPVqDpNKS2pupBiT98c
GVTgsyPviwqPb+zEnBtL/1Sed8XLPoIu3UMtxtyZMwd0NZFqe29pqwF4lDOB
JM0XaGdveiA8aGdvekBleGFtcGxlLmNvbT7CjQQQFgoAHgUCYD35RQULAAkH
CAMVCAoEFgECAAIZAQIbAwIeAQAhCRDmieaN+cwybhYhBNT21mZq6W/+vh2O
V+aJ5o35zDJuhdwA/2jOYb/GFksjrdJGrgdVRdNqyA+Fk+BaQnBySLhR4hnd
AP9HK364msjk3JxNJ1SjvAbGxfgjlx7xmGA+6ebuw0/5C8eLBGA9+UUSCisG
AQQBl1UBBQEBB0BPvEIYpcHFxPsh7BdlwW1q4pW4A6J61V8iEMfnUfluGgMB
CAf+CQMIdCzBR3qjhhfgJQ/0E5Xqz+TtazrWC3XxD+Gcmafg+6OXYI7hUDai
0xBzePaKIZckBFY7WIBWZObBM4UAXaHFiZXqq+/euHSyTDfMOoN+i8J4BBgW
CAAJBQJgPflFAhsMACEJEOaJ5o35zDJuFiEE1PbWZmrpb/6+HY5X5onmjfnM
Mm5xrQD/e/qQTcIF5RTIt/7Rfb6FxGRW43Rn7/8ZXihjk/0wdocA/i1mcRS0
AyagB8EVuyo0yC92Wyr9fOixOr3iuG1oC98J
=Y6fr
-----END PGP PRIVATE KEY BLOCK-----
`,
          passphrase: "super long and hard to guess secret",
          sessionKey: "",
          messageSent: "",
          decryptedMessage: "",
          validSignature: false,
        },
      ],
      selectedRecepients: [],
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
      for (const recepient of this.selectedRecepients) {
        const { encryptedMessage, sessionKey } = await pgp.encryptAndSign(
          this.message,
          recepient.publicKey,
          this.privateKey,
          this.passphrase
        );
        recepient.messageSent = encryptedMessage;
        recepient.sessionKey = sessionKey;
      }
    },
    async decryptMessage(recepient) {
      const { text, valid } = await pgp.decryptAndVerify(
        recepient.messageSent,
        recepient.privateKey,
        recepient.passphrase,
        this.publicKey
      );
      recepient.decryptedMessage = text;
      recepient.validSignature = valid;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>


