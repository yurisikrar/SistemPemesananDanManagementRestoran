<script>
  import { onMount } from 'svelte';

  // SVELTE 5: State array untuk menyimpan antrean pesanan dari backend API
  /** @type {any[]} */
  let antreanPesanan = $state([]);
  let isLoading = $state(true);

  // Ambil data pesanan aktif dari backend (HANYA status selain 'Selesai')
  async function fetchPesananAktif() {
    isLoading = true;
    try {
      const res = await fetch('http://localhost:3000/api/pesanan/aktif');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          antreanPesanan = json.data;
        }
      }
    } catch (e) {
      console.warn("Gagal mengambil data pesanan dari backend:", e);
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    fetchPesananAktif();
  });

  // Fungsi untuk memproses dan mengupdate status pesanan ke backend
  async function prosesPerubahan(/** @type {number} */ index) {
    const pesanan = antreanPesanan[index];
    
    // 1. Validasi: Jika mau diselesaikan, wajib Lunas
    if (pesanan.status_pesanan === 'Selesai' && pesanan.status_bayar === 'Belum Lunas') {
      alert("Pesanan tidak dapat diselesaikan karena pembayaran Belum Lunas!");
      return;
    }

    // Ambil ID staf kasir yang sedang login dari localStorage
    let loggedInStafId = null;
    const userDataRaw = localStorage.getItem('userData');
    if (userDataRaw) {
      try {
        const u = JSON.parse(userDataRaw);
        loggedInStafId = u.id;
      } catch (err) {}
    }

    try {
      // 2. Kirim update ke backend API Express
      const res = await fetch(`http://localhost:3000/api/pesanan/${pesanan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status_bayar: pesanan.status_bayar,
          status_pesanan: pesanan.status_pesanan,
          id_staf: loggedInStafId
        })
      });

      const result = await res.json();

      if (res.ok && result.success) {
        alert(`Perubahan pesanan ${pesanan.no_pesanan} berhasil diproses.`);

        // 3. Logika Utama: Jika status diset ke "Selesai" atau "Cancel", hapus dari antrean pesanan aktif di dashboard
        if (pesanan.status_pesanan === 'Selesai' || pesanan.status_pesanan === 'Cancel') {
          antreanPesanan = antreanPesanan.filter((_, i) => i !== index);
        } else {
          fetchPesananAktif();
        }
      } else {
        alert("Gagal memperbarui pesanan: " + (result.message || "Terjadi kesalahan"));
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem / koneksi server.");
    }
  }
</script>

<svelte:head>
  <title>Dashboard Kasir | Resto KW</title>
</svelte:head>

<div>
  <!-- Menggunakan styling typografi bawaan dari layout.css (h2, p) -->
  <h2 style="color: #1d3557; margin-top: 0;">Antrean Pesanan Aktif</h2>
  <p style="color: var(--text-muted); margin-bottom: 2rem;">
    Kelola status pembayaran dan tahapan pesanan. Pesanan yang diselesaikan akan otomatis dihapus dari daftar ini.
  </p>

  <!-- Menggunakan class .card dari layout.css sebagai pembungkus -->
  <section class="card">
    <div class="card-content table-container">
      
      {#if isLoading}
        <div style="text-align: center; padding: 3rem; color: #666;">
          <span class="spinner" style="margin-right: 8px;"></span> Memuat antrean pesanan...
        </div>
      {:else if antreanPesanan.length === 0}
        <div style="text-align: center; padding: 3rem; color: #666;">
          <strong>Hore!</strong> Tidak ada antrean pesanan aktif saat ini.
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
              <th style="text-align: center;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <!-- Looping data pesanan -->
            {#each antreanPesanan as pesanan, index (pesanan.id)}
              <tr>
                <td><strong>{pesanan.no_pesanan}</strong></td>
                <td>{pesanan.nomor_meja}</td>
                <td>{pesanan.menu}</td>
                <td><strong>Rp {Number(pesanan.total_harga).toLocaleString('id-ID')}</strong></td>
                
                <!-- Kolom Status Bayar -->
                <td>
                  <select class="table-select" bind:value={antreanPesanan[index].status_bayar}>
                    <option value="Belum Lunas">Belum Lunas</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                </td>
                
                <!-- Kolom Status Pesanan -->
                <td>
                  <select class="table-select" bind:value={antreanPesanan[index].status_pesanan}>
                    <option value="Diterima">Antrean (Diterima)</option>
                    <option value="Proses">Sedang Diproses</option>
                    <option value="Disajikan">Sudah Disajikan</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Cancel">Cancel (Batal)</option>
                  </select>
                </td>
                
                <!-- Kolom Aksi (Tombol Centang) -->
                <td style="text-align: center;">
                  <button 
                    type="button"
                    class="btn-check" 
                    onclick={() => prosesPerubahan(index)}
                    title="Simpan Perubahan"
                  >
                    <!-- Icon Centang / Checkmark HTML Entity -->
                    &#10004; 
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}

    </div>
  </section>
</div>