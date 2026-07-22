import { mysqlTable, varchar, int, timestamp, mysqlEnum, boolean } from "drizzle-orm/mysql-core";

export const menu = mysqlTable("menu", {
  id: int("id").autoincrement().primaryKey(),
  nama_menu: varchar("nama_menu", { length: 100 }).notNull(),
  harga: int("harga").notNull(),
  stok: int("stok").notNull(),
  gambar: varchar("gambar", { length: 255 }), 
  is_active: boolean("is_active").default(true).notNull(), // Menyimpan status aktif menu
});

export const meja = mysqlTable("meja",{
  id: int("id").autoincrement().primaryKey(),
  status_meja: varchar("status_meja", { length: 50 }).notNull(),
});

export const kasir = mysqlTable("kasir", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), 
  nama_lengkap: varchar("nama_lengkap", { length: 100 }),
});

export const pesanan = mysqlTable("pesanan", {
  id: int("id").autoincrement().primaryKey(),
  id_kasir: int("id_kasir").references(() => kasir.id), // Mencatat kasir penanggung jawab
  id_meja: int("id_meja").references(() => meja.id),
  total_harga: int("total_harga").default(0),
  status_bayar: mysqlEnum("status_bayar", ["Belum Lunas", "Lunas"]).default("Belum Lunas"),
  tanggal: timestamp("tanggal").defaultNow(),
});

export const detailPesanan = mysqlTable("detail_pesanan", {
  id: int("id").autoincrement().primaryKey(),
  id_pesanan: int("id_pesanan").notNull().references(() => pesanan.id),
  id_menu: int("id_menu").notNull().references(() => menu.id),
  jumlah: int("jumlah").notNull(),
  subtotal: int("subtotal").notNull(),
});

