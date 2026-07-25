<script>
  import { goto } from '$app/navigation';
  let isLoading = false;

  function handleAction() {
    isLoading = true;
    goto('/pesanan');
  }
</script>
<style>
  .bg-1 {
    background-image: url(https://www.dapurkobe.co.id/wp-content/uploads/sate-ayam.jpg);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  .bg-2 {
    background-image: url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHXhQ_Y8-YA7s5kD47xvfjeJ-1yNtxD6OvkAeftYss05TThk4UeuDEuWZe&s=10);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  .bg-3 {
    background-image: url(https://assets.unileversolutions.com/recipes-v2/257471.jpg);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
</style>
<main>
  <section id="hero" class="hero-section">
    <div class="hero-content">
      <h1>Cita Rasa Autentik, Suasana Nyaman</h1>
      <p>Nikmati hidangan spesial kami dengan pelayanan terbaik untuk keluarga dan teman-teman Anda.</p>
      
      <button class="cta-btn" on:click={handleAction} disabled={isLoading}>
        {#if isLoading}
          <span class="spinner"></span> Memproses...
        {:else}
          Pesan Sekarang
        {/if}
      </button>
    </div>
  </section>
  <section id="menu" class="features-section">
    <div class="section-header">
      <h2>Menu Unggulan Kami</h2>
      <p>Dibuat dari bahan segar berkualitas tinggi dengan racikan bumbu hasil racikan terbaik kami</p>
    </div>

    <div class="grid-container">
      <article class="card">
        <div class="card-image bg-1"></div>
        <div class="card-content">
          <h3>Sate Ayam</h3>
          <p>Daging ayam dibumbui dengan campuran ketumbar dan Saus Tiram Selera. Perpaduan rempah khas Indonesia dan ekstrak tiram super gurih, yang digunakan untuk merendam ayam, membuat bumbunya meresap.</p>
        </div>
      </article>

      <article class="card">
        <div class="card-image bg-2"></div>
        <div class="card-content">
          <h3>Soto Spesial Koya</h3>
          <p>Kuah kaldu gurih dengan taburan koya nikmat dan ayam suwir.</p>
        </div>
      </article>

      <article class="card">
        <div class="card-image bg-3"></div>
        <div class="card-content">
          <h3>Bebek Goreng Renyah</h3>
          <p>Digoreng sempurna disajikan dengan sambal pencit pedas segar.</p>
        </div>
      </article>
    </div>
  </section>
</main>