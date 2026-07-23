import { Request, Response } from "express";
import { db } from "../db";
import { staf } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 1. LOGIN (BCRYPT + JWT)
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body || {};

    const cleanUsername = username ? String(username).trim() : "";
    const cleanPassword = password ? String(password).trim() : "";

    if (!cleanUsername || !cleanPassword) {
      return res.status(400).json({
        success: false,
        message: "Username dan password wajib diisi",
      });
    }

    const result = await db.select().from(staf).where(eq(staf.username, cleanUsername)).limit(1);

    if (result.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah",
      });
    }

    const user = result[0];

    // Cek password dengan bcrypt (fallback ke plain text jika belum dihash)
    let isMatch = await bcrypt.compare(cleanPassword, user.password);
    if (!isMatch && user.password === cleanPassword) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah",
      });
    }

    // Generate Token JWT saat login berhasil
    const secret = process.env.JWT_SECRET || "restoran_secret_key";
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: {
        id: user.id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// 2. REGISTER STAF KASIR / DAPUR (BCRYPT HASH)
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, nama_lengkap, role } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username dan password wajib diisi",
      });
    }

    const existing = await db.select().from(staf).where(eq(staf.username, String(username).trim())).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username sudah terdaftar",
      });
    }

    const hashedPassword = await bcrypt.hash(String(password).trim(), 10);

    const [inserted] = await db.insert(staf).values({
      username: String(username).trim(),
      password: hashedPassword,
      nama_lengkap: nama_lengkap || username,
      role: (role as "Kasir" | "Dapur") || "Kasir",
    });

    return res.status(201).json({
      success: true,
      message: "Staf berhasil didaftarkan",
      data: {
        id: inserted.insertId,
        username,
        nama_lengkap: nama_lengkap || username,
        role: role || "Kasir"
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mendaftarkan staf",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
