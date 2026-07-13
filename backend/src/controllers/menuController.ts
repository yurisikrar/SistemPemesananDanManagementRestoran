import { Request, Response } from "express";
import { db } from "../db";
import { menu } from "../db/schema";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs";

export const getSemuaMenu = async (req: Request, res: Response) => {
  try {
    const data = await db.select().from(menu);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

export const tambahMenu = async (req: Request, res: Response) => {
  try {
    const { nama_menu, harga, stok } = req.body;
    const gambar = req.file ? req.file.filename : null;

    await db.insert(menu).values({
      nama_menu,
      harga: Number(harga),
      stok: Number(stok),
      gambar
    });
    res.json({ success: true, message: "Menu berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

export const editMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nama_menu, harga, stok } = req.body;
    const gambarBaru = req.file ? req.file.filename : null;

    const dataLama = await db.select().from(menu).where(eq(menu.id, Number(id)));
    if (dataLama.length === 0) return res.status(404).json({ message: "Menu tidak ditemukan" });

    let namaGambar = dataLama[0].gambar;

    if (gambarBaru) {
      if (namaGambar) {
        const oldPath = path.join(__dirname, "../../public/uploads/menu", namaGambar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      namaGambar = gambarBaru;
    }

    await db.update(menu).set({
      nama_menu,
      harga: Number(harga),
      stok: Number(stok),
      gambar: namaGambar
    }).where(eq(menu.id, Number(id)));

    res.json({ success: true, message: "Menu berhasil diupdate" });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

export const hapusMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dataLama = await db.select().from(menu).where(eq(menu.id, Number(id)));
    
    if (dataLama.length > 0 && dataLama[0].gambar) {
      const oldPath = path.join(__dirname, "../../public/uploads/menu", dataLama[0].gambar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await db.delete(menu).where(eq(menu.id, Number(id)));
    res.json({ success: true, message: "Menu berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};
