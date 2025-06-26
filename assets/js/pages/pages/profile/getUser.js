async function getUser() {
    try {
        const idUsuario = sessionStorage.getItem('idUsuario');
        if (!idUsuario) {
            mostrarError('ID de usuario no encontrado en sesión');
            return;
        }

        const response = await fetch(`http://localhost/permisos/assets/php/auth/auth.php?quest=getUser&idUsuario=${encodeURIComponent(idUsuario)}`, {
            method: 'GET'
        });

        const text = await response.text();
        let data = {};
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error("La respuesta del servidor no es JSON válido: " + text);
        }

        if (response.ok && data.success && data.user) {
            showUser(data.user);
        } else {
            const errorMsg = data.error || data.message || 'Error inesperado';
            if ([400, 404].includes(response.status)) {
                notyf.open({
                    type: 'warning',
                    message: escapeHtml(errorMsg)
                });
            } else if ([401, 403, 500].includes(response.status)) {
                notyf.error(escapeHtml(errorMsg));
            } else {
                notyf.error(escapeHtml('Error desconocido'));
            }
            mostrarError(errorMsg);
        }
    } catch (error) {
        const msg = 'Error al obtener datos del usuario: ' + error.message;
        notyf.error(escapeHtml(msg));
        mostrarError(msg);
    }
}

function getEmpresa(idEmpresa) {
    switch (idEmpresa) {
        case '1': // PROQUIMA
        case 1:
            return 'PROQUIMA';
        case '2':
        case 2: // UNHESA
            return 'UNHESA';
        case '3':
        case 3: // ECONACIONAL
            return 'ECONACIONAL';
        default:
            return idEmpresa || 'Empresa no definida';
    }
}

function showUser(user) {
    document.getElementById('nombre').textContent = user.nombre || 'nombre no definido';
    document.getElementById('puesto').textContent = user.puesto || 'puesto no definido';
    document.getElementById('empresa').textContent = getEmpresa(user.idEmpresa);
    document.getElementById('inicioLabores').textContent = user.inicioLabores || 'inicio de labores no definido';
    document.getElementById('vacaciones').textContent = user.vacaciones || 'vacaciones no definidas';
}


function mostrarError(msg) {
    document.getElementById('error').textContent = msg;
}


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

function logout() {
    sessionStorage.clear('usuario_principal');
    sessionStorage.clear('avatar');
    sessionStorage.clear('id_usuario');
    window.location.href = '../authentication/signin/login.html';
}

// Llama directamente a getUser cuando cargue la página
window.addEventListener('DOMContentLoaded', getUser);