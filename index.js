const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const apiRoutes = require("./routes/api");
const paymentRoutes = require("./routes/payment");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// 1. Daftarkan rute API & Payment
app.use("/api", apiRoutes);
app.use("/payment", paymentRoutes);

// 2. Layani file statis (CSS, JS, Gambar) dari folder public
app.use(express.static(path.join(__dirname, "public")));

// 3. Penanganan Halaman Utama (Fix NOT_FOUND)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 4. Fallback untuk SPA atau halaman lain agar tidak 404 saat di-refresh
app.get("*", (req, res) => {
  // Jika mencari file .html (seperti /cart)
  const requestedPath = req.path.endsWith("/") ? req.path : req.path + ".html";
  res.sendFile(path.join(__dirname, "public", requestedPath), (err) => {
    if (err) {
      // Jika file tidak ada, kembalikan ke index
      res.sendFile(path.join(__dirname, "public", "index.html"));
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Terjadi kesalahan pada server!" });
});

// Port untuk lokal
if (process.env.NODE_ENV !== "production") {
  const PORT = 3000;
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}

module.exports = app;
