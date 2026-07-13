import { Router } from "express";
import { upload } from "../middlewares/upload";
import { getSemuaMenu, tambahMenu, editMenu, hapusMenu } from "../controllers/menuController";

const router = Router();

router.get("/", getSemuaMenu);
router.post("/", upload.single("gambar"), tambahMenu);
router.put("/:id", upload.single("gambar"), editMenu);
router.delete("/:id", hapusMenu);

export default router;
