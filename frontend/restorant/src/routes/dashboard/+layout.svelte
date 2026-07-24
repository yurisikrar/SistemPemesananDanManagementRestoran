<script>
  import './dashboard.css';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // SVELTE 5: State untuk mengontrol visibilitas sidebar & otentikasi JWT
  let isSidebarOpen = $state(true);
  let isAuthenticated = $state(false);
  let userData = $state(/** @type {any} */ (null));

  // Fungsi membalikkan status (true jadi false, false jadi true)
  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }

  function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    goto('/login');
  }

  onMount(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      goto('/login');
      return;
    }

    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      try {
        userData = JSON.parse(savedUser);
      } catch (e) {}
    }
    isAuthenticated = true;
  });
</script>

{#if isAuthenticated}
<div class="dashboard-layout">
  <!-- SIDEBAR (Otomatis mendapat class 'hidden' jika isSidebarOpen = false) -->
  <aside class="sidebar" class:hidden={!isSidebarOpen}>
    <h2>Panel Kasir</h2>
    {#if userData}
      <p style="font-size: 0.85rem; color: #a8dadc; margin-top: -0.5rem; margin-bottom: 1.5rem;">
        👤 {userData.nama_lengkap || userData.username} ({userData.role || 'Staf'})
      </p>
    {/if}
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
        <a href="/" style="margin-top: 1rem; color: #a8dadc;">
          ← Kembali ke Beranda
        </a>
      </li>
      <li>
        <button 
          type="button" 
          onclick={handleLogout} 
          style="background: none; border: none; color: #e63946; font-weight: bold; cursor: pointer; padding: 0.75rem 1rem; text-align: left; width: 100%; font-size: 0.95rem; margin-top: 0.5rem;"
        >
          🚪 Keluar (Logout)
        </button>
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
{:else}
<div style="display: flex; justify-content: center; align-items: center; min-height: 80vh; color: #666;">
  <span class="spinner" style="margin-right: 8px;"></span> Memeriksa otentikasi...
</div>
{/if}