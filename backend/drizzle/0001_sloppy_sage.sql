CREATE TABLE `staf` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(50) NOT NULL,
	`password` varchar(255) NOT NULL,
	`nama_lengkap` varchar(100),
	`role` enum('Kasir','Dapur') NOT NULL,
	CONSTRAINT `staf_id` PRIMARY KEY(`id`),
	CONSTRAINT `staf_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
DROP TABLE `kasir`;--> statement-breakpoint
ALTER TABLE `meja` MODIFY COLUMN `status` enum('Tersedia','Tidak Tersedia') DEFAULT 'Tersedia';--> statement-breakpoint
ALTER TABLE `pesanan` MODIFY COLUMN `id_meja` int;--> statement-breakpoint
ALTER TABLE `menu` ADD `is_active` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `pesanan` ADD `id_staf` int;--> statement-breakpoint
ALTER TABLE `pesanan` ADD `status_pesanan` enum('Diterima','Proses','Disajikan','Selesai') DEFAULT 'Diterima';--> statement-breakpoint
ALTER TABLE `pesanan` ADD CONSTRAINT `pesanan_id_staf_staf_id_fk` FOREIGN KEY (`id_staf`) REFERENCES `staf`(`id`) ON DELETE no action ON UPDATE no action;