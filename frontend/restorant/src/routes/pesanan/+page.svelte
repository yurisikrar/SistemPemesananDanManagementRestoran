<script>
  import './pesanan.css';
  import MenuRow from './MenuRow.svelte';
  import { keranjangStore } from './store.js';
  import { onMount } from 'svelte';

  let isLoading = $state(false);
  /** @type {any} */
  let orderSuccessData = $state(null);
  
  // Meja: null berarti Take Away
  let formPesanan = $state({
    id_meja: /** @type {number | null} */ (null)
  });

  // Dynamic Data state dari Backend API
  /** @type {any[]} */
  let daftarMeja = $state([]);
  /** @type {any[]} */
  let daftarMenu = $state([]);

  // Mock Fallback jika Backend belum menyalakan API
  const defaultMeja = [
    { id: 1, nomor_meja: 'Meja 01', status: 'Tersedia' },
    { id: 2, nomor_meja: 'Meja 02', status: 'Tersedia' },
    { id: 3, nomor_meja: 'Meja 03', status: 'Tidak Tersedia' },
  ];
  const defaultMenu = [
    { id: 1, nama_menu: 'Sate Ayam Madura', harga: 20000, stok: 10 },
    { id: 2, nama_menu: 'Soto Spesial Koya', harga: 15000, stok: 15 },
    { id: 3, nama_menu: 'Bebek Goreng Renyah', harga: 25000, stok: 5 },
  ];

  // Derived Total Harga
  let totalHarga = $derived(
    $keranjangStore.reduce((total, item) => total + (item.harga * item.jumlah), 0)
  );

  async function fetchMeja() {
    try {
      const res = await fetch('http://localhost:3000/api/meja');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          // Hanya ambil meja yang berstatus Tersedia
          daftarMeja = json.data.filter((/** @type {any} */ m) => m.status === 'Tersedia');
          return;
        }
      }
    } catch (e) {
      console.warn('Backend API Meja tidak terjangkau, menggunakan fallback local:', e);
    }
    daftarMeja = defaultMeja.filter((/** @type {any} */ m) => m.status === 'Tersedia');
  }

  async function fetchMenu() {
    try {
      const res = await fetch('http://localhost:3000/api/menu');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          daftarMenu = json.data.filter((/** @type {any} */ m) => 
            (m.is_active === undefined || (m.is_active !== false && m.is_active !== 0 && m.is_active !== '0')) &&
            Number(m.stok) > 0
          );
          return;
        }
      }
    } catch (e) {
      console.warn('Backend API Menu tidak terjangkau, menggunakan fallback local:', e);
    }
    daftarMenu = defaultMenu.filter((/** @type {any} */ m) => Number(m.stok) > 0);
  }

  onMount(() => {
    fetchMeja();
    fetchMenu();

    const savedDraft = localStorage.getItem('draftPesanan');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (Array.isArray(parsed) && parsed.length > 0) {
          keranjangStore.set(parsed);
        }
      } catch (err) {
        console.error('Error parsing draft:', err);
      }
    }
  });

  $effect(() => {
    localStorage.setItem('draftPesanan', JSON.stringify($keranjangStore));
  });

  // Tambah Baris Keranjang
  function tambahBaris() {
    keranjangStore.update(items => [
      ...items,
      { id: crypto.randomUUID(), id_menu: '', jumlah: 1, harga: 0 }
    ]);
  }

  // Tambah Jumlah (Immutable Update & Dibatasi Stok Menu)
  function tambahJumlah(/** @type {number} */ index) {
    keranjangStore.update(items =>
      items.map((item, i) => {
        if (i === index) {
          const selected = daftarMenu.find(m => String(m.id) === String(item.id_menu));
          const maxStok = selected && selected.stok !== undefined ? Number(selected.stok) : Infinity;
          if (item.jumlah < maxStok) {
            return { ...item, jumlah: item.jumlah + 1 };
          }
        }
        return item;
      })
    );
  }

  // Kurangi Jumlah (Immutable Update & hapus baris jika <= 1)
  function kurangiJumlah(/** @type {number} */ index) {
    keranjangStore.update(items => {
      if (items[index].jumlah <= 1) {
        return items.filter((_, i) => i !== index);
      }
      return items.map((item, i) =>
        i === index ? { ...item, jumlah: item.jumlah - 1 } : item
      );
    });
  }

  // Perubahan Pilihan Menu pada Baris
  function handleMenuChange(/** @type {number} */ index, /** @type {any} */ selectedId) {
    keranjangStore.update(items => {
      const selected = daftarMenu.find(m => String(m.id) === String(selectedId));
      const maxStok = selected && selected.stok !== undefined ? Number(selected.stok) : Infinity;
      return items.map((item, i) =>
        i === index
          ? {
              ...item,
              id_menu: selectedId,
              harga: selected ? selected.harga : 0,
              jumlah: item.jumlah > maxStok ? maxStok : (item.jumlah || 1)
            }
          : item
      );
    });
  }

  // Kirim Pesanan Ke API Backend
  async function submitPesanan() {
    const validItems = $keranjangStore.filter(i => i.id_menu && i.jumlah > 0);
    if (validItems.length === 0) {
      alert("Silakan pilih minimal satu menu pesanan.");
      return;
    }

    // Validasi Stok
    for (const item of validItems) {
      const selected = daftarMenu.find(m => String(m.id) === String(item.id_menu));
      if (selected && selected.stok !== undefined && item.jumlah > selected.stok) {
        alert(`Jumlah pesanan untuk "${selected.nama_menu}" melebihi stok yang tersedia (Stok: ${selected.stok}).`);
        return;
      }
    }

    isLoading = true;
    
    // Jika Take Away, id_meja dikirim null. Jika Meja dipilih, parseInt id_meja.
    const payload = {
      id_meja: formPesanan.id_meja ? parseInt(String(formPesanan.id_meja)) : null,
      total_harga: totalHarga,
      keranjang: validItems.map(i => ({ 
        id_menu: Number(i.id_menu), 
        jumlah: Number(i.jumlah), 
        subtotal: i.harga * i.jumlah 
      }))
    };

    try {
      const response = await fetch('http://localhost:3000/api/pesanan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        const idPesananBaru = result.data?.id_pesanan || result.data?.id || Math.floor(1000 + Math.random() * 9000);
        
        orderSuccessData = {
          id_pesanan: idPesananBaru,
          nomor_meja: formPesanan.id_meja 
            ? daftarMeja.find(m => String(m.id) === String(formPesanan.id_meja))?.nomor_meja || `Meja ${formPesanan.id_meja}`
            : 'Take Away (Bungkus)',
          total_harga: totalHarga
        };

        // Reset Form & Keranjang
        keranjangStore.set([{ id: crypto.randomUUID(), id_menu: '', jumlah: 1, harga: 0 }]);
        localStorage.removeItem('draftPesanan');
        
        // Refresh daftar menu dan meja dari backend agar stok & ketersediaan meja ter-update langsung
        fetchMenu();
        fetchMeja();
      } else {
        alert("Gagal memproses pesanan: " + (result.message || "Terjadi kesalahan sistem"));
      }
    } catch (error) {
      console.error("Fetch error:", error);
      // Demo fallback jika API offline
      const mockId = Math.floor(100 + Math.random() * 900);
      orderSuccessData = {
        id_pesanan: mockId,
        nomor_meja: formPesanan.id_meja 
          ? daftarMeja.find(m => String(m.id) === String(formPesanan.id_meja))?.nomor_meja || `Meja ${formPesanan.id_meja}`
          : 'Take Away (Bungkus)',
        total_harga: totalHarga
      };
      keranjangStore.set([{ id: crypto.randomUUID(), id_menu: '', jumlah: 1, harga: 0 }]);
      localStorage.removeItem('draftPesanan');
    } finally {
      isLoading = false;
    }
  }

  function tutupModal() {
    orderSuccessData = null;
  }
</script>

<main class="features-section">
  <header class="section-header">
    <h2>Buat Pesanan Pelanggan</h2>
    <p>Pilih nomor meja atau layanan take away, lalu pilih daftar menu pelanggan</p>
  </header>

  <section class="card form-container">
    <div class="card-content">
      
      <!-- PILIHAN MEJA / LAYANAN -->
      <div class="form-grid single-col">
        <div class="input-group">
          <label for="meja">Nomor Meja / Layanan</label>
          <select id="meja" bind:value={formPesanan.id_meja}>
            <option value={null}>Take Away</option>
            {#each daftarMeja as meja}
              <option value={meja.id}>{meja.nomor_meja} (Tersedia)</option>
            {/each}
          </select>
          <small class="help-text">
            {#if formPesanan.id_meja === null}
              *Pesanan Take Away.
            {:else}
              *Pesanan Dine-In
            {/if}
          </small>
        </div>
      </div>

      <hr class="divider" />

      <!-- BAGIAN MENU DINAMIS -->
      <section>
        <h3 style="margin-bottom: 1rem; color: #1d3557;">Daftar Menu</h3>
        
        <div class="menu-list">
          {#each $keranjangStore as item, index (item.id)}
            <MenuRow 
              {item} {index} {daftarMenu} 
              onTambah={tambahJumlah} 
              onKurang={kurangiJumlah} 
              onChangeMenu={handleMenuChange} 
            />
          {/each}
        </div>

        <button type="button" class="add-row-btn" onclick={tambahBaris}>+ Tambah Baris Menu</button>
      </section>

      <hr class="divider" />

      <!-- CHECKOUT SECTION -->
      <footer class="checkout-section">
        <div class="total-harga">
          <span>Subtotal Tagihan:</span>
          <strong>Rp {totalHarga.toLocaleString('id-ID')}</strong>
        </div>
        <button 
          type="button" 
          class="cta-btn submit-btn" 
          onclick={submitPesanan} 
          disabled={isLoading || totalHarga === 0 || $keranjangStore.length === 0}
        >
          {#if isLoading}
            <span class="spinner" style="margin-right: 8px;"></span> Memproses...
          {:else}
            Proses Pesanan Sekarang
          {/if}
        </button>
      </footer>

    </div>
  </section>

  <!-- MODAL SUKSES DENGAN NOMOR PESANAN -->
  {#if orderSuccessData}
    <div class="modal-overlay">
      <div class="modal-card">
        <div class="success-icon">✓</div>
        <h3>Pesanan Berhasil Dibuat!</h3>
        <p class="order-id-label">Nomor Pesanan Anda:</p>
        <div class="order-id-badge">#{orderSuccessData.id_pesanan}</div>
        
        <div class="order-details-box">
          <p><strong>Layanan:</strong> {orderSuccessData.nomor_meja}</p>
          <p><strong>Total Pembayaran:</strong> Rp {orderSuccessData.total_harga.toLocaleString('id-ID')}</p>
        </div>

        <p class="modal-info">
          Silakan sebutkan atau perlihatkan nomor pesanan di atas ke Kasir untuk pembayaran dan pemrosesan pesanan.
        </p>
        <button type="button" class="cta-btn modal-btn" onclick={tutupModal}>
          Selesai / Buat Pesanan Baru
        </button>
      </div>
    </div>
  {/if}
</main>