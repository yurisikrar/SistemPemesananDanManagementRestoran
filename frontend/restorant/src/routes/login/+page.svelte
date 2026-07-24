<script>
  // Menggunakan Svelte 5 Runes untuk form state
  let username = $state('');
  let password = $state('');
  let isLoading = $state(false);
  let errorMessage = $state('');

  // Fungsi penanganan form login terintegrasi Database & JWT API Backend
  async function handleLogin(/** @type {SubmitEvent} */ event) {
    event.preventDefault(); // Mencegah reload halaman bawaan HTML
    isLoading = true;
    errorMessage = '';

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Simpan token JWT dan info user di localStorage
        if (result.data?.token) {
          localStorage.setItem('authToken', result.data.token);
        }
        localStorage.setItem('userData', JSON.stringify(result.data));
        
        alert(`Login Berhasil! Selamat datang, ${result.data.nama_lengkap || username}.`);
        window.location.href = "/dashboard"; 
      } else {
        errorMessage = result.message || "Username atau password salah.";
      }
    } catch (error) {
      console.error("Fetch login error:", error);
      errorMessage = "Terjadi kesalahan: Tidak dapat terhubung ke server backend (http://localhost:3000).";
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Login | Resto Pamekasan</title>
</svelte:head>

<!-- Menggunakan hero-section dari layout.css agar form berada di tengah layar -->
<main class="hero-section">
  
  <!-- Menggunakan class card untuk memberikan efek kotak putih dengan bayangan -->
  <article class="card" style="width: 100%; max-width: 400px; text-align: left;">
    
    <!-- Padding bawaan dari card-content -->
    <div class="card-content">
      <h2 style="color: var(--primary-color); margin-top: 0; margin-bottom: 1.5rem; text-align: center;">
        Login Sistem Restoran
      </h2>
      
      {#if errorMessage}
        <div class="error-banner">
          ⚠️ {errorMessage}
        </div>
      {/if}

      <!-- SVELTE 5: menggunakan onsubmit -->
      <form onsubmit={handleLogin} style="display: flex; flex-direction: column; gap: 1.2rem;">
        
        <div class="input-group">
          <label for="username">Username</label>
          <input 
            type="text" 
            id="username" 
            bind:value={username} 
            required 
            placeholder="Masukkan username Anda"
            disabled={isLoading}
          />
        </div>

        <div class="input-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            bind:value={password} 
            required 
            placeholder="Masukkan password Anda"
            disabled={isLoading}
          />
        </div>

        <!-- Menggunakan tombol cta-btn dari layout.css beserta efek hover-nya -->
        <button type="submit" class="cta-btn" style="width: 100%; margin-top: 1rem;" disabled={isLoading}>
          {#if isLoading}
            <!-- Menggunakan animasi spinner dari layout.css -->
            <span class="spinner" style="margin-right: 8px;"></span> Memproses...
          {:else}
            Masuk Dashboard
          {/if}
        </button>
        
      </form>
    </div>
  </article>
</main>

<style>
  /* Styling tambahan khusus untuk form input yang mengikuti variabel warna layout.css */
  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .input-group label {
    font-weight: bold;
    color: var(--text-dark);
  }

  .input-group input {
    padding: 0.8rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: var(--bg-light);
    font-family: var(--font-main);
    font-size: 1rem;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  .input-group input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.1);
  }

  .input-group input:disabled {
    background-color: #eee;
    cursor: not-allowed;
  }

  .error-banner {
    background-color: #fee2e2;
    color: #991b1b;
    border: 1px solid #f87171;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    margin-bottom: 1.2rem;
    font-size: 0.9rem;
    font-weight: 500;
  }
</style>