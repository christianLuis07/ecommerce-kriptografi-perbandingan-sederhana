const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");

// PERBAIKAN: Gunakan process.cwd() agar Vercel mencari dari folder utama proyek
const productsPath = path.join(process.cwd(), "data", "products.json");

router.get("/products", async (req, res) => {
  try {
    const data = await fs.readFile(productsPath, "utf8");
    const products = JSON.parse(data);
    res.json(products);
  } catch (error) {
    console.error("Error reading products:", error);
    res.status(500).json({ error: "Gagal memuat data produk" });
  }
});

// Route produk berdasarkan ID
router.get("/products/:id", async (req, res) => {
  try {
    const data = await fs.readFile(productsPath, "utf8");
    const products = JSON.parse(data);
    const product = products.find((p) => p.id === parseInt(req.params.id));

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Produk tidak ditemukan" });
    }
  } catch (error) {
    res.status(500).json({ error: "Gagal memuat produk" });
  }
});

module.exports = router;
