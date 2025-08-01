import { notyf } from '../../plugins/notify.js';


export async function login() {
    const usuario = document.getElementById("user_name").value;
    const contrasena = document.getElementById("password").value;

    const params = new URLSearchParams({
        quest: 'login',
        usuario,
        contrasena
    });

    try {
        const response = await fetch(`../../../assets/php/auth/auth.php?${params.toString()}`, {
            method: 'GET'
        });

        const data = await response.json();

        if (response.status === 200 && data?.success) {
            notyf.success(escapeHtml(data.greeting));
            sessionStorage.setItem('usuario_principal', data.usuario);
            sessionStorage.setItem('nombre', data.nombre);
            sessionStorage.setItem('idUsuario', data.idUsuario);

            const avatar = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(data.usuario)}`;
            sessionStorage.setItem('avatar', avatar);

            setTimeout(() => {
                window.location.href = "../../../pages/dashboards/main.html";
            }, 750);

            return true;
        } else {
            if (response.status === 400 || response.status === 404) {
                notyf.open({
                    type: 'warning',
                    message: escapeHtml(data.error || data.message || 'Error inesperado')
                });
            } else if (response.status === 401) {
                notyf.error(escapeHtml(data.error || 'Contraseña incorrecta'));
            } else {
                notyf.error(escapeHtml(data.error || 'Error desconocido'));
            }
            sessionStorage.removeItem('usuario_principal');
            return false;
        }
    } catch (error) {
        notyf.error('Error en el proceso: ' + error.message);
        return false;
    }
}

function escapeHtml(unsafe) {
    return unsafe?.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;") || '';
}

// Mostrar/ocultar contraseña
const togglePassword = document.getElementById("togglePassword");
const passwordField = document.getElementById("password");

togglePassword.addEventListener("click", function () {
    const type = passwordField.type === "password" ? "text" : "password";
    passwordField.type = type;
    this.classList.toggle("fa-eye-slash");
});

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById("loginForm");
    if (form) {
        form.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault(); 
                login(); 
            }
        });
    }
    
});

// Exponer login para uso global (onclick del botón)
window.login = login;
