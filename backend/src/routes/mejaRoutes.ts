import { Router } from "express";
import { getSemuaMeja, kosongkanMeja } from "../controllers/mejaController";

const router = Router();

router.get("/", getSemuaMeja);
router.put("/:id/kosongkan", kosongkanMeja);

export default router;
