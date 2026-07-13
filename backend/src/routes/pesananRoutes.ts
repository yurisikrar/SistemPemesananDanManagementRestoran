import { Router } from "express";
import { buatPesanan, konfirmasiPembayaran } from "../controllers/pesananController";

const router = Router();

router.post("/", buatPesanan);
router.post("/konfirmasi", konfirmasiPembayaran);

export default router;
