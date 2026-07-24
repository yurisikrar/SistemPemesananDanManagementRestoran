<script lang="ts">
  import './lacakpesanan.css';

  interface DetailItem {
    id: number;
    jumlah: number;
    subtotal: number;
    nama_menu: string;
    harga: number;
  }

  interface Pesanan {
    id: number;
    id_meja: number | null;
    id_staf: number | null;
    total_harga: number;
    status_bayar: 'Belum Lunas' | 'Lunas';
    status_pesanan: 'Diterima' | 'Proses' | 'Disajikan' | 'Selesai';
    tanggal: string;
    items: DetailItem[];
  }

  // SVELTE 5 Runes dengan tipe data
  let idPesanan = $state('');
  let isLoading = $state(false);
  let pesananDitemukan = $state<Pesanan | null>(null);
  let pesanError = $state('');

  async function cariPesanan(e: Event) {
    e.preventDefault();
    isLoading = true;
    pesanError = '';
    pesananDitemukan = null;

    // Bersihkan karakter non-angka agar toleran dengan input seperti "#12" atau "ORD-12"
    const cleanedId = idPesanan.replace(/\D/g, '');
    if (!cleanedId) {
      pesanError = 'Masukkan ID Pesanan yang valid (berupa angka, contoh: #12).';
      isLoading = false;
      return;
    }

    try {
      const res = await fetch(`/api/pesanan/${cleanedId}/lacak`);
      const json = await res.json();

      if (res.ok && json.success) {
        pesananDitemukan = json.data;
      } else {
        pesanError = json.message || 'Pesanan tidak ditemukan. Pastikan ID Pesanan sudah benar.';
      }
    } catch (err) {
      pesanError = 'Gagal menghubungi server. Pastikan server backend Anda aktif.';
    } finally {
      isLoading = false;
    }
  }

  function getStatusColor(status: string) {
    switch(status) {
      case 'Diterima': return '#3b82f6';
      case 'Proses': return '#f59e0b';
      case 'Disajikan': return '#8b5cf6';
      case 'Selesai': return '#10b981';
      default: return '#6b7280';
    }
  }

  function formatTanggal(tanggalStr: string) {
    if (!tanggalStr) return '';
    const date = new Date(tanggalStr);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  }

  function formatRupiah(num: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  }
</script>

<svelte:head>
  <title>Lacak Pesanan | Resto Pamekasan</title>
</svelte:head>

<main class="features-section" style="min-height: 70vh;">
  <header class="section-header">
    <h2>Lacak Pesanan Anda</h2>
    <p>Masukkan ID Pesanan Anda untuk melihat status terkini</p>
  </header>

  <!-- FORM PENCARIAN (Dibungkus dengan class .card dari layout.css) -->
  <article class="card form-lacak">
    <div class="card-content">
      <form onsubmit={cariPesanan} class="search-form">
        <div class="search-input">
          <input 
            type="text" 
            bind:value={idPesanan} 
            placeholder="Masukkan ID Pesanan (contoh: #12)..." 
            required 
            disabled={isLoading}
            aria-label="Input ID Pesanan"
          />
        </div>
        <button type="submit" class="cta-btn" disabled={isLoading || idPesanan.trim() === ''}>
          {#if isLoading}
            <span class="spinner" style="margin-right: 5px;"></span> Mencari...
          {:else}
            Cari Pesanan
          {/if}
        </button>
      </form>

      {#if pesanError}
        <p class="error-msg" role="alert">{pesanError}</p>
      {/if}
    </div>
  </article>

  <!-- HASIL PENCARIAN (Muncul Jika Ketemu) -->
  {#if pesananDitemukan}
    <article class="card result-card">
      <div class="card-content">
        
        <header class="result-header">
          <div>
            <h3 style="margin: 0; color: #1d3557;">ID Pesanan: #{pesananDitemukan.id}</h3>
            <small style="color: var(--text-muted);">{formatTanggal(pesananDitemukan.tanggal)}</small>
          </div>
          <div class="badge-status" style="background-color: {getStatusColor(pesananDitemukan.status_pesanan)};">
            {pesananDitemukan.status_pesanan}
          </div>
        </header>

        <ul class="order-list">
          {#each pesananDitemukan.items as item}
            <li class="order-item">
              <div>
                <strong>{item.nama_menu}</strong>
                <div class="item-meta">
                  {item.jumlah} x {formatRupiah(item.harga)}
                </div>
              </div>
              <strong>{formatRupiah(item.subtotal)}</strong>
            </li>
          {/each}
        </ul>

        <footer class="result-footer">
          <span style="font-size: 1.1rem; color: #555;">Total Harga ({pesananDitemukan.status_bayar}):</span>
          <strong class="total-price">{formatRupiah(pesananDitemukan.total_harga)}</strong>
        </footer>

      </div>
    </article>
  {/if}
</main>