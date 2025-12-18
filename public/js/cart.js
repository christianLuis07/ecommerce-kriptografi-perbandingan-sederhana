// Cart functionality - FIXED VERSION FOR VERCEL
document.addEventListener("DOMContentLoaded", function () {
  loadCartItems();

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", goToCheckout);
  }
});

async function loadCartItems() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    // Show empty cart message
    const cartItemsContainer = document.getElementById("cart-items");
    if (cartItemsContainer) {
      cartItemsContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-cart-x display-1 text-muted"></i>
                <h5 class="mt-3">Keranjang kosong</h5>
                <p>Silakan tambahkan produk dari halaman beranda</p>
                <a href="index.html" class="btn btn-primary">
                    <i class="bi bi-arrow-left"></i> Kembali ke Beranda
                </a>
            </div>
        `;
    }
    updateCartSummary([], []);
    updateCheckoutButton();
    return;
  }

  try {
    // PERBAIKAN: Gunakan URL relatif agar bekerja di Vercel
    const response = await fetch("/api/products");

    if (!response.ok)
      throw new Error("Gagal mengambil data produk dari server");

    const products = await response.json();
    const cartItemsContainer = document.getElementById("cart-items");
    let itemsHTML = "";

    cart.forEach((cartItem) => {
      const product = products.find((p) => p.id === cartItem.id);

      if (product) {
        const itemTotal = product.price * cartItem.quantity;

        itemsHTML += `
                    <div class="cart-item mb-3 p-3 border rounded fade-in">
                        <div class="row align-items-center">
                            <div class="col-md-2">
                                <img src="${
                                  product.image
                                }" class="img-fluid rounded" alt="${
          product.name
        }" style="max-height: 80px; width: auto;">
                            </div>
                            <div class="col-md-4">
                                <h6 class="mb-1 fw-bold">${product.name}</h6>
                                <small class="text-muted">${
                                  product.category
                                }</small>
                                <p class="mb-0 mt-1">
                                    <small>Harga satuan: Rp ${product.price.toLocaleString(
                                      "id-ID"
                                    )}</small>
                                </p>
                            </div>
                            <div class="col-md-3">
                                <div class="input-group input-group-sm" style="width: 120px;">
                                    <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity(${
                                      product.id
                                    }, -1)">
                                        <i class="bi bi-dash"></i>
                                    </button>
                                    <input type="text" class="form-control text-center" value="${
                                      cartItem.quantity
                                    }" readonly style="background-color: #f8f9fa;">
                                    <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity(${
                                      product.id
                                    }, 1)">
                                        <i class="bi bi-plus"></i>
                                    </button>
                                </div>
                                <small class="text-muted d-block mt-1">Jumlah: ${
                                  cartItem.quantity
                                }</small>
                            </div>
                            <div class="col-md-2">
                                <h6 class="mb-0 text-success fw-bold">Rp ${itemTotal.toLocaleString(
                                  "id-ID"
                                )}</h6>
                                <small class="text-muted">${
                                  cartItem.quantity
                                } x Rp ${product.price.toLocaleString(
          "id-ID"
        )}</small>
                            </div>
                            <div class="col-md-1">
                                <button class="btn btn-outline-danger btn-sm" onclick="removeFromCart(${
                                  product.id
                                })" title="Hapus dari keranjang">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
      }
    });

    if (cartItemsContainer) {
      cartItemsContainer.innerHTML = itemsHTML;
    }

    // Update summary with actual prices
    updateCartSummary(cart, products);
    updateCheckoutButton();
  } catch (error) {
    console.error("Error loading cart:", error);
    const cartItemsContainer = document.getElementById("cart-items");
    if (cartItemsContainer) {
      cartItemsContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i>
                Gagal memuat keranjang. Error: ${error.message}
                <br>
                <button class="btn btn-sm btn-outline-secondary mt-2" onclick="loadCartItems()">
                    <i class="bi bi-arrow-clockwise"></i> Coba Lagi
                </button>
            </div>
        `;
    }
  }
}

function updateQuantity(productId, change) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const itemIndex = cart.findIndex((item) => item.id === productId);

  if (itemIndex !== -1) {
    cart[itemIndex].quantity += change;

    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    loadCartItems();
    updateCartCountNavbar();
  }
}

function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter((item) => item.id !== productId);

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCartItems();
  updateCartCountNavbar();
}

function updateCartSummary(cart, products) {
  const subtotalEl = document.getElementById("subtotal");
  const taxEl = document.getElementById("tax");
  const totalEl = document.getElementById("total");

  if (!cart || cart.length === 0 || !products || products.length === 0) {
    if (subtotalEl) subtotalEl.textContent = "Rp 0";
    if (taxEl) taxEl.textContent = "Rp 0";
    if (totalEl) totalEl.textContent = "Rp 0";
    return;
  }

  let subtotal = 0;
  cart.forEach((cartItem) => {
    const product = products.find((p) => p.id === cartItem.id);
    if (product) {
      subtotal += product.price * cartItem.quantity;
    }
  });

  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  if (subtotalEl)
    subtotalEl.textContent = "Rp " + subtotal.toLocaleString("id-ID");
  if (taxEl) taxEl.textContent = "Rp " + tax.toLocaleString("id-ID");
  if (totalEl) totalEl.textContent = "Rp " + total.toLocaleString("id-ID");

  localStorage.setItem("cartSubtotal", subtotal);
  localStorage.setItem("cartTotal", total);
}

function updateCheckoutButton() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const checkoutBtn = document.getElementById("checkout-btn");

  if (!checkoutBtn) return;

  if (cart.length > 0) {
    checkoutBtn.disabled = false;
    checkoutBtn.classList.remove("btn-secondary");
    checkoutBtn.classList.add("btn-primary");
    checkoutBtn.innerHTML = '<i class="bi bi-lock"></i> Lanjut ke Checkout';
  } else {
    checkoutBtn.disabled = true;
    checkoutBtn.classList.remove("btn-primary");
    checkoutBtn.classList.add("btn-secondary");
    checkoutBtn.innerHTML = "Keranjang Kosong";
  }
}

function goToCheckout() {
  window.location.href = "checkout.html";
}

function updateCartCountNavbar() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartCountElements = document.querySelectorAll("#cart-count");
  cartCountElements.forEach((element) => {
    element.textContent = totalItems;
  });
}

// Export functions for global access (inline onclick)
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.loadCartItems = loadCartItems;
