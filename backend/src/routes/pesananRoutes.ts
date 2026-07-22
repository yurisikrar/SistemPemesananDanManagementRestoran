import { Router } from "express";
import { 
  buatPesanan, 
  konfirmasiPembayaran,
  getPesananDapur,
  updateStatusPesanan,
  lacakPesanan
} from "../controllers/pesananController";

const router = Router();

router.post("/", buatPesanan);
router.post("/bayar", konfirmasiPembayaran);
router.get("/dapur", getPesananDapur);
router.put("/:id/status", updateStatusPesanan);
router.get("/:id/lacak", lacakPesanan);

export default router;
