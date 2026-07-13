import { mysqlTable, serial, varchar, int, timestamp, enum as mysqlEnum } from "drizzle-orm/mysql-core";

export const meja = mysqlTable("meja", {
  id: serial("id").primaryKey(),
  nomor_meja: varchar("nomor_meja", { length: 10 }).notNull(),
  status: mysqlEnum("status", ["Tersedia", "Ditempati"]).default("Tersedia"),
});

export const menu = mysqlTable("menu", {
  id: serial("id").primaryKey(),
  nama_menu: varchar("nama_menu", { length: 100 }).notNull(),
  harga: int("harga").notNull(),
  stok: int("stok").notNull(),
  gambar: varchar("gambar", { length: 255 }), 
});

export const pesanan = mysqlTable("pesanan", {
  id: serial("id").primaryKey(),
  id_meja: int("id_meja").notNull().references(() => meja.id),
  total_harga: int("total_harga").default(0),
  status_bayar: mysqlEnum("status_bayar", ["Belum Lunas", "Lunas"]).default("Belum Lunas"),
  tanggal: timestamp("tanggal").defaultNow(),
});

export const detailPesanan = mysqlTable("detail_pesanan", {
  id: serial("id").primaryKey(),
  id_pesanan: int("id_pesanan").notNull().references(() => pesanan.id),
  id_menu: int("id_menu").notNull().references(() => menu.id),
  jumlah: int("jumlah").notNull(),
  subtotal: int("subtotal").notNull(),
});

export const kasir = mysqlTable("kasir", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), 
  nama_lengkap: varchar("nama_lengkap", { length: 100 }),
});