let dataTableInstance;

document.addEventListener('DOMContentLoaded', () => {
    // Cargar avatar al inicio
    const avatarURL = sessionStorage.getItem('avatar');
    if (avatarURL) {
        const avatarEl = document.getElementById('avatar');
        if (avatarEl) avatarEl.src = avatarURL;
    }

    // Funcionalidad para la barra lateral
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', function () {
            document.body.classList.toggle('sidebar-collapsed');
        });
    }

    const tipoBoletaSelect = document.getElementById('tipoBoletaFilter');

    loadTicketsAndInitTable(tipoBoletaSelect.value);

    tipoBoletaSelect.addEventListener('change', () => {
        const nuevoTipoBoleta = tipoBoletaSelect.value;
        loadTicketsAndInitTable(nuevoTipoBoleta);
    });

    $('#boletas-table-body').on('click', 'button', async function () {
        const action = $(this).data('action');
        const boletaId = $(this).data('id');

        if (!action || !boletaId) return;

        switch (action) {
            case 'details':
                const tipoBoleta = tipoBoletaSelect.value;
                const ticketDetails = await getTicketDetails(boletaId, tipoBoleta);
                mostrarDetalles(ticketDetails, tipoBoleta); // <-- Pasa el tipoBoleta aquí
                break;
            case 'pdf':
                exportarDetallePDF(boletaId);
                break;
        }
    });
});

/**
 * Función principal que obtiene los datos del backend y luego inicializa la tabla.
 * @param {string} tipoBoleta - El valor del 'quest' para enviar al backend.
 */
async function loadTicketsAndInitTable(tipoBoleta) {
    if (dataTableInstance) {
        dataTableInstance.clear().draw();
        dataTableInstance.processing(true);
    } else {
        $('#boletas-table-body').html('<tr><td colspan="4" class="text-center">Cargando...</td></tr>');
    }

    const idCreador = sessionStorage.getItem('idUsuario');
    if (!idCreador) {
        console.error("No se encontró el ID del usuario (idUsuario) en sessionStorage.");
        $('#boletas-table-body').html('<tr><td colspan="4" class="text-center text-danger">Error: No se pudo identificar al usuario.</td></tr>');
        return;
    }

    const ticketsData = await getTickets(idCreador, tipoBoleta);
    initDataTable(ticketsData);
}

/**
 * Llama a la API para obtener los tickets del usuario.
 * @param {string} idCreador - El ID del usuario para filtrar las boletas.
 * @param {string} quest - El tipo de boleta a solicitar.
 * @returns {Promise<Array>}
 */
async function getTickets(idCreador, quest) {
    try {
        const url = new URL('/permisos/assets/php/tickets/tickets.php', window.location.origin);
        url.searchParams.set('quest', quest);
        url.searchParams.set('idCreador', idCreador);

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data["my tickets"]) {
            return data["my tickets"];
        } else {
            console.warn(data.error || `No se encontraron boletas para '${quest}'.`);
            return [];
        }
    } catch (error) {
        console.error("Error de conexión al obtener los tickets:", error);
        return [];
    }
}

/**
 * Inicializa la librería DataTables en nuestra tabla HTML.
 * @param {Array} ticketsData - El array de datos de los tickets.
 */
function initDataTable(ticketsData) {
    if (dataTableInstance) {
        dataTableInstance.clear();
        dataTableInstance.rows.add(ticketsData);
        dataTableInstance.draw();
        dataTableInstance.processing(false);
        return;
    }

    dataTableInstance = new DataTable('#boletas-table', {
        data: ticketsData,
        responsive: true,
        order: [[3, 'desc']], // Ordenar por la primera columna (ID Boleta) de forma descendente
        columns: [
            {
                data: 'idBoleta',
                render: (data) => `<strong>#${data || '-'}</strong>`
            },
            {
                data: 'fechaSolicitud',
                render: (data) => formatearFecha(data)
            },
            {
                data: 'idEstado',
                render: (data) => {
                    const estadoInfo = getEstado(data);
                    return `<span class="badge rounded-pill ${estadoInfo.clase}">${estadoInfo.texto}</span>`;
                }
            },
            {
                data: 'idBoleta',
                orderable: false,
                searchable: false,
                render: (data) => {
                    return `
                        <button class="btn btn-sm btn-outline-primary" data-id="${data}" data-action="details" title="Ver Detalles">
                            <i class="fa fa-search"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger ms-1" data-id="${data}" data-action="pdf" title="Exportar PDF">
                            <i class="fa fa-file-pdf"></i>
                        </button>
                    `;
                }
            }
        ],

        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.0.8/i18n/es-ES.json',
            processing: 'Cargando datos...'
        }
    });
}

// --- FUNCIONES AUXILIARES (MODIFICADAS Y AÑADIDAS) ---

// Nuevo: Obtiene los detalles de la boleta desde el backend
// Obtiene los detalles de una boleta desde el backend reutilizando el endpoint existente
async function getTicketDetails(idBoleta, quest) {
    try {
        const idCreador = sessionStorage.getItem('idUsuario');
        if (!idCreador) {
            console.error("No se encontró el ID del usuario en sessionStorage.");
            return null;
        }

        const url = new URL('/permisos/assets/php/tickets/tickets.php', window.location.origin);
        url.searchParams.set('quest', quest);
        url.searchParams.set('idCreador', idCreador);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();
        if (data.success && Array.isArray(data["my tickets"])) {
            const ticket = data["my tickets"].find(t => String(t.idBoleta) === String(idBoleta));
            return ticket || null;
        }
        return null;
    } catch (error) {
        console.error("Error al obtener los detalles del ticket:", error);
        return null;
    }
}

function generarDetallesDinamicos(ticket, tipoTicket) {
    let camposDinamicosHTML = '';
    
    switch (tipoTicket) {
        case 'getUserTicketVacations':
    const startDate = new Date(ticket.fechaInicio);
    const endDate = new Date(ticket.fechaFin);
    let vacationDaysHTML = '';
    
    // Loop through each day from start to end
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
        vacationDaysHTML += `<li>${d.toLocaleDateString('es-GT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>`;
    }
    
    camposDinamicosHTML = `
        <div class="detail-card col-12">
            <h5>Total de Días Solicitados</h5>
            <p>${ticket.totalD || '0'}</p>
        </div>
        <div class="detail-card col-12">
            <h5>Fechas solicitadas</h5>
            <ul>${vacationDaysHTML}</ul>
        </div>
    `;
    break;

        case 'getUserTicketReplaceTime':
            // Lógica para Reposición de Tiempo
            camposDinamicosHTML = `
                <div class="detail-card">
                    <h5>Fecha a Reponer</h5>
                    <p>${formatearFecha(ticket.fechaAReponer)}</p>
                </div>
                <div class="detail-card">
                    <h5>Fecha de Reposición</h5>
                    <p>${formatearFecha(ticket.fechaReposicion)}</p>
                </div>
                <div class="detail-card">
                    <h5>Total Horas a Reponer</h5>
                    <p>${ticket.horaI1R || '0'}</p>
                </div>
                <div class="detail-card">
                    <h5>Total Horas Repuestas</h5>
                    <p>${ticket.horaFIR || '0'}</p>
                </div>
            `;
            break;
        
        case 'getUserTicketJustification':
            // Lógica para Falta Justificada
            camposDinamicosHTML = `
                <div class="detail-card">
                    <h5>Fecha de la Falta</h5>
                    <p>${formatearFecha(ticket.fechaInicio)}</p>
                </div>
                <div class="detail-card">
                    <h5>Total Horas</h5>
                    <p>${ticket.totalHoras || '0'}</p>
                </div>
            `;
            break;

        case 'getUserTicketRequestIGSS':
        case 'getUserTicketOffIGSS':
            // Lógica para IGSS
            camposDinamicosHTML = `
                <div class="detail-card">
                    <h5>Fecha Consulta</h5>
                    <p>${formatearFecha(ticket.fechaConsulta)}</p>
                </div>
                <div class="detail-card">
                    <h5>Hora Inicio</h5>
                    <p>${ticket.horaInicio || 'N/A'}</p>
                </div>
                <div class="detail-card">
                    <h5>Hora Final</h5>
                    <p>${ticket.horaFin || 'N/A'}</p>
                </div>
                <div class="detail-card">
                    <h5>Total Horas</h5>
                    <p>${ticket.horasTotal || '0.00'}</p>
                </div>
                <div class="detail-card col-12">
                    <h5>Detalle de la Consulta</h5>
                    <p>${ticket.detalleConsulta || 'N/A'}</p>
                </div>
            `;
            break;

        case 'getUserOff':
            // Lógica para Sanciones
            camposDinamicosHTML = `
                <div class="detail-card col-12">
                    <h5>Tipo de Sanción</h5>
                    <p>${ticket.tipo || 'No especificado'}</p>
                </div>
            `;
            break;

        default:
            camposDinamicosHTML = `<div class="col-12"><p>Detalles no configurados para este tipo de boleta.</p></div>`;
            break;
    }

    return camposDinamicosHTML;
}

function mostrarDetalles(detalles, tipoBoleta) {
    if (!detalles) {
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los detalles de la boleta.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    const tipoBoletaNombre = getNombreTipoBoleta(tipoBoleta);
    const estadoInfo = getEstado(detalles.idEstado);

    // Llama a la nueva función para generar el contenido HTML dinámico
    const camposDinamicosHTML = generarDetallesDinamicos(detalles, tipoBoleta);

    const content = document.createElement('div');
    content.className = 'ticket-details';
    
    // Aquí se genera el HTML principal usando la información general y la parte dinámica
    content.innerHTML = `
        <div class="ticket-details-header">
            <div class="ticket-id">Boleta #${detalles.idBoleta}</div>
            <div class="ticket-status ${estadoInfo.clase}">${estadoInfo.texto}</div>
        </div>

        <div class="ticket-details-grid">
            <div class="detail-card">
                <h5>Tipo de boleta</h5>
                <p>${tipoBoletaNombre}</p>
            </div>
            <div class="detail-card">
                <h5>Solicitante</h5>
                <p>${detalles.idSolicitante || 'N/A'}</p>
            </div>
            <div class="detail-card">
                <h5>Departamento</h5>
                <p>${detalles.idDepartamento || 'N/A'}</p>
            </div>
            <div class="detail-card">
                <h5>Fecha de solicitud</h5>
                <p>${formatearFecha(detalles.fechaSolicitud)}</p>
            </div>
            ${camposDinamicosHTML} </div>

        <div class="ticket-timeline">
            <div class="timeline-title">Historial de la solicitud</div>
            ${detalles.historial && detalles.historial.length > 0 ? detalles.historial.map(item => `
                <div class="timeline-item">
                    <div class="timeline-date">${formatearFecha(item.fecha)}</div>
                    <div class="timeline-content">${item.accion} <span class="text-muted">por ${item.usuario}</span></div>
                </div>
            `).join('') : '<p>No hay historial disponible.</p>'}
        </div>
        
        <div class="action-buttons">
            <button class="action-btn btn-print" onclick="imprimirDetalles(${detalles.idBoleta})">
                <i class="fas fa-print"></i> Imprimir
            </button>
            <button class="action-btn btn-download" onclick="exportarDetallePDF(${detalles.idBoleta})">
                <i class="fas fa-download"></i> Descargar PDF
            </button>
            <button class="action-btn btn-close-modal" onclick="Swal.close()">
                <i class="fas fa-times"></i> Cerrar
            </button>
        </div>
    `;

    Swal.fire({
        title: `Detalles de la Boleta #${detalles.idBoleta}`,
        html: content,
        width: '900px',
        showConfirmButton: false,
        customClass: {
            popup: 'custom-swal-popup'
        },
        didOpen: () => {
            const popup = Swal.getPopup();
            popup.style.borderRadius = '16px';
            popup.style.overflow = 'hidden';
        }
    });
}

function formatearFecha(fechaStr) {
    if (!fechaStr) return '-';
    try {
        const fecha = new Date(fechaStr.replace(' ', 'T'));
        if (isNaN(fecha.getTime())) return fechaStr;
        return fecha.toLocaleDateString('es-GT', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (e) {
        return fechaStr;
    }
}

function getNombreTipoBoleta(quest) {
    const types = {
        'getUserTicketVacations': 'Vacaciones',
        'getUserTicketReplaceTime': 'Reposición de Tiempo',
        'getUserTicketJustification': 'Falta Justificada',
        'getUserTicketRequestIGSS': 'Consulta IGSS',
        'getUserTicketOffIGSS': 'Suspensión IGSS',
        'getUserOff': 'Sanciones'
    };
    return types[quest] || 'Desconocido';
}

function exportarDetallePDF(id) {
    Swal.fire({
        title: 'Exportar a PDF',
        text: `¿Deseas exportar los detalles de la boleta #${id} a PDF?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Exportar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#4361ee',
        cancelButtonColor: '#6c757d'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Exportando...',
                html: 'Generando documento PDF',
                timer: 2000,
                timerProgressBar: true,
                didOpen: () => { Swal.showLoading(); }
            }).then(() => {
                Swal.fire({
                    title: '¡Exportado!',
                    text: `El PDF de la boleta #${id} se ha generado correctamente.`,
                    icon: 'success',
                    confirmButtonText: 'Descargar',
                    confirmButtonColor: '#4361ee'
                });
            });
        }
    });
}

function imprimirDetalles(id) {
    Swal.fire({
        title: 'Preparando para imprimir',
        html: 'Generando vista de impresión...',
        timer: 1500,
        timerProgressBar: true,
        didOpen: () => { Swal.showLoading(); }
    }).then(() => {
        Swal.fire({
            title: 'Listo para imprimir',
            text: `La boleta #${id} se ha preparado para impresión.`,
            icon: 'success',
            confirmButtonText: 'Imprimir',
            confirmButtonColor: '#4361ee',
            showCancelButton: true,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                window.print();
            }
        });
    });
}