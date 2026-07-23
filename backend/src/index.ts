import express from "express";
import path from "path";
import dotenv from "dotenv";

import menuRoutes from "./routes/menuRoutes";
import pesananRoutes from "./routes/pesananRoutes";
import authRoutes from "./routes/authRoutes";
import mejaRoutes from "./routes/mejaRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Jadikan folder uploads sebagai static folder agar gambar bisa diakses dari frontend Svelte
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

app.get('/', (req, res) => {
  res.send('Server Nyala Abangku');
});

// Routing API
app.use("/api/menu", menuRoutes);
app.use("/api/pesanan", pesananRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/meja", mejaRoutes);

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
