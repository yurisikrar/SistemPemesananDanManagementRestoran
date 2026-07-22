import { Request, Response } from "express";
import { db } from "../db";
import { meja } from "../db/schema";
import { eq } from "drizzle-orm";

// GET All Meja
export const getAllMeja = async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(meja);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data meja",
      error,
    });
  }
};

// GET Meja by ID
export const getMejaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.select().from(meja).where(eq(meja.id, Number(id)));

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Meja tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data meja",
      error,
    });
  }
};

// POST New Meja
export const createMeja = async (req: Request, res: Response) => {
  try {
    const { status_meja } = req.body;

    if (!status_meja) {
      return res.status(400).json({
        success: false,
        message: "status_meja wajib diisi",
      });
    }

    const result = await db.insert(meja).values({ status_meja });
    
    return res.status(201).json({
      success: true,
      message: "Meja berhasil ditambahkan",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan meja",
      error,
    });
  }
};

// PATCH Update Meja
export const updateMeja = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status_meja } = req.body;

    if (!status_meja) {
      return res.status(400).json({
        success: false,
        message: "status_meja wajib diisi",
      });
    }

    const result = await db
      .update(meja)
      .set({ status_meja })
      .where(eq(meja.id, Number(id)));

    return res.status(200).json({
      success: true,
      message: "Status meja berhasil diperbarui",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui meja",
      error,
    });
  }
};

// DELETE Meja
export const deleteMeja = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await db.delete(meja).where(eq(meja.id, Number(id)));

    return res.status(200).json({
      success: true,
      message: "Meja berhasil dihapus",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus meja",
      error,
    });
  }
};