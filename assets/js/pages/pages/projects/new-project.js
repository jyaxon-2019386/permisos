//  const notyf = new Notyf({
//   duration: 2000,
//   position: { x: 'right', y: 'top' },
//   types: [
//       {
//           type: 'success',
//           background: '#4CAF50',
//           icon: { className: 'fas fa-check', tagName: 'i', color: '#fff' }
//       },
//       {
//           type: 'error',
//           background: '#FF5252',
//           icon: { className: 'fas fa-times', tagName: 'i', color: '#fff' }
//       },
//       {
//           type: 'warning',
//           background: '#FFC107',
//           icon: { className: 'fas fa-exclamation-triangle', tagName: 'i', color: '#fff' }
//       }
//   ]
// });

import { notyf } from '../../../plugins/notify.js';

async function saveProject() {
  // Recopilar los datos del formulario
  const centro_costos = document.getElementById('centro_costos').value;
  const codigo = document.getElementById('codigo').innerText;
  const nombre_proyecto = document.getElementById('nombre_proyecto').value;
  const fecha_inicio = document.getElementById('fecha_inicio').value;
  const fecha_fin = document.getElementById('fecha_fin').value;
  const miembros_equipo = document.getElementById('miembros_equipo').value;
  const objetivos = document.getElementById('objetivos').value;
  const metas_indicadores = document.getElementById('metas_indicadores').value;
  const asignacionRecursosEl = document.querySelector('input[name="asignacionRecursos"]:checked');
  const asignacion_recursos = asignacionRecursosEl ? asignacionRecursosEl.value : "";
  const plan_trabajo = document.getElementById('planTrabajo').value;
  const descripcion_inversion = document.getElementById('descripcionInversion').value;
  const monto_inversion = document.getElementById('montoInversion').value;
  const retorno_inversion = document.getElementById('retornoInversion').value;
  const notas_importantes = document.getElementById('notasImportantes').value;
  const conclusion_final = document.getElementById('conclusionFinal').value;
  const evaluacion_exito = document.getElementById('exito').checked ? 1 : 0;
  const evaluacion_no_exito = document.getElementById('noExito').checked ? 1 : 0;
  const evaluacion_exito_parcial = document.getElementById('exitoParcial').checked ? 1 : 0;

  try {
    const response = await fetch('../../../assets/php/project/project.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quest: 'new-project', 
        centro_costos,
        codigo,
        nombre_proyecto,
        fecha_inicio,
        fecha_fin,
        miembros_equipo,
        objetivos,
        metas_indicadores,
        asignacion_recursos,
        plan_trabajo,
        descripcion_inversion,
        monto_inversion,
        retorno_inversion,
        notas_importantes,
        conclusion_final,
        evaluacion_exito,
        evaluacion_no_exito,
        evaluacion_exito_parcial    
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data?.success) {
      notyf.success(escapeHtml(data.message));
      setTimeout(() => {
        window.location.href = '../../../pages/pages/projects/projects.html';
      }, 1500);
      return true;
    } else {
                // Si el código HTTP es 400 o 404 mostramos advertencia
                if (response.status === 400 || response.status === 404) {
                    notyf.open({ 
                        type: 'warning', // se debe haber definido en tu configuración de Notyf (en notify.js)
                        message: escapeHtml(data.error || data.message || 'Error inesperado')
                    });
                } else if (response.status === 401) {
                    // 401 se tratará como error (por ejemplo, contraseña incorrecta)
                    notyf.error(escapeHtml(data.error || 'Contraseña incorrecta'));
                } else {
                    notyf.error(escapeHtml(data.error || 'Error desconocido'));
                }
                sessionStorage.removeItem('usuario');
                return false;
            }
  } catch (error) {
    notyf.error('Error de conexión: ' + error.message);
    return false;
  }
}

// Función para escapar cadenas y prevenir XSS
function escapeHtml(unsafe) {
  return unsafe?.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;") || '';
}

// Funciones toggleSidebar y logout se mantienen igual...
function toggleSidebar(){
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  if (getComputedStyle(sidebar).display === 'none') {
      sidebar.style.display = 'block';
      mainContent.style.marginLeft = "220px";
  } else {
      sidebar.style.display = 'none';
      mainContent.style.marginLeft = "0";
  }
}

function logout() {
  sessionStorage.clear('usuario');
  sessionStorage.clear('avatar');
  sessionStorage.clear('id_usuario');
  window.location.href = '../../../pages/authentication/signin/login.html';
}

document.addEventListener("DOMContentLoaded", function () { 
  const avatarURL = sessionStorage.getItem('avatar');
  if (avatarURL) {
    const avatarEl = document.getElementById('avatar');
    if (avatarEl) {
      avatarEl.src = avatarURL;
    }
  }
});

window.saveProject = saveProject;
window.toggleSidebar = toggleSidebar;
window.logout = logout;