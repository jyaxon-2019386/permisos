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
                mostrarDetalles(ticketDetails, tipoBoleta);
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
            // Aseguramos que el estado se formatee correctamente para la tabla
            return data["my tickets"].map(ticket => {
                const estadoInfo = getEstado(ticket.Estado);
                return {
                    ...ticket,
                    Estado: estadoInfo.texto
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
        order: [[4, 'desc']],
        columns: [
            {
                data: 'idBoleta',
                render: (data) => `<strong>#${data || '-'}</strong>`
            },
            {
                data: 'FechaDeCreacion',
                render: (data) => data || '-'
            },
            {
                data: 'Estado',
                render: (data) => {
                    const estadoInfo = getEstadoPorTexto(data);
                    return `<span class="badge rounded-pill ${estadoInfo.clase}">${data}</span>`;
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

/**
 * Obtiene los detalles de una boleta desde el backend.
 * @param {string} idBoleta - El ID de la boleta a buscar.
 * @param {string} quest - El tipo de boleta.
 * @returns {Promise<object|null>}
 */
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

/**
 * Genera el HTML para los detalles específicos de cada tipo de boleta y las observaciones.
 * @param {object} ticket - El objeto con los datos de la boleta.
 * @param {string} tipoTicket - El tipo de boleta.
 * @returns {string} - El HTML generado.
 */
function generarDetallesDinamicos(ticket, tipoTicket) {
    let camposDinamicosHTML = '';
    
    // --- Lógica para campos específicos de cada tipo de boleta ---
    switch (tipoTicket) {
        case 'getUserTicketVacations':
            const fechasYDetalles = [
                { fecha: ticket.Fecha1, detalle: ticket.Detalle1 },
                { fecha: ticket.Fecha2, detalle: ticket.Detalle2 },
                { fecha: ticket.Fecha3, detalle: ticket.Detalle3 },
                { fecha: ticket.Fecha4, detalle: ticket.Detalle4 },
                { fecha: ticket.Fecha5, detalle: ticket.Detalle5 }
            ];

            let vacationDaysHTML = `
                <div class="table-responsive">
                    <table class="table table-bordered table-sm align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th style="width: 30%">Fecha</th>
                                <th style="width: 70%">Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            let hasRows = false;
            fechasYDetalles.forEach(item => {
                if (item.fecha) {
                    hasRows = true;
                    vacationDaysHTML += `
                        <tr>
                            <td>${formatearFecha(item.fecha)}</td>
                            <td>${item.detalle || 'Sin detalle'}</td>
                        </tr>
                    `;
                }
            });

            vacationDaysHTML += hasRows 
                ? `</tbody></table></div>` 
                : `<tr><td colspan="2" class="text-center text-muted">No se especificaron fechas.</td></tr></tbody></table></div>`;

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
            break;

        case 'getUserTicketReplaceTime':
            const fechasReposicion = [
                { fecha: ticket.Fecha1, fechaR: ticket.FechaR1 },
                { fecha: ticket.Fecha2, fechaR: ticket.FechaR2 },
                { fecha: ticket.Fecha3, fechaR: ticket.FechaR3 },
                { fecha: ticket.Fecha4, fechaR: ticket.FechaR4 },
                { fecha: ticket.Fecha5, fechaR: ticket.FechaR5 }
            ];

            let replaceTimeHTML = `
                <div class="table-responsive">
                    <table class="table table-bordered table-sm align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th style="width: 50%">Fecha a reponer</th>
                                <th style="width: 50%">Fecha de reposición</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            let hasReplaceRows = false;
            fechasReposicion.forEach(item => {
                if (item.fecha || item.fechaR) {
                    hasReplaceRows = true;
                    replaceTimeHTML += `
                        <tr>
                            <td>${item.fecha ? formatearFecha(item.fecha) : 'N/A'}</td>
                            <td>${item.fechaR ? formatearFecha(item.fechaR) : 'N/A'}</td>
                        </tr>
                    `;
                }
            });

            replaceTimeHTML += hasReplaceRows 
                ? `</tbody></table></div>` 
                : `<tr><td colspan="2" class="text-center text-muted">No se especificaron fechas.</td></tr></tbody></table></div>`;

            camposDinamicosHTML += `
                <div class="col-md-6">
                    <div class="detail-card">
                        <h5>Total de Horas</h5>
                        <p>${ticket.totalHoras || '0'} Horas</p>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="detail-card">
                        <h5>Total de Horas</h5>
                        <p>${ticket.totalHorasR || '0'} Horas</p>
                    </div>
                </div>

                <div class="col-md-12  detail-card-full">
                    <h5>Fechas de la Solicitud</h5>
                    ${replaceTimeHTML}
                </div>
            `;
            break;
            
        case 'getUserTicketJustification':
            const fechasJustificacion = [
                { fecha: ticket.fecha1, detalle: ticket.Detalle1 },
                { fecha: ticket.fecha2, detalle: ticket.Detalle2 },
                { fecha: ticket.fecha3, detalle: ticket.Detalle3 },
                { fecha: ticket.fecha4, detalle: ticket.Detalle4 },
                { fecha: ticket.fecha5, detalle: ticket.Detalle5 }
            ];

            let justificationHTML = `
                <div class="table-responsive">
                    <table class="table table-bordered table-sm align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th style="width: 30%">Fecha</th>
                                <th style="width: 70%">Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            let hasJustificationRows = false;
            fechasJustificacion.forEach(item => {
                if (item.fecha) {
                    hasJustificationRows = true;
                    justificationHTML += `
                        <tr>
                            <td>${formatearFecha(item.fecha)}</td>
                            <td>${item.detalle || 'Sin detalle'}</td>
                        </tr>
                    `;
                }
            });

            justificationHTML += hasJustificationRows
                ? `</tbody></table></div>`
                : `<tr><td colspan="2" class="text-center text-muted">No se especificaron fechas.</td></tr></tbody></table></div>`;

            camposDinamicosHTML += `
                <div class="col-md-6">
                    <div class="detail-card">
                        <h5>Total de Horas</h5>
                        <p>${ticket.totalHoras || '0'} Horas</p>
                    </div>
                </div>

                <div class="col-md-12 detail-card-full">  
                    <h5>Fechas y Detalles de la Justificación</h5>
                    ${justificationHTML}
                </div>
            `;
            break;
            
        case 'getUserTicketRequestIGSS':
            const igssHTML = `
                <div class="table-responsive">
                    <table class="table table-bordered table-sm align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th style="width: 30%">Fecha de Cita</th>
                                <th style="width: 30%">Horario</th>
                                <th style="width: 40%">Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${formatearFecha(ticket.Fecha) || '-'}</td>
                                <td>${ticket.HoraInicio || '-'} a ${ticket.HoraFinal || '-'}</td>
                                <td>${ticket.Detalle || 'Sin detalle'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;

            camposDinamicosHTML = `
                <div class="col-md-6">
                    <div class="detail-card">
                        <h5>Total de Horas</h5>
                        <p>${ticket.HorasTotal || '0'} Horas</p>
                    </div>
                </div>
                <div class="col-md-12 detail-card-full">
                    <h5>Fechas y Horario de la Cita</h5>
                    ${igssHTML}
                </div>
            `;
            break;

        case 'getUserTicketOffIGSS':
            const suspensionHTML = `
                <div class="table-responsive">
                    <table class="table table-bordered table-sm align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th style="width: 40%">Fecha de Inicio</th>
                                <th style="width: 40%">Fecha de Finalización</th>
                                <th style="width: 20%">Total de Días</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${formatearFecha(ticket.fechaInicio) || '-'}</td>
                                <td>${formatearFecha(ticket.fechaFinal) || '-'}</td>
                                <td>${ticket.TotalDias || '0'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
            camposDinamicosHTML = `
                <div class="col-md-12 detail-card-full">
                    <h5>Fechas de Suspensión</h5>
                    ${suspensionHTML}
                </div>
            `;
            break;
            
        case 'getUserOff':
            const sancionHTML = `
                <div class="table-responsive">
                    <table class="table table-bordered table-sm align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th style="width: 40%">Tipo</th>
                                <th style="width: 60%">Detalle de Sanción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${ticket.Tipo || '-'}</td>
                                <td>${ticket.observaciones1 || 'Sin detalle'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;

            camposDinamicosHTML = `
            <div class="col-md-6">
                <div class="detail-card-tipo">
                    <h5>Tipo de Sanción</h5>
                    <ul class="list-group list-group-flush mt-2">
                        <strong>${ticket.Tipo}</strong>
                    </ul>
                </div>
            </div>
            `;
            break;

        default:
            camposDinamicosHTML = `<div class="col-12"><p>Detalles no configurados para este tipo de boleta.</p></div>`;
            break;
    }

    // --- Lógica para manejar todas las observaciones ---
    let observacionesHTML = '';
    const observacionesKeys = ['observaciones1', 'observaciones2', 'observaciones3', 'observaciones4'];
    observacionesKeys.forEach((key, index) => {
        if (ticket[key] && ticket[key].trim() !== '') {
            observacionesHTML += `<li class="list-group-item"><strong>Observación ${index + 1}:</strong> ${ticket[key]}</li>`;
        }
    });

    if (observacionesHTML !== '') {
        camposDinamicosHTML += `
            <div class="col-md-6">
                <div class="detail-card">
                    <h5>Observaciones</h5>
                    <ul class="list-group list-group-flush mt-2">
                        ${observacionesHTML}
                    </ul>
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
    const estadoInfo = getEstado(detalles.Estado);

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
                    <h5>Departamento</h5>
                    <p>${detalles.Departamento || 'N/A'}</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="detail-card">
                    <h5>Fecha de solicitud</h5>
                    <p>${detalles.FechaDeCreacion}</p>
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
        customClass: { popup: 'custom-swal-popup' }
    });
}

/**
 * Formatea una cadena de fecha.
 * @param {string} fechaStr - La cadena de fecha.
 * @returns {string} - La fecha formateada o '-' si es inválida.
 */
/**
 * Formatea una cadena de fecha a un formato legible en español de Guatemala.
 * Valida que la fecha sea válida antes de intentar el formateo.
 * @param {string} fechaStr - La cadena de fecha a formatear.
 * @returns {string} - La fecha formateada o '-' si es inválida.
 */
function formatearFecha(fechaStr) {
    // Si la cadena es nula, vacía o solo espacios en blanco, retorna un guion.
    if (!fechaStr || fechaStr.trim() === '') {
        return '-';
    }

    // Comprobar si la cadena es la fecha no válida conocida.
    if (fechaStr === '2000-01-01 00:00:00.000') {
        return '-';
    }

    let fecha;

    // Patrón regex para validar fechas en formato dd/mm/yyyy
    const regexDDMMYYYY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = fechaStr.match(regexDDMMYYYY);

    if (match) {
        // Si el formato es dd/mm/yyyy, extrae las partes y crea el objeto Date.
        // Se resta 1 al mes porque los meses en JavaScript van de 0 a 11.
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const year = parseInt(match[3], 10);
        fecha = new Date(year, month, day);

        // Valida si el objeto Date creado corresponde a la fecha original
        // Esto previene fechas como '31/02/2023' que JS podría convertir a '03/03/2023'.
        if (fecha.getFullYear() !== year || fecha.getMonth() !== month || fecha.getDate() !== day) {
            return '-';
        }
    } else {
        // Intenta parsear la fecha directamente si no coincide con el patrón dd/mm/yyyy.
        // Se reemplaza ' ' con 'T' para manejar formatos ISO 8601 si aplica.
        fecha = new Date(fechaStr.replace(' ', 'T'));
    }

    // Valida si el objeto Date es válido.
    if (isNaN(fecha.getTime())) {
        return '-';
    }

    // Formatea la fecha a un formato legible y retorna el resultado.
    return fecha.toLocaleDateString('es-GT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Devuelve el nombre legible del tipo de boleta.
 * @param {string} quest - El identificador del tipo de boleta.
 * @returns {string}
 */
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

// Función para cerrar sesión y redirigir al login
function logout() {
    sessionStorage.clear('usuario');
    sessionStorage.clear('avatar');
    sessionStorage.clear('id_usuario');
    window.location.href = '../../pages/authentication/signin/login.html';
}

window.logout = logout; // Exponer la función de logout globalmente