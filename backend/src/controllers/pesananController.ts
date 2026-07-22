import { Request, Response } from "express";
import { db } from "../db";
import { pesanan, detailPesanan, meja, menu } from "../db/schema";
import { eq, and, ne } from "drizzle-orm";

export const buatPesanan = async (req: Request, res: Response) => {
  try {
    const { id_meja, total_harga, keranjang } = req.body;

    if (!keranjang || !Array.isArray(keranjang) || keranjang.length === 0) {
      return res.status(400).json({ success: false, message: "Keranjang belanja kosong" });
    }

    const newOrderId = await db.transaction(async (tx) => {
      const [insertResult] = await tx.insert(pesanan).values({
        id_meja: id_meja ? Number(id_meja) : null,
        total_harga: Number(total_harga),
        status_bayar: "Belum Lunas",
        status_pesanan: "Diterima"
      });
      
      const idPesananBaru = insertResult.insertId;

      const detailData = keranjang.map((item: any) => ({
        id_pesanan: idPesananBaru,
        id_menu: Number(item.id_menu),
        jumlah: Number(item.jumlah),
        subtotal: Number(item.subtotal)
      }));
      await tx.insert(detailPesanan).values(detailData);

      return idPesananBaru;
    });

    res.status(201).json({ 
      success: true, 
      message: "Pesanan berhasil dibuat, silakan lakukan pembayaran ke kasir", 
      data: { id_pesanan: newOrderId } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal membuat pesanan", error });
  }
};

export const konfirmasiPembayaran = async (req: Request, res: Response) => {
  try {
    const { id_pesanan, id_staf } = req.body;

    if (!id_pesanan) {
      return res.status(400).json({ success: false, message: "id_pesanan wajib diisi" });
    }

    await db.transaction(async (tx) => {
      const pesananData = await tx.select().from(pesanan).where(eq(pesanan.id, Number(id_pesanan))).limit(1);
      
      if (pesananData.length === 0) {
        throw new Error("Pesanan tidak ditemukan");
      }

      // Ambil detail pesanan untuk memotong stok menu
      const detail = await tx.select().from(detailPesanan).where(eq(detailPesanan.id_pesanan, Number(id_pesanan)));

      // Kurangi stok menu
      for (const item of detail) {
        const menuData = await tx.select().from(menu).where(eq(menu.id, item.id_menu));
        if (menuData.length > 0) {
          const stokBaru = menuData[0].stok - item.jumlah;
          await tx.update(menu).set({ stok: stokBaru }).where(eq(menu.id, item.id_menu));
        }
      }

      // Update status pesanan ke "Proses" dan bayar ke "Lunas"
      await tx.update(pesanan).set({ 
        status_bayar: "Lunas", 
        status_pesanan: "Proses",
        id_staf: id_staf ? Number(id_staf) : null
      }).where(eq(pesanan.id, Number(id_pesanan)));

      // Jika pesanan dine-in (ada id_meja), update meja menjadi "Tidak Tersedia"
      const idMeja = pesananData[0].id_meja;
      if (idMeja) {
        await tx.update(meja).set({ status: "Tidak Tersedia" }).where(eq(meja.id, idMeja));
      }
    });

    res.json({ success: true, message: "Pembayaran berhasil dikonfirmasi. Pesanan diteruskan ke dapur." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Gagal konfirmasi pembayaran", error });
  }
};

// 3. Update Status Pesanan (Dapur / Kasir)
export const updateStatusPesanan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status_pesanan } = req.body;

    const validStatus = ["Diterima", "Proses", "Disajikan", "Selesai"];
    if (!validStatus.includes(status_pesanan)) {
      return res.status(400).json({ success: false, message: "Status pesanan tidak valid" });
    }

    await db.transaction(async (tx) => {
      // Ambil data pesanan
      const pesananData = await tx.select().from(pesanan).where(eq(pesanan.id, Number(id))).limit(1);
      
      if (pesananData.length === 0) {
        throw new Error("Pesanan tidak ditemukan");
      }

      // Update status pesanan
      await tx.update(pesanan).set({ status_pesanan }).where(eq(pesanan.id, Number(id)));

      // Jika status diset ke "Selesai", kembalikan status meja ke "Tersedia"
      if (status_pesanan === "Selesai") {
        const idMeja = pesananData[0].id_meja;
        if (idMeja) {
          await tx.update(meja).set({ status: "Tersedia" }).where(eq(meja.id, idMeja));
        }
      }
    });

    res.json({ success: true, message: `Status pesanan berhasil diperbarui menjadi ${status_pesanan}` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Gagal memperbarui status pesanan", error });
  }
};

// 4. Lacak Pesanan (Pelanggan)
export const lacakPesanan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await db.select().from(pesanan).where(eq(pesanan.id, Number(id))).limit(1);

    if (order.length === 0) {
      return res.status(404).json({ success: false, message: "Pesanan tidak ditemukan" });
    }

    // Ambil rincian menu pesanan
    const items = await db.select({
      id: detailPesanan.id,
      jumlah: detailPesanan.jumlah,
      subtotal: detailPesanan.subtotal,
      nama_menu: menu.nama_menu,
      harga: menu.harga
    })
    .from(detailPesanan)
    .innerJoin(menu, eq(detailPesanan.id_menu, menu.id))
    .where(eq(detailPesanan.id_pesanan, Number(id)));

    res.status(200).json({
      success: true,
      data: {
        ...order[0],
        items
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal melacak pesanan", error });
  }
};

// 5. Get Pesanan untuk Dapur (Semua pesanan yang sedang diproses/disajikan dan sudah lunas)
export const getPesananDapur = async (req: Request, res: Response) => {
  try {
    // Ambil pesanan yang berstatus bayar "Lunas" dan status pesanan belum "Selesai"
    const activeOrders = await db.select()
      .from(pesanan)
      .where(
        and(
          eq(pesanan.status_bayar, "Lunas"),
          ne(pesanan.status_pesanan, "Selesai")
        )
      );

    const data = [];
    for (const order of activeOrders) {
      const items = await db.select({
        id: detailPesanan.id,
        jumlah: detailPesanan.jumlah,
        subtotal: detailPesanan.subtotal,
        nama_menu: menu.nama_menu,
      })
      .from(detailPesanan)
      .innerJoin(menu, eq(detailPesanan.id_menu, menu.id))
      .where(eq(detailPesanan.id_pesanan, order.id));

      data.push({
        ...order,
        items
      });
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil data pesanan dapur", error });
  }
};
