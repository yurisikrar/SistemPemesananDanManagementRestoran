<script lang="ts">
  import { onMount } from 'svelte';

  interface PesananItem {
    id: number;
    id_menu: number;
    jumlah: number;
    subtotal: number;
    nama_menu: string;
    harga: number;
  }

  interface Pesanan {
    id: number;
    no_pesanan: string;
    id_meja: number | null;
    nomor_meja: string;
    id_staf: number | null;
    nama_staf: string;
    menu: string;
    total_harga: number;
    status_bayar: 'Belum Lunas' | 'Lunas';
    status_pesanan: 'Diterima' | 'Proses' | 'Disajikan' | 'Selesai';
    tanggal?: string;
    items?: PesananItem[];
  }

  let riwayatPesanan = $state<Pesanan[]>([]);
  let isLoading = $state(true);

  // Ambil seluruh riwayat pesanan dari backend API
  async function fetchRiwayatPesanan() {
    isLoading = true;
    try {
      const res = await fetch('/api/pesanan/riwayat');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        riwayatPesanan = json.data;
      }
    } catch (e) {
      console.warn("Gagal mengambil riwayat pesanan dari backend:", e);
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    fetchRiwayatPesanan();
  });
</script>

<svelte:head>
  <title>Riwayat Pesanan | Resto KW</title>
</svelte:head>

<div>
  <h2 style="color: #1d3557; margin-top: 0;">Riwayat Pesanan</h2>
  <p style="color: var(--text-muted); margin-bottom: 2rem;">
    Daftar seluruh transaksi dan pesanan restoran (aktif maupun selesai).
  </p>

  <section class="card">
    <div class="card-content table-container">
      {#if isLoading}
        <div style="text-align: center; padding: 3rem; color: #666;">
          <span class="spinner" style="margin-right: 8px;"></span> Memuat riwayat pesanan...
        </div>
      {:else if riwayatPesanan.length === 0}
        <div style="text-align: center; padding: 3rem; color: #666;">
          Belum ada riwayat pesanan di database.
        </div>
      {:else}
        <table class="data-table">
          <thead>
            <tr>
              <th>No. Pesanan</th>
              <th>Layanan / Meja</th>
              <th>Detail Menu</th>
              <th>Total Tagihan</th>
              <th>Status Bayar</th>
              <th>Status Pesanan</th>
            </tr>
          </thead>
          <tbody>
            {#each riwayatPesanan as item (item.id)}
              <tr>
                <td><strong>{item.no_pesanan}</strong></td>
                <td>{item.nomor_meja}</td>
                <td>{item.menu}</td>
                <td><strong>Rp {Number(item.total_harga).toLocaleString('id-ID')}</strong></td>

                <!-- Status Bayar (Read-only Badge) -->
                <td>
                  <span class="badge {item.status_bayar === 'Lunas' ? 'badge-lunas' : 'badge-belum-lunas'}">
                    {item.status_bayar}
                  </span>
                </td>

                <!-- Status Pesanan (Read-only Badge) -->
                <td>
                  <span class="badge badge-status-{item.status_pesanan.toLowerCase()}">
                    {item.status_pesanan}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </section>
</div>

<style>
  .badge {
    display: inline-block;
    padding: 0.35rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-align: center;
  }

  .badge-lunas {
    background-color: #dcfce7;
    color: #15803d;
  }

  .badge-belum-lunas {
    background-color: #fee2e2;
    color: #b91c1c;
  }

  .badge-status-diterima {
    background-color: #e0f2fe;
    color: #0369a1;
  }

  .badge-status-proses {
    background-color: #fef3c7;
    color: #b45309;
  }

  .badge-status-disajikan {
    background-color: #f3e8ff;
    color: #6b21a8;
  }

  .badge-status-selesai {
    background-color: #d1fae5;
    color: #047857;
  }
</style>
