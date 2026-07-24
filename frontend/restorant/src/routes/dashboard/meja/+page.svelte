<script lang="ts">
  import { onMount } from 'svelte';

  interface Meja {
    id: number;
    nomor_meja: string;
    status: 'Tersedia' | 'Tidak Tersedia';
  }

  let isLoading = $state(false);
  let isFetching = $state(true);

  // State Form Tambah Meja
  let mejaBaru = $state({
    nomor_meja: '',
    status: 'Tersedia' as 'Tersedia' | 'Tidak Tersedia'
  });

  // State Data Tabel Meja
  let daftarMeja = $state<Meja[]>([]);

  // Load data meja saat mount
  onMount(async () => {
    await loadMeja();
  });

  async function loadMeja() {
    isFetching = true;
    try {
      const res = await fetch('/api/meja');
      const json = await res.json();
      if (json.success) {
        daftarMeja = json.data;
      } else {
        alert(json.message || 'Gagal memuat daftar meja');
      }
    } catch (e) {
      alert('Koneksi ke backend gagal');
    } finally {
      isFetching = false;
    }
  }

  // Fungsi: Menambah Meja Baru
  async function handleTambahMeja(e: Event) {
    e.preventDefault();
    if (!mejaBaru.nomor_meja.trim()) {
      alert('Nomor meja wajib diisi!');
      return;
    }

    isLoading = true;

    try {
      const res = await fetch('/api/meja', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nomor_meja: mejaBaru.nomor_meja.trim(),
          status: mejaBaru.status
        })
      });
      const json = await res.json();
      if (json.success) {
        alert('Meja baru berhasil ditambahkan!');
        await loadMeja();
        // Reset Form
        mejaBaru = { nomor_meja: '', status: 'Tersedia' };
      } else {
        alert(json.message || 'Gagal menambah meja');
      }
    } catch (err) {
      alert('Koneksi gagal.');
    } finally {
      isLoading = false;
    }
  }

  // Fungsi: Mengkonfirmasi Perubahan di Baris Tabel
  async function handleUpdateMeja(index: number) {
    const dataUpdate = daftarMeja[index];

    if (!dataUpdate.nomor_meja || !dataUpdate.nomor_meja.trim()) {
      alert('Nomor meja tidak boleh kosong!');
      return;
    }

    try {
      const res = await fetch(`/api/meja/${dataUpdate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nomor_meja: dataUpdate.nomor_meja.trim(),
          status: dataUpdate.status
        })
      });
      const json = await res.json();
      if (json.success) {
        alert(`Status/Data meja "${dataUpdate.nomor_meja}" berhasil diperbarui!`);
        await loadMeja();
      } else {
        alert(json.message || 'Gagal mengupdate meja');
      }
    } catch (e) {
      alert('Gagal menghubungi server');
    }
  }
</script>

<svelte:head>
  <title>Manajemen Meja | Resto KW</title>
</svelte:head>

<div>
  <h2 style="color: #1d3557; margin-top: 0;">Manajemen Meja</h2>
  <p style="color: var(--text-muted); margin-bottom: 2rem;">
    Tambahkan meja baru atau perbarui status ketersediaan meja yang sudah ada secara langsung.
  </p>

  <!-- ==========================================
       BAGIAN 1: FORM TAMBAH MEJA
       ========================================== -->
  <section class="card" style="margin-bottom: 2rem;">
    <div class="card-content">
      <h3 style="color: #1d3557; margin-top: 0; margin-bottom: 1.5rem;">Tambah Meja Baru</h3>

      <form onsubmit={handleTambahMeja}>
        <div class="grid-container form-grid-layout">
          <div class="input-group">
            <label for="nomor_meja">Nomor / Label Meja</label>
            <input
              type="text"
              id="nomor_meja"
              class="table-select"
              bind:value={mejaBaru.nomor_meja}
              required
              placeholder="Misal: Meja 01 atau M-1"
            />
          </div>

          <div class="input-group">
            <label for="status">Status Meja</label>
            <select id="status" class="table-select" bind:value={mejaBaru.status}>
              <option value="Tersedia">Tersedia</option>
              <option value="Tidak Tersedia">Tidak Tersedia</option>
            </select>
          </div>
        </div>

        <!-- Tombol Submit -->
        <div style="margin-top: 1.5rem; text-align: right;">
          <button type="submit" class="cta-btn" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : '+ Tambah Meja'}
          </button>
        </div>
      </form>
    </div>
  </section>

  <!-- ==========================================
       BAGIAN 2: TABEL DAFTAR MEJA (EDITABLE)
       ========================================== -->
  <section class="card">
    <div class="card-content table-container">
      <h3 style="color: #1d3557; margin-top: 0; margin-bottom: 1rem;">Daftar Meja Tersedia</h3>

      {#if isFetching}
        <div class="loading-state">
          <span class="spinner"></span> Memuat data meja...
        </div>
      {:else if daftarMeja.length === 0}
        <div class="empty-state">
          <p>Belum ada data meja di database.</p>
        </div>
      {:else}
        <table class="data-table" style="min-width: 600px;">
          <thead>
            <tr>
              <th style="width: 80px;">ID</th>
              <th>Nomor Meja</th>
              <th style="width: 220px;">Status Ketersediaan</th>
              <th style="text-align: center; width: 120px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {#each daftarMeja as item, index (item.id)}
              <tr>
                <td>
                  <strong style="color: #1d3557;">#{item.id}</strong>
                </td>

                <td>
                  <input
                    type="text"
                    class="table-select"
                    style="width: 100%; box-sizing: border-box;"
                    bind:value={daftarMeja[index].nomor_meja}
                  />
                </td>

                <td>
                  <div class="status-cell">
                    <span class="status-badge {item.status === 'Tersedia' ? 'badge-available' : 'badge-unavailable'}">
                      {item.status}
                    </span>
                    <select
                      class="table-select"
                      style="flex: 1; box-sizing: border-box;"
                      bind:value={daftarMeja[index].status}
                    >
                      <option value="Tersedia">Tersedia</option>
                      <option value="Tidak Tersedia">Tidak Tersedia</option>
                    </select>
                  </div>
                </td>

                <td style="text-align: center;">
                  <button
                    class="btn-check"
                    style="margin: 0 auto;"
                    onclick={() => handleUpdateMeja(index)}
                    title="Simpan Perubahan Baris Ini"
                  >
                    &#10004; Simpan
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

<style>
  /* Form Layout */
  .form-grid-layout {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  @media (min-width: 768px) {
    .form-grid-layout {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-group label {
    font-weight: 600;
    color: #475569;
    font-size: 0.9rem;
  }

  .loading-state,
  .empty-state {
    text-align: center;
    padding: 2.5rem 1rem;
    color: var(--text-muted);
  }

  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  /* Status cell with badge */
  .status-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .status-badge {
    padding: 0.25rem 0.6rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .badge-available {
    background-color: #dcfce7;
    color: #15803d;
  }

  .badge-unavailable {
    background-color: #fee2e2;
    color: #b91c1c;
  }

  /* Override btn-check button to show text clearly */
  .btn-check {
    padding: 0.5rem 0.75rem !important;
    font-size: 0.85rem !important;
    gap: 0.25rem;
  }
</style>
