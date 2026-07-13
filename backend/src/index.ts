import express from "express";
import path from "path";
import dotenv from "dotenv";

import menuRoutes from "./routes/menuRoutes";
import mejaRoutes from "./routes/mejaRoutes";
import pesananRoutes from "./routes/pesananRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Jadikan folder uploads sebagai static folder agar gambar bisa diakses dari frontend Svelte
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Routing API
app.use("/api/menu", menuRoutes);
app.use("/api/meja", mejaRoutes);
app.use("/api/pesanan", pesananRoutes);

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
