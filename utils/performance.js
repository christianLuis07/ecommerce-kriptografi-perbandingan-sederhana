async function measurePerformance(encryptFunc, decryptFunc, iterations = 100) {
  const encryptTimes = [];
  const decryptTimes = [];
  let encryptedData = null;
  let decryptParams = null;

  // --- TAMBAHAN: WARM UP (Pemanasan) ---
  // Jalankan 5x tanpa dicatat waktunya agar mesin "panas"
  for (let k = 0; k < 5; k++) {
    await encryptFunc();
  }
  // -------------------------------------

  // Measure encryption (Code kamu yang asli)
  for (let i = 0; i < iterations; i++) {
    const startEncrypt = process.hrtime.bigint();
    const result = await encryptFunc();
    const endEncrypt = process.hrtime.bigint();

    encryptTimes.push(Number(endEncrypt - startEncrypt) / 1_000_000);

    if (i === 0) {
      encryptedData = result;
      if (result.tag) {
        decryptParams = [result.encrypted, result.nonce, result.tag];
      } else {
        decryptParams = [result.encrypted, result.iv];
      }
    }
  }

  // Measure decryption (Code kamu yang asli)
  if (encryptedData && decryptParams) {
    for (let i = 0; i < iterations; i++) {
      const startDecrypt = process.hrtime.bigint();
      await decryptFunc(...decryptParams);
      const endDecrypt = process.hrtime.bigint();

      decryptTimes.push(Number(endDecrypt - startDecrypt) / 1_000_000);
    }
  }

  // ... sisa code perhitungan rata-rata ...
  // (Pastikan return object-nya tetap sama)
  const avgEncryptTime =
    encryptTimes.reduce((a, b) => a + b, 0) / encryptTimes.length;
  const avgDecryptTime =
    decryptTimes.reduce((a, b) => a + b, 0) / decryptTimes.length;

  return {
    avgEncryptTime,
    avgDecryptTime,
    minEncryptTime: Math.min(...encryptTimes),
    maxEncryptTime: Math.max(...encryptTimes),
    minDecryptTime: Math.min(...decryptTimes),
    maxDecryptTime: Math.max(...decryptTimes),
    iterations,
  };
}

module.exports = { measurePerformance };
