CREATE TABLE `detail_pesanan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_pesanan` int NOT NULL,
	`id_menu` int NOT NULL,
	`jumlah` int NOT NULL,
	`subtotal` int NOT NULL,
	CONSTRAINT `detail_pesanan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kasir` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(50) NOT NULL,
	`password` varchar(255) NOT NULL,
	`nama_lengkap` varchar(100),
	CONSTRAINT `kasir_id` PRIMARY KEY(`id`),
	CONSTRAINT `kasir_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `meja` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nomor_meja` varchar(10) NOT NULL,
	`status` enum('Tersedia','Ditempati') DEFAULT 'Tersedia',
	CONSTRAINT `meja_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nama_menu` varchar(100) NOT NULL,
	`harga` int NOT NULL,
	`stok` int NOT NULL,
	`gambar` varchar(255),
	CONSTRAINT `menu_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pesanan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_meja` int NOT NULL,
	`total_harga` int DEFAULT 0,
	`status_bayar` enum('Belum Lunas','Lunas') DEFAULT 'Belum Lunas',
	`tanggal` timestamp DEFAULT (now()),
	CONSTRAINT `pesanan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `detail_pesanan` ADD CONSTRAINT `detail_pesanan_id_pesanan_pesanan_id_fk` FOREIGN KEY (`id_pesanan`) REFERENCES `pesanan`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `detail_pesanan` ADD CONSTRAINT `detail_pesanan_id_menu_menu_id_fk` FOREIGN KEY (`id_menu`) REFERENCES `menu`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pesanan` ADD CONSTRAINT `pesanan_id_meja_meja_id_fk` FOREIGN KEY (`id_meja`) REFERENCES `meja`(`id`) ON DELETE no action ON UPDATE no action;