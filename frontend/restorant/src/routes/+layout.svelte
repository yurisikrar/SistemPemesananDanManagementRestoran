<script>
  // Import CSS global
  import './layout.css';
</script>

<!-- HEADER GLOBAL -->
<header class="main-header">
  <nav class="navbar">
    <div class="logo">Resto KW
	</div>
    <ul class="nav-links">
      <li><a href="/">Beranda</a></li>
      <li><a href="/pesanan">Pesan</a></li>
      <li><a href="/lacakpesanan">Lacak Pesanan</a></li>
    </ul>
  </nav>
</header>


<slot />


<footer class="main-footer">
  <p>Restoran KW | Jl. Dimana Saja No.00 RT.00 RW.00, Kel. Disini, Kec. Dimana, Kab. Adalah Pokoknya, Jawa Utara</p>
  <p>Contac Person : +62 888 8888 8888 | <a href="" class="links">WhatsApp</a></p>
</footer>