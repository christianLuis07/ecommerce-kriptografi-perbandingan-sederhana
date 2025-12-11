// Cryptography functionality for checkout and analysis
document.addEventListener("DOMContentLoaded", function () {
  // For checkout page
  if (document.getElementById("payment-form")) {
    document
      .getElementById("payment-form")
      .addEventListener("submit", handlePayment);
    document
      .getElementById("compare-btn")
      .addEventListener("click", runComparison);
    document
      .getElementById("decrypt-btn")
      .addEventListener("click", handleDecryption);
    document
      .getElementById("view-analysis-btn")
      .addEventListener("click", () => {
        window.location.href = "analysis.html";
      });

    loadOrderSummary();
  }
});

async function loadOrderSummary() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    window.location.href = "cart.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/products");
    const products = await response.json();

    let summaryHTML = "";
    let total = 0;

    cart.forEach((cartItem) => {
      const product = products.find((p) => p.id === cartItem.id);
      if (product) {
        const itemTotal = product.price * cartItem.quantity;
        total += itemTotal;

        summaryHTML += `
                    <div class="d-flex justify-content-between mb-2">
                        <span>${product.name} x${cartItem.quantity}</span>
                        <span>Rp ${itemTotal.toLocaleString("id-ID")}</span>
                    </div>
                `;
      }
    });

    const tax = total * 0.1;
    const grandTotal = total + tax;

    summaryHTML += `
            <hr>
            <div class="d-flex justify-content-between">
                <strong>Subtotal</strong>
                <strong>Rp ${total.toLocaleString("id-ID")}</strong>
            </div>
            <div class="d-flex justify-content-between">
                <span>Pajak (10%)</span>
                <span>Rp ${tax.toLocaleString("id-ID")}</span>
            </div>
            <div class="d-flex justify-content-between text-success">
                <strong>Total</strong>
                <strong>Rp ${grandTotal.toLocaleString("id-ID")}</strong>
            </div>
        `;

    document.getElementById("order-summary").innerHTML = summaryHTML;

    // Store order data for encryption
    localStorage.setItem("orderTotal", grandTotal);
  } catch (error) {
    console.error("Error loading order summary:", error);
  }
}

async function handlePayment(event) {
  event.preventDefault();

  // Show loading
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm"></span> Mengenkripsi...';
  submitBtn.disabled = true;

  try {
    const algorithm = document.querySelector(
      'input[name="algorithm"]:checked'
    ).value;

    const paymentData = {
      card_number: document
        .getElementById("card-number")
        .value.replace(/\s/g, ""),
      expiry_date: document.getElementById("expiry-date").value,
      cvv: document.getElementById("cvv").value,
      amount: parseFloat(localStorage.getItem("orderTotal")) || 0,
      customer_email: document.getElementById("email").value,
      timestamp: new Date().toISOString(),
      items: JSON.parse(localStorage.getItem("cart")) || [],
    };

    // Encrypt the payment data
    const response = await fetch("http://localhost:3000/payment/encrypt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentData: paymentData,
        algorithm: algorithm,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Display results
    displayEncryptionResults(result, paymentData, algorithm);

    // Clear cart
    localStorage.removeItem("cart");
    localStorage.removeItem("orderTotal");
  } catch (error) {
    console.error("Encryption error:", error);
    alert("Error enkripsi data: " + error.message);
  } finally {
    // Restore button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

function displayEncryptionResults(result, originalData, algorithm) {
  const resultsCard = document.getElementById("results-card");
  resultsCard.style.display = "block";

  // Update algorithm badge
  const algorithmName = document.getElementById("algorithm-name");
  algorithmName.textContent = result.algorithm;
  algorithmName.className = `badge ${
    algorithm === "aes" ? "bg-warning" : "bg-info"
  }`;

  // Display plaintext
  document.getElementById("plaintext-data").textContent = JSON.stringify(
    originalData,
    null,
    2
  );

  // Display ciphertext
  document.getElementById("ciphertext-data").textContent = result.encryptedData;

  // Display IV/Nonce
  document.getElementById("iv-nonce").textContent = result.iv;

  // Update label based on algorithm
  document.getElementById("iv-label").textContent =
    algorithm === "aes" ? "Initialization Vector (IV):" : "Nonce:";

  // Display tag if present
  if (result.tag) {
    document.getElementById("tag-container").style.display = "block";
    document.getElementById("tag-data").textContent = result.tag;
  } else {
    document.getElementById("tag-container").style.display = "none";
  }

  // Store data for decryption test
  localStorage.setItem("lastEncryption", JSON.stringify(result));
  localStorage.setItem("lastAlgorithm", algorithm);

  // Scroll to results
  resultsCard.scrollIntoView({ behavior: "smooth" });
}

async function handleDecryption() {
  try {
    const lastEncryption = JSON.parse(localStorage.getItem("lastEncryption"));
    const algorithm = localStorage.getItem("lastAlgorithm");

    if (!lastEncryption) {
      alert("Tidak ada data terenkripsi tersimpan");
      return;
    }

    const response = await fetch("http://localhost:3000/payment/decrypt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        encryptedData: lastEncryption.encryptedData,
        iv: lastEncryption.iv,
        tag: lastEncryption.tag,
        algorithm: algorithm,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      document.getElementById("success-message").style.display = "block";

      // Show decrypted data
      setTimeout(() => {
        alert(
          "Dekripsi berhasil! Data asli:\n\n" +
            JSON.stringify(result.decryptedData, null, 2)
        );
      }, 500);
    }
  } catch (error) {
    console.error("Decryption error:", error);
    alert("Error dekripsi: " + error.message);
  }
}

async function runComparison() {
  try {
    const paymentData = {
      card_number:
        document.getElementById("card-number").value.replace(/\s/g, "") ||
        "4111111111111111",
      expiry_date: document.getElementById("expiry-date").value || "12/27",
      cvv: document.getElementById("cvv").value || "123",
      amount: parseFloat(localStorage.getItem("orderTotal")) || 1500000,
      customer_email:
        document.getElementById("email").value || "test@example.com",
      timestamp: new Date().toISOString(),
    };

    const response = await fetch("http://localhost:3000/payment/compare", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentData: paymentData,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const comparison = await response.json();

    // Store comparison results
    localStorage.setItem("comparisonResults", JSON.stringify(comparison));

    // Redirect to analysis page
    window.location.href = "analysis.html";
  } catch (error) {
    console.error("Comparison error:", error);
    alert("Error melakukan perbandingan: " + error.message);
  }
}
