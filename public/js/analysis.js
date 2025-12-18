// Analysis page functionality
document.addEventListener("DOMContentLoaded", function () {
  // Initialize charts
  initializeCharts();

  // Load comparison results if available
  loadComparisonResults();

  // Set up test button
  const runTestBtn = document.getElementById("run-test-btn");
  if (runTestBtn) {
    runTestBtn.addEventListener("click", runPerformanceTest);
  }
});

let speedChart, sizeChart;

function initializeCharts() {
  const speedCtx = document.getElementById("speedChart").getContext("2d");
  const sizeCtx = document.getElementById("sizeChart").getContext("2d");

  // Speed Comparison Chart
  speedChart = new Chart(speedCtx, {
    type: "bar",
    data: {
      labels: ["AES-256-CBC", "ChaCha20-Poly1305"],
      datasets: [
        {
          label: "Waktu Enkripsi (ms)",
          data: [0, 0],
          backgroundColor: [
            "rgba(255, 159, 64, 0.8)",
            "rgba(54, 162, 235, 0.8)",
          ],
          borderColor: ["rgb(255, 159, 64)", "rgb(54, 162, 235)"],
          borderWidth: 1,
        },
        {
          label: "Waktu Dekripsi (ms)",
          data: [0, 0],
          backgroundColor: [
            "rgba(255, 206, 86, 0.8)",
            "rgba(75, 192, 192, 0.8)",
          ],
          borderColor: ["rgb(255, 206, 86)", "rgb(75, 192, 192)"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: "Perbandingan Kecepatan" },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Waktu (milidetik)" },
        },
      },
    },
  });

  // Size Comparison Chart
  sizeChart = new Chart(sizeCtx, {
    type: "bar",
    data: {
      labels: ["Plaintext", "AES Ciphertext", "ChaCha Ciphertext"],
      datasets: [
        {
          label: "Ukuran Data (bytes)",
          data: [0, 0, 0],
          backgroundColor: [
            "rgba(75, 192, 192, 0.8)",
            "rgba(255, 159, 64, 0.8)",
            "rgba(54, 162, 235, 0.8)",
          ],
          borderColor: [
            "rgb(75, 192, 192)",
            "rgb(255, 159, 64)",
            "rgb(54, 162, 235)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: "Perbandingan Ukuran Data" },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Bytes" },
        },
      },
    },
  });
}

function loadComparisonResults() {
  const results = JSON.parse(localStorage.getItem("comparisonResults"));
  if (results && results.comparison) {
    updateCharts(results.comparison);
    updateResultsTable(results.comparison);
  }
}

function updateCharts(comparison) {
  speedChart.data.datasets[0].data = [
    comparison.aes.avgEncryptTime,
    comparison.chacha.avgEncryptTime,
  ];
  speedChart.data.datasets[1].data = [
    comparison.aes.avgDecryptTime,
    comparison.chacha.avgDecryptTime,
  ];
  speedChart.update();

  sizeChart.data.datasets[0].data = [
    comparison.aes.plaintextSize,
    comparison.aes.ciphertextSize,
    comparison.chacha.ciphertextSize,
  ];
  sizeChart.update();
}

function updateResultsTable(comparison) {
  document.getElementById("aes-encrypt").textContent =
    comparison.aes.avgEncryptTime.toFixed(3) + " ms";
  document.getElementById("aes-decrypt").textContent =
    comparison.aes.avgDecryptTime.toFixed(3) + " ms";
  document.getElementById("aes-size").textContent =
    comparison.aes.ciphertextSize + " bytes";
  document.getElementById("aes-overhead").textContent =
    comparison.aes.overhead + " bytes";

  document.getElementById("chacha-encrypt").textContent =
    comparison.chacha.avgEncryptTime.toFixed(3) + " ms";
  document.getElementById("chacha-decrypt").textContent =
    comparison.chacha.avgDecryptTime.toFixed(3) + " ms";
  document.getElementById("chacha-size").textContent =
    comparison.chacha.ciphertextSize + " bytes";
  document.getElementById("chacha-overhead").textContent =
    comparison.chacha.overhead + " bytes";

  document.getElementById("winner-encrypt").innerHTML = getWinnerBadge(
    comparison.aes.avgEncryptTime,
    comparison.chacha.avgEncryptTime,
    "aes",
    "chacha",
    true
  );
  document.getElementById("winner-decrypt").innerHTML = getWinnerBadge(
    comparison.aes.avgDecryptTime,
    comparison.chacha.avgDecryptTime,
    "aes",
    "chacha",
    true
  );
  document.getElementById("winner-size").innerHTML = getWinnerBadge(
    comparison.aes.ciphertextSize,
    comparison.chacha.ciphertextSize,
    "aes",
    "chacha",
    true
  );
  document.getElementById("winner-overhead").innerHTML = getWinnerBadge(
    comparison.aes.overhead,
    comparison.chacha.overhead,
    "aes",
    "chacha",
    true
  );
}

function getWinnerBadge(value1, value2, name1, name2, lowerIsBetter = false) {
  if (value1 === value2) return '<span class="badge bg-secondary">Sama</span>';
  const winner = (lowerIsBetter ? value1 < value2 : value1 > value2)
    ? name1
    : name2;
  const color = winner === "aes" ? "warning" : "info";
  const displayName = winner === "aes" ? "AES" : "ChaCha";
  return `<span class="badge bg-${color}">${displayName}</span>`;
}

async function runPerformanceTest() {
  const testBtn = document.getElementById("run-test-btn");
  const iterations =
    parseInt(document.getElementById("iterations").value) || 100;

  const originalText = testBtn.innerHTML;
  testBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm"></span> Menjalankan tes...';
  testBtn.disabled = true;

  try {
    const testData = {
      card_number: "4111111111111111",
      expiry_date: "12/27",
      cvv: "123",
      amount: 1500000,
      customer_email: "test@example.com",
      timestamp: new Date().toISOString(),
    };

    // PERBAIKAN: Gunakan path relatif, hapus http://localhost:3000
    const response = await fetch("/payment/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentData: testData,
        iterations: iterations,
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const results = await response.json();
    localStorage.setItem("comparisonResults", JSON.stringify(results));

    updateCharts(results.comparison);
    updateResultsTable(results.comparison);
    showTestSuccess();
  } catch (error) {
    console.error("Performance test error:", error);
    alert("Error menjalankan tes performa: " + error.message);
  } finally {
    testBtn.innerHTML = originalText;
    testBtn.disabled = false;
  }
}

function showTestSuccess() {
  const alertDiv = document.createElement("div");
  alertDiv.className =
    "alert alert-success alert-dismissible fade show position-fixed";
  alertDiv.style.cssText = `top: 20px; right: 20px; z-index: 9999; min-width: 300px;`;
  alertDiv.innerHTML = `
        <i class="bi bi-check-circle"></i> Tes performa berhasil dijalankan!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
  document.body.appendChild(alertDiv);
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}
