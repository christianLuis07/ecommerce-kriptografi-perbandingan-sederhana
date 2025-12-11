const express = require("express");
const router = express.Router();
const aesCrypto = require("../utils/aesCrypto");
const chachaCrypto = require("../utils/chachaCrypto");
const { measurePerformance } = require("../utils/performance");

// Simulate payment data encryption
router.post("/encrypt", async (req, res) => {
  try {
    const { paymentData, algorithm = "aes" } = req.body;

    if (!paymentData) {
      return res.status(400).json({ error: "Payment data is required" });
    }

    const paymentString = JSON.stringify(paymentData);
    let result;

    if (algorithm.toLowerCase() === "chacha") {
      result = await chachaCrypto.encrypt(paymentString);
    } else {
      result = await aesCrypto.encrypt(paymentString);
    }

    res.json({
      algorithm: algorithm === "aes" ? "AES-256-CBC" : "ChaCha20-Poly1305",
      encryptedData: result.encrypted,
      iv: result.iv || result.nonce, // IV untuk AES, nonce untuk ChaCha
      tag: result.tag, // Hanya untuk ChaCha
      keySize: algorithm === "aes" ? "256-bit" : "256-bit",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Encryption error:", error);
    res
      .status(500)
      .json({ error: "Encryption failed", details: error.message });
  }
});

// Compare performance of both algorithms
router.post("/compare", async (req, res) => {
  try {
    const { paymentData } = req.body;

    if (!paymentData) {
      return res.status(400).json({ error: "Payment data is required" });
    }

    const paymentString = JSON.stringify(paymentData);
    const testIterations = 100; // Jumlah iterasi untuk pengukuran akurat

    // Ukur performa AES
    const aesResults = await measurePerformance(
      () => aesCrypto.encrypt(paymentString),
      () => aesCrypto.decrypt,
      testIterations
    );

    // Ukur performa ChaCha
    const chachaResults = await measurePerformance(
      () => chachaCrypto.encrypt(paymentString),
      () => chachaCrypto.decrypt,
      testIterations
    );

    // Hitung ciphertext size
    const aesEncrypted = await aesCrypto.encrypt(paymentString);
    const chachaEncrypted = await chachaCrypto.encrypt(paymentString);

    res.json({
      comparison: {
        aes: {
          name: "AES-256-CBC",
          avgEncryptTime: aesResults.avgEncryptTime,
          avgDecryptTime: aesResults.avgDecryptTime,
          ciphertextSize: Buffer.from(aesEncrypted.encrypted, "hex").length,
          plaintextSize: Buffer.from(paymentString).length,
          overhead:
            Buffer.from(aesEncrypted.encrypted, "hex").length -
            Buffer.from(paymentString).length,
          blockSize: "128-bit",
          mode: "CBC",
        },
        chacha: {
          name: "ChaCha20-Poly1305",
          avgEncryptTime: chachaResults.avgEncryptTime,
          avgDecryptTime: chachaResults.avgDecryptTime,
          ciphertextSize: Buffer.from(chachaEncrypted.encrypted, "hex").length,
          plaintextSize: Buffer.from(paymentString).length,
          overhead:
            Buffer.from(chachaEncrypted.encrypted, "hex").length -
            Buffer.from(paymentString).length,
          blockSize: "Stream cipher",
          mode: "AEAD (Authenticated)",
        },
      },
      recommendations: {
        fasterEncryption:
          aesResults.avgEncryptTime < chachaResults.avgEncryptTime
            ? "AES"
            : "ChaCha",
        fasterDecryption:
          aesResults.avgDecryptTime < chachaResults.avgDecryptTime
            ? "AES"
            : "ChaCha",
        smallerCiphertext:
          Buffer.from(aesEncrypted.encrypted, "hex").length <
          Buffer.from(chachaEncrypted.encrypted, "hex").length
            ? "AES"
            : "ChaCha",
        moreSecure: "ChaCha20-Poly1305 (AEAD provides authentication)",
      },
    });
  } catch (error) {
    console.error("Comparison error:", error);
    res
      .status(500)
      .json({ error: "Comparison failed", details: error.message });
  }
});

// Decrypt data
router.post("/decrypt", async (req, res) => {
  try {
    const { encryptedData, iv, tag, algorithm = "aes" } = req.body;

    if (!encryptedData || !iv) {
      return res
        .status(400)
        .json({ error: "Encrypted data and IV/nonce are required" });
    }

    let decrypted;
    if (algorithm.toLowerCase() === "chacha") {
      if (!tag) {
        return res
          .status(400)
          .json({ error: "Tag is required for ChaCha20-Poly1305" });
      }
      decrypted = await chachaCrypto.decrypt(encryptedData, iv, tag);
    } else {
      decrypted = await aesCrypto.decrypt(encryptedData, iv);
    }

    // Parse kembali ke JSON
    const parsedData = JSON.parse(decrypted);

    res.json({
      algorithm: algorithm === "aes" ? "AES-256-CBC" : "ChaCha20-Poly1305",
      decryptedData: parsedData,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Decryption error:", error);
    res.status(500).json({
      error: "Decryption failed",
      details: error.message,
      possibleReasons: [
        "Wrong key (in simulation, key is generated per session)",
        "Corrupted ciphertext",
        "Invalid IV/nonce",
        "Missing authentication tag (for ChaCha)",
      ],
    });
  }
});

module.exports = router;
