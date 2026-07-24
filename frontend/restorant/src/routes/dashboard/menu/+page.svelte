<script lang="ts">
  import { onMount } from 'svelte';

  interface Menu {
    id: number;
    nama_menu: string;
    harga: number;
    stok: number;
    gambar: string | null;
    is_active: boolean | number;
  }

  let isLoading = $state(false);
  let isFetching = $state(true);

  // State Form Tambah Menu
  let menuBaru = $state({
    nama_menu: '',
    harga: '',
    stok: '',
    is_active: 1 // 1 = Active, 0 = Deactive
  });

  let fileGambar = $state<File | null>(null);

  // State Data Tabel
  let daftarMenu = $state<Menu[]>([]);

  // Load menu saat mount
  onMount(async () => {
    await loadMenus();
  });

  async function loadMenus() {
    isFetching = true;
    try {
      const res = await fetch('/api/menu');
      const json = await res.json();
      if (json.success) {
        daftarMenu = json.data;
      } else {
        alert(json.message || 'Gagal memuat daftar menu');
      }
    } catch (e) {
      alert('Koneksi ke backend gagal');
    } finally {
      isFetching = false;
    }
  }

  function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      fileGambar = target.files[0];
    } else {
      fileGambar = null;
    }
  }

  // Fungsi: Menambah Menu Baru
  async function handleTambahMenu(e: Event) {
    e.preventDefault();
    isLoading = true;

    const formData = new FormData();
    formData.append('nama_menu', menuBaru.nama_menu);
    formData.append('harga', menuBaru.harga);
    formData.append('stok', menuBaru.stok);
    formData.append('is_active', menuBaru.is_active.toString());
    if (fileGambar) {
      formData.append('gambar', fileGambar);
    }

    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      if (json.success) {
        alert("Menu baru berhasil ditambahkan!");
        await loadMenus();
        // Reset Form
        menuBaru = { nama_menu: '', harga: '', stok: '', is_active: 1 };
        fileGambar = null;
        const fileInput = document.getElementById('gambar') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        alert(json.message || "Gagal menambah menu");
      }
    } catch (err) {
      alert("Koneksi gagal.");
    } finally {
      isLoading = false;
    }
  }

  // Fungsi: Mengkonfirmasi Perubahan di Baris Tabel
  async function handleUpdateMenu(index: number) {
    const dataUpdate = daftarMenu[index];
    
    // Validasi sederhana
    if (!dataUpdate.nama_menu || dataUpdate.harga === undefined || dataUpdate.stok === undefined) {
      alert("Pastikan Nama, Harga, dan Stok tidak boleh kosong!");
      return;
    }

    try {
      const res = await fetch(`/api/menu/${dataUpdate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nama_menu: dataUpdate.nama_menu,
          harga: Number(dataUpdate.harga),
          stok: Number(dataUpdate.stok),
          is_active: Number(dataUpdate.is_active) === 1
        })
      });
      const json = await res.json();
      if (json.success) {
        alert(`Perubahan pada menu "${dataUpdate.nama_menu}" berhasil disimpan!`);
        await loadMenus();
      } else {
        alert(json.message || "Gagal mengupdate menu");
      }
    } catch (e) {
      alert("Gagal menghubungi server");
    }
  }
</script>

<svelte:head>
  <title>Manajemen Menu | Resto KW</title>
</svelte:head>

<div>
  <h2 style="color: #1d3557; margin-top: 0;">Manajemen Menu</h2>
  <p style="color: var(--text-muted); margin-bottom: 2rem;">
    Tambahkan menu baru atau perbarui data menu yang sudah ada secara langsung.
  </p>

  <!-- ==========================================
       BAGIAN 1: FORM TAMBAH MENU
       ========================================== -->
  <section class="card" style="margin-bottom: 2rem;">
    <div class="card-content">
      <h3 style="color: #1d3557; margin-top: 0; margin-bottom: 1.5rem;">Tambah Menu Baru</h3>
      
      <form onsubmit={handleTambahMenu}>
        <div class="grid-container form-grid-layout">
          
          <div class="input-group">
            <label for="nama_menu">Nama Menu</label>
            <input type="text" id="nama_menu" class="table-select" bind:value={menuBaru.nama_menu} required placeholder="Misal: Nasi Goreng" />
          </div>

          <div class="input-group">
            <label for="harga">Harga (Rp)</label>
            <input type="number" id="harga" class="table-select" bind:value={menuBaru.harga} required min="0" max="99999999999" placeholder="Misal: 15000" />
          </div>

          <div class="input-group">
            <label for="stok">Stok Awal</label>
            <input type="number" id="stok" class="table-select" bind:value={menuBaru.stok} required min="0" placeholder="Misal: 50" />
          </div>

          <div class="input-group">
            <label for="gambar">Gambar Menu</label>
            <input type="file" id="gambar" accept="image/*" onchange={handleFileChange} class="table-select file-input" />
          </div>

          <div class="input-group">
            <label for="status">Status Aktif</label>
            <select id="status" class="table-select" bind:value={menuBaru.is_active}>
              <option value={1}>Active</option>
              <option value={0}>Deactive</option>
            </select>
          </div>
          
        </div>

        <!-- Tombol Submit -->
        <div style="margin-top: 1.5rem; text-align: right;">
          <button type="submit" class="cta-btn" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : '+ Tambah Menu'}
          </button>
        </div>
      </form>
    </div>
  </section>

  <!-- ==========================================
       BAGIAN 2: TABEL DAFTAR MENU (EDITABLE)
       ========================================== -->
  <section class="card">
    <div class="card-content table-container">
      <h3 style="color: #1d3557; margin-top: 0; margin-bottom: 1rem;">Daftar Menu Tersedia</h3>
      
      {#if isFetching}
        <div class="loading-state">
          <span class="spinner"></span> Memuat menu...
        </div>
      {:else if daftarMenu.length === 0}
        <div class="empty-state">
          <p>Belum ada data menu di database.</p>
        </div>
      {:else}
        <table class="data-table" style="min-width: 900px;">
          <thead>
            <tr>
              <th>Gambar</th>
              <th>Nama Menu</th>
              <th style="width: 100px;">Stok</th>
              <th style="width: 150px;">Harga (Rp)</th>
              <th style="width: 130px;">Status</th>
              <th style="text-align: center; width: 100px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {#each daftarMenu as menu, index (menu.id)}
              <tr>
                <!-- Gambar Thumbnail -->
                <td>
                  {#if menu.gambar && menu.gambar !== 'NULL'}
                    <div class="image-thumbnail-container">
                      <img src="/uploads/menu/{menu.gambar}" alt={menu.nama_menu} class="table-img" />
                      <span class="img-filename" title={menu.gambar}>{menu.gambar}</span>
                    </div>
                  {:else}
                    <span class="no-img">No Image</span>
                  {/if}
                </td>

                <td>
                  <input type="text" class="table-select" style="width: 100%; box-sizing: border-box;" bind:value={daftarMenu[index].nama_menu} />
                </td>
                
                <td>
                  <input type="number" class="table-select" style="width: 100%; box-sizing: border-box;" bind:value={daftarMenu[index].stok} min="0" />
                </td>
                
                <td>
                  <input type="number" class="table-select" style="width: 100%; box-sizing: border-box;" bind:value={daftarMenu[index].harga} min="0" max="99999999999" />
                </td>
                
                <td>
                  <select class="table-select" style="width: 100%; box-sizing: border-box;" bind:value={daftarMenu[index].is_active}>
                    <option value={1}>Active</option>
                    <option value={0}>Deactive</option>
                  </select>
                </td>
                
                <td style="text-align: center;">
                  <button class="btn-check" style="margin: 0 auto;" onclick={() => handleUpdateMenu(index)} title="Simpan Perubahan Baris Ini">
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
  /* Menggunakan CSS scoped untuk merapikan form layout */
  .form-grid-layout {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  
  @media (min-width: 768px) {
    .form-grid-layout {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .form-grid-layout {
      grid-template-columns: repeat(3, 1fr);
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

  .file-input {
    padding: 0.35rem 0.5rem !important;
  }

  .loading-state, .empty-state {
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

  .image-thumbnail-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .table-img {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
  }

  .img-filename {
    font-size: 0.75rem;
    color: var(--text-muted);
    max-width: 90px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .no-img {
    color: var(--text-muted);
    font-size: 0.8rem;
    font-style: italic;
  }


  /* Override btn-check button to show text clearly */
  .btn-check {
    padding: 0.5rem 0.75rem !important;
    font-size: 0.85rem !important;
    gap: 0.25rem;
  }
</style>