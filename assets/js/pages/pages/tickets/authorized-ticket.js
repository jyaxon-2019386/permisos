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
                // Obtenemos los datos originales de la fila para evitar una nueva llamada a la API
                const rowData = dataTableInstance.row($(this).parents('tr')).data();
                mostrarDetalles(rowData, tipoBoleta);
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
        $('#boletas-table-body').html('<tr><td colspan="5" class="text-center">Cargando...</td></tr>');
    }

    const idDepartamentoP = sessionStorage.getItem('departamento');
    const idSolicitante = sessionStorage.getItem('idUsuario');

    if (!idDepartamentoP || !idSolicitante) {
        console.error("No se encontró el ID del departamento o del solicitante en sessionStorage.");
        $('#boletas-table-body').html('<tr><td colspan="5" class="text-center text-danger">Error: No se pudo identificar al usuario.</td></tr>');
        return;
    }
    const ticketsData = await getTickets(tipoBoleta, idDepartamentoP, idSolicitante);
    initDataTable(ticketsData);
}

/**
 * Llama a la API para obtener los tickets.
 * @param {string} quest - El tipo de boleta a solicitar.
 * @returns {Promise<Array>}
 */
async function getTickets(quest, idDepartamentoP, idSolicitante) {
    try {
        const url = new URL('/permisos/assets/php/tickets/tickets.php', window.location.origin);
        url.searchParams.set('quest', quest);
        url.searchParams.set('idDepartamento', idDepartamentoP);
        url.searchParams.set('idSolicitante', idSolicitante);

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data["my tickets"]) {
            // --- MODIFICACIÓN CLAVE ---
            // Mapeamos los tickets para forzar el estado a "Pendiente"
            return data["my tickets"].map(ticket => {
                const estadoInfo = getEstadoInfo(ticket.Estado); // Obtenemos la info original
                return {
                    ...ticket,
                    // Forzamos el texto a "Pendiente" pero mantenemos el id original si es necesario
                    EstadoTexto: 'Pendiente', 
                    // Guardamos la clase CSS del estado pendiente para usarla después
                    EstadoClase: getEstadoInfo(1).clase 
                };
            });
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
        order: [
            [1, 'desc']
        ],
        columns: [{
            data: 'idBoleta',
            render: (data) => `<strong>#${data || '-'}</strong>`
        }, {
            data: 'FechaDeCreacion',
            render: (data) => data || '-'
        }, {
            // Columna de Estado
            data: 'EstadoTexto',
            render: (data, type, row) => {
                // Usamos la clase CSS que guardamos previamente
                return `<span class="badge rounded-pill ${row.EstadoClase}">${data}</span>`;
            }
        }, {
            data: 'Solicitante',
            render: (data) => data || '-'
        }, {
            data: 'idBoleta',
            orderable: false,
            searchable: false,
            render: (data) => {
                return `
                    <div class="d-flex justify-content-center">
                        <button class="btn btn-sm btn-outline-primary me-1" data-id="${data}" data-action="details" title="Ver Detalles">
                            <i class="fa fa-search"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" data-id="${data}" data-action="pdf" title="Exportar PDF">
                            <i class="fa fa-file-pdf"></i>
                        </button>
                    </div>
                `;
            }
        }],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.0.8/i18n/es-ES.json',
            processing: 'Cargando datos...'
        }
    });
}

/**
 * Genera el HTML para los detalles específicos de cada tipo de boleta.
 * (Sin cambios en esta función, pero se incluye para que el código esté completo)
 */
function generarDetallesDinamicos(ticket, tipoTicket) {
    let camposDinamicosHTML = '';
    
    // La lógica de tus 'switch-case' para cada tipo de boleta va aquí...
    // Ejemplo para 'Vacaciones':
    if (tipoTicket === 'getTicketVacationAuthorized') {
        const fechasYDetalles = [
            { fecha: ticket.Fecha1, detalle: ticket.Detalle1 },
            { fecha: ticket.Fecha2, detalle: ticket.Detalle2 },
            { fecha: ticket.Fecha3, detalle: ticket.Detalle3 },
            { fecha: ticket.Fecha4, detalle: ticket.Detalle4 },
            { fecha: ticket.Fecha5, detalle: ticket.Detalle5 }
        ];

        let hasRows = fechasYDetalles.some(item => item.fecha && item.fecha.trim() !== '');
        
        let vacationDaysHTML = '<p class="text-muted">No se especificaron fechas.</p>';

        if (hasRows) {
            vacationDaysHTML = `
                <div class="table-responsive">
                    <table class="table table-bordered table-sm align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th style="width: 30%">Fecha</th>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${fechasYDetalles.filter(item => item.fecha && item.fecha.trim() !== '').map(item => `
                                <tr>
                                    <td>${formatearFecha(item.fecha)}</td>
                                    <td>${item.detalle || 'Sin detalle'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>`;
        }
        
        camposDinamicosHTML += `
            <div class="col-md-6">
                <div class="detail-card">
                    <h5>Total de Días</h5>
                    <p>${ticket.TotalDias || '0'}</p>
                </div>
            </div>
            <div class="col-md-12 detail-card-full">
                <h5>Fechas y Detalles de la Solicitud</h5>
                ${vacationDaysHTML}
            </div>
        `;
    } else {
         camposDinamicosHTML = `<div class="col-12"><p>Detalles no configurados para este tipo de boleta.</p></div>`;
    }

    // Lógica para las observaciones
    const observacionesKeys = ['observaciones1', 'observaciones2', 'observaciones3', 'observaciones4'];
    const observacionesHTML = observacionesKeys
        .map((key, index) => {
            if (ticket[key] && ticket[key].trim() !== '') {
                return `<li class="list-group-item"><strong>Observación ${index + 1}:</strong> ${ticket[key]}</li>`;
            }
            return '';
        })
        .join('');

    if (observacionesHTML) {
        camposDinamicosHTML += `
            <div class="col-md-12">
                <div class="detail-card">
                    <h5>Observaciones</h5>
                    <ul class="list-group list-group-flush mt-2">${observacionesHTML}</ul>
                </div>
            </div>
        `;
    }

    return camposDinamicosHTML;
}


/**
 * Muestra el modal de SweetAlert con los detalles de la boleta.
 * @param {object} detalles - El objeto con los datos de la boleta.
 * @param {string} tipoBoleta - El tipo de boleta.
 */
function mostrarDetalles(detalles, tipoBoleta) {
    if (!detalles) {
        Swal.fire('Error', 'No se pudieron cargar los detalles de la boleta.', 'error');
        return;
    }

    const tipoBoletaNombre = getNombreTipoBoleta(tipoBoleta);
    // Usamos el texto y la clase que ya procesamos
    const estadoInfo = { texto: detalles.EstadoTexto, clase: detalles.EstadoClase }; 

    const camposDinamicosHTML = generarDetallesDinamicos(detalles, tipoBoleta);

    const content = document.createElement('div');
    content.className = 'ticket-details';

    content.innerHTML = `
        <div class="ticket-details-header">
            <div class="ticket-id">Boleta #${detalles.idBoleta}</div>
            <div class="ticket-status ${estadoInfo.clase}">${estadoInfo.texto}</div>
        </div>

        <div class="row g-3">
            <div class="col-md-6">
                <div class="detail-card">
                    <h5>Tipo de boleta</h5>
                    <p>${tipoBoletaNombre}</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="detail-card">
                    <h5>Solicitante</h5>
                    <p>${detalles.Solicitante || 'N/A'}</p>
                </div>
            </div>
             <div class="col-md-6">
                <div class="detail-card">
                    <h5>Fecha de solicitud</h5>
                    <p>${detalles.FechaDeCreacion || 'N/A'}</p>
                </div>
            </div>
             <div class="col-md-6">
                <div class="detail-card">
                    <h5>Puesto</h5>
                    <p>${detalles.Puesto || 'N/A'}</p>
                </div>
            </div>
            ${camposDinamicosHTML}
        </div>
    `;

    Swal.fire({
        title: `Detalles de la Boleta #${detalles.idBoleta}`,
        html: content,
        width: '900px',
        showConfirmButton: false,
        customClass: {
            popup: 'custom-swal-popup'
        }
    });
}

/**
 * Formatea una cadena de fecha a un formato legible.
 * @param {string} fechaStr - La cadena de fecha.
 * @returns {string} - La fecha formateada o '-'.
 */
function formatearFecha(fechaStr) {
    if (!fechaStr || fechaStr.trim() === '' || fechaStr.startsWith('1900') || fechaStr.startsWith('2000-01-01')) {
        return '-';
    }
    const fecha = new Date(fechaStr.replace(' ', 'T'));
    if (isNaN(fecha.getTime())) {
        return '-';
    }
    return fecha.toLocaleDateString('es-GT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC' // Importante para evitar desfases de día
    });
}

/**
 * Devuelve el nombre legible del tipo de boleta.
 * @param {string} quest - El identificador del tipo de boleta.
 */
function getNombreTipoBoleta(quest) {
    const types = {
        'getTicketVacationAuthorized': 'Vacaciones',
        'getUserTicketReplaceTime': 'Reposición de Tiempo',
        'getUserTicketJustification': 'Falta Justificada',
        'getUserTicketRequestIGSS': 'Consulta IGSS',
        'getUserTicketOffIGSS': 'Suspensión IGSS',
        'getUserOff': 'Sanciones'
    };
    return types[quest] || 'Desconocido';
}

/**
 * Devuelve el objeto de información del estado según su ID.
 * @param {number} idEstado - El ID del estado (1, 2, 3).
 */
function getEstadoInfo(idEstado) {
    const estados = {
        1: { texto: 'Pendiente', clase: 'bg-estado-pendiente' },
       };
    return estados[idEstado] || { texto: 'Desconocido', clase: 'bg-secondary' };
}



function logout() {
    sessionStorage.clear();
    window.location.href = '../../pages/authentication/signin/login.html';
}

window.logout = logout;