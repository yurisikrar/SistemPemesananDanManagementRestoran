import { Router } from "express";
import { 
  buatPesanan, 
  getPesananAktif,
  updatePesanan,
  konfirmasiPembayaran,
  getPesananDapur,
  updateStatusPesanan,
  lacakPesanan
} from "../controllers/pesananController";

const router = Router();

router.post("/", buatPesanan);
router.get("/aktif", getPesananAktif);
router.put("/:id", updatePesanan);
router.post("/bayar", konfirmasiPembayaran);
router.get("/dapur", getPesananDapur);
router.put("/:id/status", updateStatusPesanan);
router.get("/:id/lacak", lacakPesanan);

export default router;
