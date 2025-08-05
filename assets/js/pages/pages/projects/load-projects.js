import { notyf } from '../../../plugins/notify.js';

export async function getProjects() {
    // Obtiene el id del usuario desde la sesión (o donde lo hayas almacenado)
    const id_usuario = sessionStorage.getItem('usuario_id');
    if (!id_usuario) {
        notyf.error("Usuario no autenticado");
        return [];
    }

    try {
        const response = await fetch(`../../../assets/php/project/project.php?quest=get-all&id_usuario=${id_usuario}`, {
            method: 'GET'
        });
        
        const data = await response.json();

        if (response.status === 200 && data.success) {
          notyf.success(escapeHtml(data.message || 'Datos Cargados'));
          return data.proyectos;  
    
        } else {
                    // Si el código HTTP es 400 o 404 mostramos advertencia
                  if (response.status === 400 || response.status === 404 ) {
                      notyf.open({ 
                          type: 'warning',
                          message: escapeHtml(data.error || data.message || 'Error inesperado')
                      });
                  } else if (response.status === 401 || response.status === 403 || response.status === 500) {
                      notyf.error(escapeHtml(data.error || 'Recurso no cargado'));
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

function escapeHtml(unsafe) {
  return unsafe?.toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;") || '';
}

window.getProjects = getProjects;



// const notyf = new Notyf({
//     duration: 5000,
//     position: { x: 'right', y: 'top' },
//     types: [
//       {
//         type: 'success',
//         background: '#4CAF50',
//         icon: { className: 'fas fa-check', tagName: 'i', color: '#fff' }
//       },
//       {
//         type: 'error',
//         background: '#FF5252',
//         icon: { className: 'fas fa-times', tagName: 'i', color: '#fff' }
//       }
//     ]
//   });
  
//   function loadUserProjects() {
//     return new Promise((resolve) => {
//       // Obtener el ID del usuario (puede ser almacenado en sessionStorage o en otro lugar)
//       const userId = sessionStorage.getItem('userId');
      
//       if (!userId) {
//         notyf.error('Usuario no autenticado.');
//         resolve(false);
//         return;
//       }
  
//       // Enviar la solicitud para obtener los proyectos del usuario
//       $.ajax({
//         url: '../../../assets/php/project/project.php',
//         type: 'POST',
//         contentType: 'application/json',
//         data: JSON.stringify({
//           quest: 'get-user-projects',  // Enviar la solicitud para obtener proyectos asignados
//           user_id: userId             // Enviar el ID del usuario
//         }),
//         dataType: 'json',
//         success: function (response) {
//           if (response?.success) {
//             // Aquí podrías manipular la respuesta y mostrar los proyectos en el frontend
//             notyf.success(escapeHtml(response.message));
//             displayProjects(response.projects);  // Asumiendo que la respuesta tiene un campo 'projects' con los datos
//             resolve(true);
//           } else {
//             const errorMsg = response?.message || response?.error || 'Error desconocido';
//             notyf.error(escapeHtml(errorMsg));
//             resolve(false);
//           }
//         },
//         error: function (xhr) {
//           let errorMessage = 'Error de conexión';
//           if (xhr.responseJSON && (xhr.responseJSON.error || xhr.responseJSON.message)) {
//             errorMessage = xhr.responseJSON.error || xhr.responseJSON.message;
//           }
//           notyf.error(errorMessage);
//           resolve(false);
//         }
//       });
//     }).catch(error => {
//       notyf.error('Error en el proceso: ' + error.message);
//       return false;
//     });
//   }
  
//   // Función para mostrar los proyectos en el frontend
//   function displayProjects(projects) {
//     const projectListContainer = document.getElementById('projectsList');
//     projectListContainer.innerHTML = '';  // Limpiar lista previa
  
//     projects.forEach(project => {
//       const projectItem = document.createElement('div');
//       projectItem.className = 'project-item';
//       projectItem.innerHTML = `
//         <h3>${escapeHtml(project.nombre_proyecto)}</h3>
//         <p><strong>Código:</strong> ${escapeHtml(project.codigo)}</p>
//         <p><strong>Fecha de inicio:</strong> ${escapeHtml(project.fecha_inicio)}</p>
//         <p><strong>Fecha de fin:</strong> ${escapeHtml(project.fecha_fin)}</p>
//         <p><strong>Líder del proyecto:</strong> ${escapeHtml(project.lider_proyecto)}</p>
//         <p><strong>Estado:</strong> ${escapeHtml(project.estado)}</p>
//       `;
//       projectListContainer.appendChild(projectItem);
//     });
//   }
  
//   // Llamar la función al cargar la página
//   document.addEventListener("DOMContentLoaded", function () {
//     loadUserProjects();  // Cargar los proyectos asignados al usuario
//   });
  
//   // Función para escapar cadenas y prevenir XSS
//   function escapeHtml(unsafe) {
//     return unsafe?.toString()
//       .replace(/&/g, "&amp;")
//       .replace(/</g, "&lt;")
//       .replace(/>/g, "&gt;")
//       .replace(/"/g, "&quot;")
//       .replace(/'/g, "&#039;") || '';
//   }
  

