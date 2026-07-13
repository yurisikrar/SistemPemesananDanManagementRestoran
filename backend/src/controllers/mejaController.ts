import { Request, Response } from "express";
import { db } from "../db";
import { meja } from "../db/schema";
import { eq } from "drizzle-orm";

export const getSemuaMeja = async (req: Request, res: Response) => {
  try {
    const data = await db.select().from(meja);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

export const kosongkanMeja = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.update(meja).set({ status: "Tersedia" }).where(eq(meja.id, Number(id)));
    res.json({ success: true, message: "Meja berhasil dikosongkan" });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};
