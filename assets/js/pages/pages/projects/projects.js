function toggleSidebar(){
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    // Si el sidebar está oculto, se muestra y se asigna el margen original al contenedor principal.
    if (getComputedStyle(sidebar).display === 'none') {
        sidebar.style.display = 'block';
        // Asigna el margen original (ajusta el valor según el ancho real de tu sidebar)
        mainContent.style.marginLeft = "220px"; /* O el valor que uses en tu CSS */
    } else {
        // Oculta el sidebar y expande el contenedor principal
        sidebar.style.display = 'none';
        mainContent.style.marginLeft = "0";
    }
}
function logout() {
    sessionStorage.clear('usuario_principal');
    sessionStorage.clear('avatar');
    sessionStorage.clear('id_usuario');
    window.location.href = '../../../pages/authentication/signin/login.html';
}

  // Al cargar el DOM, asignar avatar y nombre de usuario
  document.addEventListener("DOMContentLoaded", function() {
    // Cargar avatar desde sessionStorage (si existe)
    const avatarURL = sessionStorage.getItem('avatar');
    if (avatarURL) {
      const avatarEl = document.getElementById('avatar');
      if (avatarEl) {
        avatarEl.src = avatarURL;
      }
    }
  });