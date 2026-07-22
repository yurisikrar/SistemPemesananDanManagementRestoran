import { Request, Response } from "express";
import { db } from "../db";
import { staf } from "../db/schema";
import { eq } from "drizzle-orm";

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username dan password wajib diisi",
      });
    }

    const result = await db.select().from(staf).where(eq(staf.username, username)).limit(1);

    if (result.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah",
      });
    }

    const user = result[0];

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: {
        id: user.id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error,
    });
  }
};
