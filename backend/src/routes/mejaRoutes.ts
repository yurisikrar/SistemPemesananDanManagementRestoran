import { Router } from "express";
import { 
  getAllMeja, 
  getMejaById, 
  createMeja, 
  updateMeja, 
  deleteMeja 
} from "../controllers/mejaController";

const router = Router();

router.get("/", getAllMeja);
router.get("/:id", getMejaById);
router.post("/", createMeja);
router.put("/:id", updateMeja);
router.delete("/:id", deleteMeja);

export default router;