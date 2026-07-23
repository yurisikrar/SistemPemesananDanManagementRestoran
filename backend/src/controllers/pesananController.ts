import { Request, Response } from "express";
import { db } from "../db";
import { pesanan, detailPesanan, meja, menu, staf } from "../db/schema";
import { eq, and, ne } from "drizzle-orm";

// 1. Buat Pesanan Baru (Pelanggan)
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
      message: "Pesanan berhasil dibuat", 
      data: { id_pesanan: newOrderId } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal membuat pesanan", error });
  }
};

// 2. Get Pesanan Aktif untuk Dashboard Kasir (TIDAK Menampilkan Status "Selesai")
export const getPesananAktif = async (req: Request, res: Response) => {
  try {
    // Hanya ambil pesanan yang status_pesanan BUKAN "Selesai"
    const activeOrders = await db.select()
      .from(pesanan)
      .where(ne(pesanan.status_pesanan, "Selesai"));

    const data = [];
    for (const order of activeOrders) {
      // Detail menu per pesanan
      const items = await db.select({
        id: detailPesanan.id,
        id_menu: detailPesanan.id_menu,
        jumlah: detailPesanan.jumlah,
        subtotal: detailPesanan.subtotal,
        nama_menu: menu.nama_menu,
        harga: menu.harga
      })
      .from(detailPesanan)
      .innerJoin(menu, eq(detailPesanan.id_menu, menu.id))
      .where(eq(detailPesanan.id_pesanan, order.id));

      // Nama Meja
      let nomorMeja = "Take Away (Bungkus)";
      if (order.id_meja) {
        const mejaData = await db.select().from(meja).where(eq(meja.id, order.id_meja)).limit(1);
        if (mejaData.length > 0) {
          nomorMeja = mejaData[0].nomor_meja;
        }
      }

      // Nama Kasir/Staf yang menangani
      let namaStaf = "-";
      if (order.id_staf) {
        const stafData = await db.select().from(staf).where(eq(staf.id, order.id_staf)).limit(1);
        if (stafData.length > 0) {
          namaStaf = stafData[0].nama_lengkap || stafData[0].username;
        }
      }

      const menuString = items.map(i => `${i.nama_menu} (${i.jumlah}x)`).join(", ");

      data.push({
        id: order.id,
        no_pesanan: `#${order.id}`,
        id_meja: order.id_meja,
        nomor_meja: nomorMeja,
        id_staf: order.id_staf,
        nama_staf: namaStaf,
        menu: menuString || "Menu Kosong",
        total_harga: order.total_harga,
        status_bayar: order.status_bayar,
        status_pesanan: order.status_pesanan,
        tanggal: order.tanggal,
        items
      });
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil data pesanan aktif", error });
  }
};

// 3. Update Pesanan dari Dashboard Kasir (Status Bayar, Status Pesanan, Staf)
export const updatePesanan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status_bayar, status_pesanan, id_staf } = req.body;

    await db.transaction(async (tx) => {
      const pesananData = await tx.select().from(pesanan).where(eq(pesanan.id, Number(id))).limit(1);

      if (pesananData.length === 0) {
        throw new Error("Pesanan tidak ditemukan");
      }

      const updatePayload: any = {};
      if (status_bayar) updatePayload.status_bayar = status_bayar;
      if (status_pesanan) updatePayload.status_pesanan = status_pesanan;
      if (id_staf) updatePayload.id_staf = Number(id_staf);

      // Jika diset ke Selesai tetapi Belum Lunas, gagalkan
      const finalStatusBayar = status_bayar || pesananData[0].status_bayar;
      if (status_pesanan === "Selesai" && finalStatusBayar !== "Lunas") {
        throw new Error("Pesanan tidak dapat diselesaikan karena pembayaran Belum Lunas!");
      }

      // Potong stok menu jika status bayar berubah menjadi Lunas
      if (status_bayar === "Lunas" && pesananData[0].status_bayar !== "Lunas") {
        const detail = await tx.select().from(detailPesanan).where(eq(detailPesanan.id_pesanan, Number(id)));
        for (const item of detail) {
          const menuData = await tx.select().from(menu).where(eq(menu.id, item.id_menu));
          if (menuData.length > 0) {
            const stokBaru = Math.max(0, menuData[0].stok - item.jumlah);
            await tx.update(menu).set({ stok: stokBaru }).where(eq(menu.id, item.id_menu));
          }
        }
      }

      await tx.update(pesanan).set(updatePayload).where(eq(pesanan.id, Number(id)));

      // Jika status diset ke "Selesai", kembalikan status meja ke "Tersedia"
      if (status_pesanan === "Selesai") {
        const idMeja = pesananData[0].id_meja;
        if (idMeja) {
          await tx.update(meja).set({ status: "Tersedia" }).where(eq(meja.id, idMeja));
        }
      }
    });

    res.json({ success: true, message: "Pesanan berhasil diperbarui" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Gagal memperbarui pesanan" });
  }
};

// 4. Konfirmasi Pembayaran
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

      const detail = await tx.select().from(detailPesanan).where(eq(detailPesanan.id_pesanan, Number(id_pesanan)));

      for (const item of detail) {
        const menuData = await tx.select().from(menu).where(eq(menu.id, item.id_menu));
        if (menuData.length > 0) {
          const stokBaru = Math.max(0, menuData[0].stok - item.jumlah);
          await tx.update(menu).set({ stok: stokBaru }).where(eq(menu.id, item.id_menu));
        }
      }

      await tx.update(pesanan).set({ 
        status_bayar: "Lunas", 
        status_pesanan: "Proses",
        id_staf: id_staf ? Number(id_staf) : null
      }).where(eq(pesanan.id, Number(id_pesanan)));

      const idMeja = pesananData[0].id_meja;
      if (idMeja) {
        await tx.update(meja).set({ status: "Tidak Tersedia" }).where(eq(meja.id, idMeja));
      }
    });

    res.json({ success: true, message: "Pembayaran berhasil dikonfirmasi" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Gagal konfirmasi pembayaran", error });
  }
};

// 5. Update Status Pesanan Singkat
export const updateStatusPesanan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status_pesanan } = req.body;

    const validStatus = ["Diterima", "Proses", "Disajikan", "Selesai"];
    if (!validStatus.includes(status_pesanan)) {
      return res.status(400).json({ success: false, message: "Status pesanan tidak valid" });
    }

    await db.transaction(async (tx) => {
      const pesananData = await tx.select().from(pesanan).where(eq(pesanan.id, Number(id))).limit(1);
      
      if (pesananData.length === 0) {
        throw new Error("Pesanan tidak ditemukan");
      }

      await tx.update(pesanan).set({ status_pesanan }).where(eq(pesanan.id, Number(id)));

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

// 6. Lacak Pesanan (Pelanggan)
export const lacakPesanan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await db.select().from(pesanan).where(eq(pesanan.id, Number(id))).limit(1);

    if (order.length === 0) {
      return res.status(404).json({ success: false, message: "Pesanan tidak ditemukan" });
    }

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

// 7. Get Pesanan untuk Dapur
export const getPesananDapur = async (req: Request, res: Response) => {
  try {
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
