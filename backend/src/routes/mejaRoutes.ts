import { Router } from "express";
import { 
  getAllMeja, 
  getMejaById, 
  createMeja, 
  updateMeja, 
  deleteMeja 
} from "../controllers/mejaController";

const router = Router();

router.get("/meja", getAllMeja);
router.get("/meja/:id", getMejaById);
router.post("/meja", createMeja);
router.put("/meja/:id", updateMeja);
router.delete("/meja/:id", deleteMeja);

export default router;