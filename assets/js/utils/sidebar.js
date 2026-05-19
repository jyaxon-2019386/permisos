document.addEventListener("DOMContentLoaded", function () {
    // 1. Verify if user is logged in
    const usuario = sessionStorage.getItem('usuario');
    if (!usuario) {
        // Redirigir al login si no hay sesión
        const path = window.location.pathname;
        if (path.includes('/pages/ticket/') || path.includes('/pages/pages/')) {
            window.location.href = '../../authentication/signin/login.html';
        } else if (path.includes('/pages/dashboards/')) {
            window.location.href = '../authentication/signin/login.html';
        } else {
            window.location.href = '/permisos/pages/authentication/signin/login.html';
        }
        return;
    }

    // 2. Load user avatar
    const avatarURL = sessionStorage.getItem('avatar');
    if (avatarURL) {
        const avatarEl = document.getElementById('avatar');
        if (avatarEl) {
            avatarEl.src = avatarURL;
        }
    }

    // 3. Setup toggle sidebar listener
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', function () {
            document.body.classList.toggle('sidebar-collapsed');
        });
    }

    const sidebarElement = document.querySelector('aside.sidebar');
    if (sidebarElement) {
        const path = window.location.pathname;
        
        // Define items centralized for all users
        const menuItems = [
            {
                text: 'Inicio',
                icon: 'fa-home',
                href: '/permisos/pages/ticket/new-ticket.html',
                active: path.includes('new-ticket.html')
            },
            {
                text: 'Nueva Solicitud',
                icon: 'fa-plus',
                href: '/permisos/pages/ticket/new-ticket.html',
                active: path.includes('add-ticket-vacation.html') || 
                        path.includes('igss-ticket.html') || 
                        path.includes('igss-off-ticket.html') || 
                        path.includes('special-ticket.html') || 
                        path.includes('ticket-time.html') || 
                        path.includes('sanction-ticket.html')
            },
            {
                text: 'Mis Boletas',
                icon: 'fa-folder-open',
                href: '/permisos/pages/ticket/my-ticket.html',
                active: path.includes('my-ticket.html')
            },
            {
                text: 'Autorizar Boletas',
                icon: 'fa-check-double',
                href: '/permisos/pages/ticket/authorized-ticket.html',
                active: path.includes('authorized-ticket.html')
            },
            {
                text: 'Boletas (RRHH)',
                icon: 'fa-folder',
                href: '/permisos/pages/ticket/ticket.html',
                active: path.includes('ticket.html') && !path.includes('my-ticket.html') && !path.includes('authorized-ticket.html')
            },
            {
                text: 'Mi Perfil',
                icon: 'fa-user',
                href: '/permisos/pages/pages/profile/profile.html',
                active: path.includes('profile.html')
            }
        ];

        // Generate HTML
        let menuHTML = '';
        menuItems.forEach(item => {
            menuHTML += `<li><a href="${item.href}" class="${item.active ? 'active' : ''}"><i class="fa ${item.icon}"></i> ${item.text}</a></li>`;
        });

        sidebarElement.innerHTML = `
            <div class="sidebar-header">
                <h2 class="sidebar-logo">PERMISOS</h2>
            </div>
            <ul class="sidebar-menu">
                ${menuHTML}
            </ul>
            <div class="sidebar-footer">
                <a href="#" data-bs-toggle="modal" data-bs-target="#logoutModal">
                    <i class="fa fa-sign-out-alt"></i> Cerrar sesión
                </a>
            </div>
        `;
    }
});

// Centralized logout function
function logout() {
    sessionStorage.clear();
    window.location.href = '/permisos/pages/authentication/signin/login.html';
}
window.logout = logout;
