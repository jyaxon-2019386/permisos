// Carga el avatar del usuario desde sessionStorage
document.addEventListener("DOMContentLoaded", function () { 
  const avatarURL = sessionStorage.getItem('avatar');
  if (avatarURL) {
    const avatarEl = document.getElementById('avatar');
    if (avatarEl) {
      avatarEl.src = avatarURL;
    }
  }

  getLastTicker();

  
});


// Función para cerrar sesión y redirigir al login
function logout() {
    sessionStorage.clear('usuario_principal');
    sessionStorage.clear('avatar');
    sessionStorage.clear('id_usuario');
    window.location.href = '../../pages/authentication/signin/login.html';
}

async function getLastTicker() {
    const idCreador = sessionStorage.getItem('idUsuario') || '1';
    const url = new URL('/permisos/assets/php/tickets/tickets.php', window.location.origin);
    url.searchParams.set('quest', 'getLastTicketVacations');
    url.searchParams.set('idCreador', idCreador);

    try {
        const response = await fetch(url.toString());
        const data = await response.json();
        const tbody = document.querySelector('#recentTicketsTable tbody');
        tbody.innerHTML = '';

        if (response.ok && data.success && data['my tickets']) {
            data['my tickets'].forEach(ticket => {
                const estado = getEstado(ticket.idEstado);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>#${ticket.idBoleta || '-'}</strong></td>
                    <td>${formatearFecha(ticket.fechaSolicitud) || '-'}</td>
                    <td><span class="badge rounded-pill ${estado.clase}">${estado.texto}</span></td>
                    <td>
                        <button class="btn-table-details btn-details" data-id="${ticket.idBoleta}" title="Ver Detalles">
                            <i class="fa fa-search"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            // Delegación de eventos para los botones de detalles
            tbody.addEventListener('click', function(event) {
                const btn = event.target.closest('.btn-details');
                if (btn) {
                    const idBoleta = btn.getAttribute('data-id');
                    mostrarDetallesReciente(idBoleta, data['my tickets']);
                }
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4">No hay boletas recientes.</td></tr>';
        }
    } catch (error) {
        console.error('Error al obtener las últimas boletas:', error);
        const tbody = document.querySelector('#recentTicketsTable tbody');
        tbody.innerHTML = '<tr><td colspan="4">Error de conexión.</td></tr>';
    }
}

// Mostrar detalles en modal para boletas recientes
function mostrarDetallesReciente(idBoleta, tickets) {
    const ticket = tickets.find(t => t.idBoleta == idBoleta);
    if (!ticket) return;
    let modal = document.getElementById('detailsModal');
    if (!modal) {
        // Crear el modal si no existe
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'detailsModal';
        modal.tabIndex = -1;
        modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="detailsModalLabel"></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="modalContent"></div>
            </div>
        </div>`;
        document.body.appendChild(modal);
    }
    document.getElementById('detailsModalLabel').textContent = `Detalles de la Boleta #${ticket.idBoleta}`;
    const modalContent = document.getElementById('modalContent');
    // Unir observaciones como en tickets.js
    const observaciones = [
        ticket.observaciones1,
        ticket.observaciones2,
        ticket.observaciones3,
        ticket.observaciones4
    ].filter(obs => obs).join('; ');
    modalContent.innerHTML = `
        <h5>Información General</h5>
        <div class="row g-3">
            <div class="col-md-6"><strong>Solicitante ID:</strong> ${ticket.idCreador || '-'}</div>
            <div class="col-md-6"><strong>Fecha Solicitud:</strong> ${formatearFecha(ticket.fechaSolicitud, true)}</div>
            <div class="col-md-6"><strong>Total Días:</strong> ${ticket.totalDias || 'N/A'}</div>
            <div class="col-md-6"><strong>Estado:</strong> ${getEstado(ticket.idEstado).texto}</div>
            <div class="col-12"><strong>Observaciones:</strong> ${observaciones || 'Sin observaciones.'}</div>
        </div>
    `;
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

// Utilidad: Estado de la boleta
function getEstado(idEstado) {
    const estados = {
        1: { texto: 'Esperando Nivel 1', clase: 'bg-estado-pendiente' },
        2: { texto: 'Esperando Nivel 2', clase: 'bg-estado-pendiente' },
        3: { texto: 'Esperando Nivel 3', clase: 'bg-estado-pendiente' },
        4: { texto: 'Autorizado', clase: 'bg-estado-autorizado' },
        5: { texto: 'Denegado Nivel 1', clase: 'bg-estado-denegado' },
        6: { texto: 'Denegado Nivel 2', clase: 'bg-estado-denegado' },
        7: { texto: 'Denegado Nivel 3', clase: 'bg-estado-denegado' },
        8: { texto: 'Esperando GG', clase: 'bg-estado-pendiente' },
        9: { texto: 'Autorizado por GG', clase: 'bg-estado-autorizado' },
        10: { texto: 'Rechazado por GG', clase: 'bg-estado-denegado' },
        11: { texto: 'Confirmado Recepción', clase: 'bg-estado-autorizado' },
        12: { texto: 'Revisado por RRHH', clase: 'bg-estado-otro' },
        13: { texto: 'No Repuso Tiempo', clase: 'bg-estado-denegado' },
        14: { texto: 'Anulado', clase: 'bg-estado-anulado' },
        15: { texto: 'Denegado por Sistema', clase: 'bg-estado-denegado' },
    };
    return estados[idEstado] || { texto: 'Desconocido', clase: 'bg-estado-anulado' };
}

// Utilidad: Formatear fecha
function formatearFecha(fechaStr, incluirHora = false) {
    if (!fechaStr) return '-';
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return fechaStr;
    const opcionesFecha = { day: '2-digit', month: '2-digit', year: 'numeric' };
    let fechaFormateada = fecha.toLocaleDateString('es-GT', opcionesFecha);
    if (incluirHora) {
        const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: true };
        fechaFormateada += ' ' + fecha.toLocaleTimeString('es-GT', opcionesHora);
    }
    return fechaFormateada;
}