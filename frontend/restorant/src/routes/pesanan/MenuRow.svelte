<script>
  // SVELTE 5: Menggunakan $props() untuk menerima data (props) dari komponen induk
  let { 
    item, 
    index, 
    daftarMenu = [], 
    onTambah, 
    onKurang, 
    onChangeMenu 
  } = $props();

  let selectedMenu = $derived(daftarMenu.find((/** @type {any} */ m) => String(m.id) === String(item.id_menu)));
  let stokTersedia = $derived(selectedMenu && selectedMenu.stok !== undefined ? Number(selectedMenu.stok) : null);
</script>

<article class="menu-row">
  <div class="menu-select-wrapper">
    <select 
      value={item.id_menu} 
      onchange={(e) => {
        const target = /** @type {HTMLSelectElement} */ (e.target);
        if (target) onChangeMenu(index, target.value);
      }}
    >
      <option value="" disabled selected={!item.id_menu}>-- Pilih Menu --</option>
      {#each daftarMenu as menu}
        <option value={menu.id} disabled={menu.stok !== undefined && menu.stok <= 0}>
          {menu.nama_menu} - Rp {Number(menu.harga).toLocaleString('id-ID')}
        </option>
      {/each}
    </select>
  </div>

  <div class="counter-col">
    <div class="counter-wrapper">
      <button type="button" class="counter-btn minus" onclick={() => onKurang(index)} aria-label="Kurangi pesanan">-</button>
      <span class="counter-number">{item.jumlah}</span>
      <button 
        type="button" 
        class="counter-btn plus" 
        disabled={stokTersedia !== null && item.jumlah >= stokTersedia} 
        onclick={() => onTambah(index)} 
        aria-label="Tambah pesanan"
      >+</button>
    </div>
    {#if item.id_menu && stokTersedia !== null}
      <small class="stok-text {stokTersedia > 0 && item.jumlah >= stokTersedia ? 'stok-limit' : ''}">
        stok : {stokTersedia}
      </small>
    {/if}
  </div>

  {#if item.harga > 0}
    <div class="item-subtotal">
      Rp {(item.harga * item.jumlah).toLocaleString('id-ID')}
    </div>
  {/if}
</article>