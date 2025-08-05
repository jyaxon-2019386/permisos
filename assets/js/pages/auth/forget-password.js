import { notyf } from '../../plugins/notify.js';

export async function forgetPassword() {
    const usuario = document.getElementById('recovery_user').value.trim();
    const nuevaContrasena = document.getElementById('password').value.trim();
    const confirmarNuevaContrasena = document.getElementById('confirm_password').value.trim();

    try {
        const response = await fetch('../../../assets/php/auth/auth.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quest: 'forget-password',
                usuario: usuario,
                nuevaContrasena: nuevaContrasena,
                confirmarNuevaContrasena: confirmarNuevaContrasena
            })
        });
        
        const data = await response.json();
        
        if (data?.success) {
            notyf.success(escapeHtml(data.message));
            setTimeout(() => {
                window.location.href = "../signin/login.html";
            }, 2000);
            return true;
        } else {
            // Si el código HTTP es 400 o 404 mostramos advertencia
            if (response.status === 400 || response.status === 404) {
                notyf.open({
                    type: 'warning', // se debe haber definido en tu configuración de Notyf (en notify.js)
                    message: escapeHtml(data.error || data.message || 'Error inesperado')
                });
            } else if (response.status === 40) {
                // 401 se tratará como error (por ejemplo, contraseña incorrecta)
                notyf.error(escapeHtml(data.error || 'Contraseña incorrecta'));
            } else {
                notyf.error(escapeHtml(data.error || 'Error desconocido'));
            }
            sessionStorage.removeItem('usuario');
            return false;
        }
    } catch (error) {
        notyf.error('Error en el proceso: ' + error.message);
        return false;
    }
}

// Manejo del visor de contraseña
const togglePassword = document.getElementById("togglePassword");
const passwordField = document.getElementById("password"); 

if (togglePassword && passwordField) {
    togglePassword.addEventListener("click", function () {
        const type = passwordField.type === "password" ? "text" : "password";
        passwordField.type = type;
        this.classList.toggle("fa-eye-slash");
    });
}

function escapeHtml(unsafe) {
    return unsafe?.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;") || '';
}

window.forgetPassword = forgetPassword;