const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const apiRoutes = require("./routes/api");
const paymentRoutes = require("./routes/payment");

const app = express();

// middleware
app.use(cors());
app.use(bodyParser.json());

// Routes API
app.use("/api", apiRoutes);
app.use("/payment", paymentRoutes);

// PENTING: Jangan gunakan app.get("/") yang mengirim JSON jika ingin menampilkan index.html
// Komentari atau hapus bagian ini:
/*
app.get("/", (req, res) => {
  res.json({ message: "E-commerce Crypto Backend API" });
});
*/

// Tetap gunakan ini untuk lokal, tapi Vercel akan menggunakan vercel.json untuk routing
app.use(express.static("public"));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Port opsional untuk lokal
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
