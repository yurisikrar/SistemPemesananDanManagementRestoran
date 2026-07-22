import { Request, Response } from "express";
import { db } from "../db";
import { pesanan, detailPesanan, menu } from "../db/schema";
import { eq } from "drizzle-orm";

export const buatPesanan = async (req: Request, res: Response) => {
  try {
    const { total_harga, keranjang } = req.body;
    // keranjang format: [{ id_menu: 1, jumlah: 2, subtotal: 50000 }]

    await db.transaction(async (tx) => {
      // 1. Buat pesanan utama
      const [insertResult] = await tx.insert(pesanan).values({
        total_harga,
        status_bayar: "Belum Lunas"
      });
      
      const idPesananBaru = insertResult.insertId;

      // 2. Masukkan ke detail pesanan
      const detailData = keranjang.map((item: any) => ({
        id_pesanan: idPesananBaru,
        id_menu: item.id_menu,
        jumlah: item.jumlah,
        subtotal: item.subtotal
      }));
      await tx.insert(detailPesanan).values(detailData);
    });

    res.json({ success: true, message: "Pesanan berhasil dibuat, silakan ke kasir" });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

export const konfirmasiPembayaran = async (req: Request, res: Response) => {
  try {
    const { id_pesanan } = req.body;

    await db.transaction(async (tx) => {
      // 1. Ambil detail pesanan
      const detail = await tx.select().from(detailPesanan).where(eq(detailPesanan.id_pesanan, id_pesanan));

      // 2. Kurangi stok menu
      for (const item of detail) {
        const menuData = await tx.select().from(menu).where(eq(menu.id, item.id_menu));
        if (menuData.length > 0) {
          const stokBaru = menuData[0].stok - item.jumlah;
          await tx.update(menu).set({ stok: stokBaru }).where(eq(menu.id, item.id_menu));
        }
      }

      // 3. Update status pesanan
      await tx.update(pesanan).set({ status_bayar: "Lunas" }).where(eq(pesanan.id, id_pesanan));
    });

    res.json({ success: true, message: "Pembayaran berhasil" });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};
