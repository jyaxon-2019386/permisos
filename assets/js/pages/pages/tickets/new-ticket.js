document.addEventListener('DOMContentLoaded', function () {

    // Sidebar toggle functionality
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', function () {
            document.body.classList.toggle('sidebar-collapsed');
        });
    }

    // Load user avatar and username from session storage
    const avatarURL = sessionStorage.getItem('avatar');
    if(avatarURL){
        const avatarEl = document.getElementById('avatar');
        if(avatarEl) {
            avatarEl.src = avatarURL;
        }
    }
});

function logout() {
    sessionStorage.clear('usuario_principal');
    sessionStorage.clear('avatar');
    sessionStorage.clear('id_usuario');
    window.location.href = '../../pages/authentication/signin/login.html';
}