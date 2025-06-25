// Carga el avatar del usuario desde sessionStorage
document.addEventListener("DOMContentLoaded", function () { 
  const avatarURL = sessionStorage.getItem('avatar');
  if (avatarURL) {
    const avatarEl = document.getElementById('avatar');
    if (avatarEl) {
      avatarEl.src = avatarURL;
    }
  }
});


// Función para cerrar sesión y redirigir al login
function logout() {
    sessionStorage.clear('usuario_principal');
    sessionStorage.clear('avatar');
    sessionStorage.clear('id_usuario');
    window.location.href = '../../pages/authentication/signin/login.html';
}