const crypto = require("crypto");

class ChaChaCrypto {
  constructor() {
    this.key = Buffer.from(
      "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
      "hex"
    );

    this.algorithm = "chacha20-poly1305";
    this.nonceLength = 12; // 12 bytes for ChaCha20
  }

  // Encrypt plaintext
  async encrypt(plaintext) {
    return new Promise((resolve, reject) => {
      try {
        // Tetap Random Nonce (Ini WAJIB random setiap enkripsi)
        const nonce = crypto.randomBytes(this.nonceLength);

        // Create cipher
        const cipher = crypto.createCipheriv(this.algorithm, this.key, nonce, {
          authTagLength: 16,
        });

        // Encrypt
        let encrypted = cipher.update(plaintext, "utf8", "hex");
        encrypted += cipher.final("hex");

        // Get authentication tag
        const tag = cipher.getAuthTag();

        resolve({
          encrypted: encrypted,
          nonce: nonce.toString("hex"),
          tag: tag.toString("hex"),
          key: this.key.toString("hex"),
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Decrypt ciphertext
  async decrypt(ciphertext, nonceHex, tagHex) {
    return new Promise((resolve, reject) => {
      try {
        const nonce = Buffer.from(nonceHex, "hex");
        const tag = Buffer.from(tagHex, "hex");

        // Create decipher
        const decipher = crypto.createDecipheriv(
          this.algorithm,
          this.key,
          nonce,
          {
            authTagLength: 16,
          }
        );

        // Set authentication tag
        decipher.setAuthTag(tag);

        // Decrypt
        let decrypted = decipher.update(ciphertext, "hex", "utf8");
        decrypted += decipher.final("utf8");

        resolve(decrypted);
      } catch (error) {
        // Pesan error lebih jelas
        reject(
          new Error(
            "Dekripsi ChaCha gagal (Cek Key/Nonce/Tag): " + error.message
          )
        );
      }
    });
  }

  // Get current key
  getKey() {
    return this.key.toString("hex");
  }
}

// Export singleton instance
module.exports = new ChaChaCrypto();
