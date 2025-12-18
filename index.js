const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path"); // Tambahkan ini
const apiRoutes = require("./routes/api");
const paymentRoutes = require("./routes/payment");

const app = express();

// middleware
app.use(cors());
app.use(bodyParser.json());

// Routes API
app.use("/api", apiRoutes);
app.use("/payment", paymentRoutes);

// LAYANI FILE STATIS (CSS, JS, Gambar)
// Menggunakan path.join agar Vercel pasti menemukan foldernya
app.use(express.static(path.join(__dirname, "public")));

// ROUTE UTAMA UNTUK MENAMPILKAN FRONTEND
// Ini adalah solusi untuk error "Cannot GET /"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Tangani route lain (seperti /cart, /checkout) agar tidak 404 saat direfresh
app.get("*", (req, res, next) => {
  // Jika request bukan untuk API, arahkan ke index.html atau file di public
  if (!req.path.startsWith("/api") && !req.path.startsWith("/payment")) {
    res.sendFile(path.join(__dirname, "public", req.path + ".html"), (err) => {
      if (err) {
        res.sendFile(path.join(__dirname, "public", "index.html"));
      }
    });
  } else {
    next();
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Port untuk lokal (Vercel akan mengabaikan ini)
const PORT = 3000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
