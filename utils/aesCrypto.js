const crypto = require("crypto");

class AESCrypto {
  constructor() {
    this.key = Buffer.from(
      "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
      "hex"
    );

    this.algorithm = "aes-256-cbc";
    this.ivLength = 16; // AES block size selalu 16 bytes
  }

  async encrypt(plaintext) {
    return new Promise((resolve, reject) => {
      try {
        const iv = crypto.randomBytes(this.ivLength);

        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

        let encrypted = cipher.update(plaintext, "utf8", "hex");
        encrypted += cipher.final("hex");

        resolve({
          encrypted: encrypted,
          iv: iv.toString("hex"),
          key: this.key.toString("hex"),
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Decrypt ciphertext
  async decrypt(ciphertext, ivHex) {
    return new Promise((resolve, reject) => {
      try {
        const iv = Buffer.from(ivHex, "hex");

        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

        let decrypted = decipher.update(ciphertext, "hex", "utf8");
        decrypted += decipher.final("utf8");

        resolve(decrypted);
      } catch (error) {
        // Handle error jika padding salah (sering terjadi jika key/IV salah)
        reject(new Error("Dekripsi gagal: " + error.message));
      }
    });
  }

  getKey() {
    return this.key.toString("hex");
  }
}

module.exports = new AESCrypto();
