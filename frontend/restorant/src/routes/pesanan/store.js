import { writable } from 'svelte/store';

// Menyimpan data keranjang agar reaktif
export const keranjangStore = writable([
  { id: crypto.randomUUID(), id_menu: '', jumlah: 1, harga: 0 }
]);