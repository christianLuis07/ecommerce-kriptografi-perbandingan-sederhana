async function measurePerformance(encryptFunc, decryptFunc, iterations = 100) {
  const encryptTimes = [];
  const decryptTimes = [];
  let encryptedData = null;
  let decryptParams = null;

  // Measure encryption
  for (let i = 0; i < iterations; i++) {
    const startEncrypt = process.hrtime.bigint();
    const result = await encryptFunc();
    const endEncrypt = process.hrtime.bigint();

    encryptTimes.push(Number(endEncrypt - startEncrypt) / 1_000_000); // Convert to milliseconds

    // Store first result for decryption test
    if (i === 0) {
      encryptedData = result;

      // Prepare parameters for decryption based on algorithm
      if (result.tag) {
        // ChaCha
        decryptParams = [result.encrypted, result.nonce, result.tag];
      } else {
        // AES
        decryptParams = [result.encrypted, result.iv];
      }
    }
  }

  // Measure decryption
  if (encryptedData && decryptParams) {
    for (let i = 0; i < iterations; i++) {
      const startDecrypt = process.hrtime.bigint();
      await decryptFunc(...decryptParams);
      const endDecrypt = process.hrtime.bigint();

      decryptTimes.push(Number(endDecrypt - startDecrypt) / 1_000_000);
    }
  }

  // Calculate averages
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
