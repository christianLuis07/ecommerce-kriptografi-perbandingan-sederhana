const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");

// Path ke data produk
const productsPath = path.join(__dirname, "../data/products.json");

// ambil semua produk
router.get("/products", async (req, res) => {
  try {
    const data = await fs.readFile(productsPath, "utf8");
    const products = JSON.parse(data);
    res.json(products);
  } catch (error) {
    console.error("Error reading products:", error);
    res.status(500).json({ error: "Failed to load products" });
  }
});

// ambil produk berdasarkan ID
router.get("/products/:id", async (req, res) => {
  try {
    const data = await fs.readFile(productsPath, "utf8");
    const products = JSON.parse(data);
    const product = products.find((p) => p.id === parseInt(req.params.id));

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    console.error("Error reading products:", error);
    res.status(500).json({ error: "Failed to load product" });
  }
});

module.exports = router;
