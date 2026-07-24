<script>
  import './dashboard.css';
  import { page } from '$app/stores';

  // SVELTE 5: State untuk mengontrol visibilitas sidebar
  let isSidebarOpen = $state(true);

  // Fungsi membalikkan status (true jadi false, false jadi true)
  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }
</script>

<div class="dashboard-layout">
  <!-- SIDEBAR (Otomatis mendapat class 'hidden' jika isSidebarOpen = false) -->
  <aside class="sidebar" class:hidden={!isSidebarOpen}>
    <h2>Panel Kasir</h2>
    <ul class="sidebar-nav">
      <li>
        <a href="/dashboard" class:active={$page.url.pathname === '/dashboard'}>
          Daftar Pesanan
        </a>
      </li>
      <li>
        <a href="/dashboard/menu" class:active={$page.url.pathname.startsWith('/dashboard/menu')}>
          Manajemen Menu
        </a>
      </li>
      <li>
        <a href="/dashboard/meja" class:active={$page.url.pathname.startsWith('/dashboard/meja')}>
          Manajemen Meja
        </a>
      </li>
      <li>
        <a href="/dashboard/riwayat" class:active={$page.url.pathname.startsWith('/dashboard/riwayat')}>
          Riwayat Pesanan
        </a>
      </li>
      <li>
        <a href="/" style="margin-top: 2rem; color: #e63946;">
          ← Kembali ke Beranda
        </a>
      </li>
    </ul>
  </aside>

  <!-- KONTEN UTAMA DASHBOARD -->
  <main class="dashboard-content">
    <!-- Top bar berisi tombol toggle -->
    <header class="dashboard-topbar">
      <button class="toggle-btn" onclick={toggleSidebar} aria-label="Toggle Sidebar">
        ☰ {isSidebarOpen ? 'Tutup Menu' : 'Buka Menu'}
      </button>
    </header>

    <slot />
  </main>
</div>