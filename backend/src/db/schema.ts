import { mysqlTable, varchar, int, timestamp, mysqlEnum, boolean } from "drizzle-orm/mysql-core";

export const meja = mysqlTable("meja", {
  id: int("id").autoincrement().primaryKey(),
  nomor_meja: varchar("nomor_meja", { length: 10 }).notNull(),
  status: mysqlEnum("status", ["Tersedia", "Tidak Tersedia"]).default("Tersedia"),
});

export const menu = mysqlTable("menu", {
  id: int("id").autoincrement().primaryKey(),
  nama_menu: varchar("nama_menu", { length: 100 }).notNull(),
  harga: int("harga").notNull(),
  stok: int("stok").notNull(),
  gambar: varchar("gambar", { length: 255 }), 
  is_active: boolean("is_active").default(true).notNull(), 
});

export const staf = mysqlTable("staf", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), 
  nama_lengkap: varchar("nama_lengkap", { length: 100 }),
  role: mysqlEnum("role", ["Kasir", "Dapur"]).notNull(),
});

export const pesanan = mysqlTable("pesanan", {
  id: int("id").autoincrement().primaryKey(),
  id_meja: int("id_meja").references(() => meja.id), 
  id_staf: int("id_staf").references(() => staf.id), 
  total_harga: int("total_harga").default(0),
  status_bayar: mysqlEnum("status_bayar", ["Belum Lunas", "Lunas"]).default("Belum Lunas"),
  status_pesanan: mysqlEnum("status_pesanan", ["Diterima", "Proses", "Disajikan", "Selesai", "Cancel"]).default("Diterima"),
  tanggal: timestamp("tanggal").defaultNow(),
});

export const detailPesanan = mysqlTable("detail_pesanan", {
  id: int("id").autoincrement().primaryKey(),
  id_pesanan: int("id_pesanan").notNull().references(() => pesanan.id),
  id_menu: int("id_menu").notNull().references(() => menu.id),
  jumlah: int("jumlah").notNull(),
  subtotal: int("subtotal").notNull(),
});

