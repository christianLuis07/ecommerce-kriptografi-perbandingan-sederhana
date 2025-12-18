// Main JavaScript for index.html
document.addEventListener("DOMContentLoaded", function () {
  // Load products
  loadProducts();

  // Update cart count
  updateCartCount();

  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});

async function loadProducts() {
  try {
    // PERBAIKAN: Gunakan URL relatif agar bekerja di localhost maupun Vercel
    const response = await fetch("/api/products");

    if (!response.ok) throw new Error("Network response was not ok");

    const products = await response.json();

    const container = document.getElementById("products-container");
    container.innerHTML = "";

    products.forEach((product) => {
      const productCard = `
                <div class="col-md-6 mb-4">
                    <div class="card product-card h-100">
                        <img src="${
                          product.image
                        }" class="card-img-top product-img" alt="${
        product.name
      }">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text flex-grow-1">${
                              product.description
                            }</p>
                            <div class="mt-auto">
                                <p class="product-price">Rp ${product.price.toLocaleString(
                                  "id-ID"
                                )}</p>
                                <p class="text-muted">Stok: ${
                                  product.stock
                                } unit</p>
                                <button class="btn btn-primary w-100" onclick="addToCart(${
                                  product.id
                                })">
                                    <i class="bi bi-cart-plus"></i> Tambah ke Keranjang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
      container.innerHTML += productCard;
    });
  } catch (error) {
    console.error("Error loading products:", error);
    document.getElementById("products-container").innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i>
                    Gagal memuat produk. Error: ${error.message}
                </div>
            </div>
        `;
  }
}

function addToCart(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showNotification("Produk ditambahkan ke keranjang!", "success");
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElements = document.querySelectorAll("#cart-count");
  cartCountElements.forEach((element) => {
    element.textContent = totalItems;
  });
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  notification.style.cssText = `top: 20px; right: 20px; z-index: 9999; min-width: 300px;`;
  notification.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

window.addToCart = addToCart;
window.showNotification = showNotification;
