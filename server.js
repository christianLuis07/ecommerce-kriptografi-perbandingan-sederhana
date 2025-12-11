const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const apiRoutes = require("./routes/api");
const paymentRoutes = require("./routes/payment");

const app = express();
const PORT = 3000;

// middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api", apiRoutes);
app.use("/payment", paymentRoutes);

// serve Static files (untuk frontend)
app.use(express.static("public"));

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "E-commerce Crypto Backend API",
    endpoints: {
      products: "/api/products",
      encrypt: "/payment/encrypt",
      compare: "/payment/compare",
      decrypt: "/payment/decrypt",
    },
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}`);
});
