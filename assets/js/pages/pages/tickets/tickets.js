// Almacena la lista completa de tickets obtenida de la API
let ticketsData = [];

document.addEventListener('DOMContentLoaded', () => {
    // Cargar avatar al inicio
    const avatarURL = sessionStorage.getItem('avatar');
    if (avatarURL) {
        const avatarEl = document.getElementById('avatar');
        if (avatarEl) avatarEl.src = avatarURL;
    }

    // Referencias a los elementos del DOM
    const idBoletaInput = document.getElementById('idBoletaFilter');
    const tipoTicketSelect = document.getElementById('tipoTicket');
    const fechaInicioInput = document.getElementById('fechaInicio');
    const fechaFinInput = document.getElementById('fechaFin');
    const btnLimpiar = document.getElementById('btnLimpiarFiltros');
    const ticketsContainer = document.getElementById('ticketsContainer');

    // --- Lógica de eventos separada ---

    // 1. Cuando cambia el TIPO de boleta, se piden nuevos datos al servidor
    tipoTicketSelect.addEventListener('change', () => {
        const tipo = tipoTicketSelect.value;
        const idCreador = sessionStorage.getItem('idUsuario') || '1';
        getTickets(tipo, idCreador);
    });

    // 2. Cuando se escribe en los filtros, se aplica el filtro localmente
    idBoletaInput.addEventListener('input', filtrarYMostrarTickets);
    fechaInicioInput.addEventListener('change', filtrarYMostrarTickets);
    fechaFinInput.addEventListener('change', filtrarYMostrarTickets);

    // 3. El botón Limpiar resetea los campos y aplica el filtro local
    btnLimpiar.addEventListener('click', () => {
        idBoletaInput.value = '';
        fechaInicioInput.value = '';
        fechaFinInput.value = '';
        filtrarYMostrarTickets();
    });

    // 4. Listener para los clics en los botones de detalles (delegación de eventos)
    ticketsContainer.addEventListener('click', (event) => {
        const detailsButton = event.target.closest('.btn-details');
        if (detailsButton) {
            const boletaId = detailsButton.dataset.id;
            mostrarDetalles(boletaId);
        }
    });

    // --- Carga inicial de tickets ---
    getTickets(tipoTicketSelect.value, sessionStorage.getItem('idUsuario') || '1');
    
});


// --- LÓGICA DE DATOS (API) ---
// Su única responsabilidad es OBTENER los datos del servidor
async function getTickets(tipo, idCreador) {
    const contenedor = document.getElementById('ticketsContainer');
    mostrarCargando(contenedor);

    try {
        const url = new URL(`/permisos/assets/php/tickets/tickets.php`, window.location.origin);
        url.searchParams.set('quest', tipo);
        url.searchParams.set('idCreador', idCreador);

        const response = await fetch(url.toString());
        const data = await response.json();

        if (response.ok && data.success && data["my tickets"]) {
            ticketsData = data["my tickets"]; // Guardar la lista completa
        } else {
            ticketsData = []; // Limpiar si hay error o no hay datos
            mostrarError(data.error || data.message || "No se encontraron tickets.");
        }
    } catch (error) {
        ticketsData = [];
        console.error("Error al obtener tickets:", error);
        mostrarError("Error de conexión al obtener los tickets.");
    }

    // Una vez obtenidos los datos, se muestran aplicando los filtros actuales
    filtrarYMostrarTickets();
}

// --- LÓGICA DE FILTRADO LOCAL ---
// Filtra los datos ya existentes en `ticketsData` y los muestra
function filtrarYMostrarTickets() {
    // Obtener los valores actuales de los filtros
    const idBoletaValue = document.getElementById('idBoletaFilter').value;
    const fechaInicioValue = document.getElementById('fechaInicio').value;
    const fechaFinValue = document.getElementById('fechaFin').value;

    // Empezar con la lista completa
    let ticketsFiltrados = [...ticketsData];

    // 1. Filtrar por ID de Boleta
    if (idBoletaValue) {
        ticketsFiltrados = ticketsFiltrados.filter(ticket =>
            ticket.idBoleta.includes(idBoletaValue)
        );
    }

    // 2. Filtrar por Fecha de Inicio
    if (fechaInicioValue) {
        const fechaInicio = new Date(fechaInicioValue + 'T00:00:00');
        ticketsFiltrados = ticketsFiltrados.filter(ticket => {
            const fechaTicket = new Date(ticket.fechaSolicitud);
            return fechaTicket >= fechaInicio;
        });
    }

    // 3. Filtrar por Fecha de Fin
    if (fechaFinValue) {
        const fechaFin = new Date(fechaFinValue + 'T23:59:59');
        ticketsFiltrados = ticketsFiltrados.filter(ticket => {
            const fechaTicket = new Date(ticket.fechaSolicitud);
            return fechaTicket <= fechaFin;
        });
    }

    // Mostrar el resultado final en la tabla
    mostrarTickets(ticketsFiltrados);
}


// --- FUNCIONES DE RENDERIZADO (UI) ---
// Esta función ahora solo se encarga de 'pintar' los tickets que recibe
function mostrarTickets(tickets) {
    const contenedor = document.getElementById('ticketsContainer');
    contenedor.innerHTML = '';

    if (!tickets.length) {
        contenedor.innerHTML = '<div class="alert alert-warning text-center">No hay boletas para mostrar con los filtros seleccionados.</div>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'table table-hover table-bordered text-center align-middle';
    table.innerHTML = `
        <thead class="table-light">
            <tr>
                <th>ID Boleta</th>
                <th>Fecha Creación</th>
                <th>Estado</th>
                <th>Detalle</th>
            </tr>
        </thead>
    `;
    const tbody = document.createElement('tbody');
    tickets.forEach(ticket => {
        const { clase, texto } = getEstado(ticket.idEstado);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${ticket.idBoleta || '-'}</strong></td>
            <td>${formatearFecha(ticket.fechaSolicitud) || '-'}</td>
            <td><span class="badge rounded-pill ${clase}">${texto}</span></td>
            <td>
                <button class="btn-table-details btn-details" data-id="${ticket.idBoleta}" title="Ver Detalles">
                    <i class="fa fa-search"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    contenedor.appendChild(table);
}


// Función para mostrar detalles en el modal
function mostrarDetalles(idBoleta) {
    const ticket = ticketsData.find(t => t.idBoleta == idBoleta);
    if (!ticket) return;

    const modalLabel = document.getElementById('detailsModalLabel');
    const modalContent = document.getElementById('modalContent');

    modalLabel.textContent = `Detalles de la Boleta #${ticket.idBoleta}`;

    const observaciones = [
        ticket.observaciones1,
        ticket.observaciones2,
        ticket.observaciones3,
        ticket.observaciones4
    ].filter(obs => obs).join('; ');

    let fechasSolicitadasHTML = '';
    for (let i = 1; i <= 5; i++) {
        const fecha = ticket[`fecha${i}`];
        if (
            fecha &&
            !fecha.startsWith('2001-01-01') &&
            !fecha.startsWith('2000-01-01') &&
            !fecha.startsWith('01/01/2000')
        ) {
            fechasSolicitadasHTML += `<li>${formatearFecha(fecha)}</li>`;
        }
    }

    let fechasReposicionHTML = '';
    for (let i = 1; i <= 5; i++) {
        const fechaR = ticket[`fecha${i}R`];
        if (
            fechaR &&
            !fechaR.startsWith('2001-01-01') &&
            !fechaR.startsWith('2000-01-01') &&
            !fechaR.startsWith('01/01/2000')
        ) {
            fechasReposicionHTML += `<li>${formatearFecha(fechaR)}</li>`;
        }
    }

    modalContent.innerHTML = `
        <h5>Información General</h5>
        <div class="row g-3">
            <div class="col-md-6"><strong>Solicitante ID:</strong> ${ticket.idCreador}</div>
            <div class="col-md-6"><strong>Fecha Solicitud:</strong> ${formatearFecha(ticket.fechaSolicitud, true)}</div>
            <div class="col-md-6"><strong>Total Horas:</strong> ${ticket.totalH || 'N/A'}</div>
            <div class="col-md-6"><strong>Total Horas Reposición:</strong> ${ticket.totalHR || 'N/A'}</div>
            <div class="col-12"><strong>Observaciones:</strong> ${observaciones || 'Sin observaciones.'}</div>
        </div>
        <hr>
        <div class="row g-3">
            <div class="col-md-6">
                <h5>Fechas Solicitadas</h5>
                ${fechasSolicitadasHTML ? `<ul>${fechasSolicitadasHTML}</ul>` : '<p>No hay fechas específicas.</p>'}
            </div>
            <div class="col-md-6">
                <h5>Fechas de Reposición</h5>
                ${fechasReposicionHTML ? `<ul>${fechasReposicionHTML}</ul>` : '<p>No requiere reposición.</p>'}
            </div>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
    modal.show();
}

function mostrarCargando(contenedor) {
    contenedor.innerHTML = `
        <div class="d-flex justify-content-center align-items-center p-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <strong class="ms-3">Cargando boletas...</strong>
        </div>
    `;
}

function mostrarError(msg) {
    document.getElementById('ticketsContainer').innerHTML = `<div class="alert alert-danger text-center">${msg}</div>`;
}

// --- FUNCIONES UTILITARIAS ---
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

// --- FUNCIONES DE SESIÓN Y NAVEGACIÓN ---
function logout() {
    sessionStorage.clear('usuario_principal');
    sessionStorage.clear('avatar');
    sessionStorage.clear('id_usuario');
    window.location.href = '../authentication/signin/login.html';
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    // Si el sidebar está oculto, se muestra y se asigna el margen original al contenedor principal.
    if (getComputedStyle(sidebar).display === 'none') {
        sidebar.style.display = 'block';
        // Asigna el margen original (ajusta el valor según el ancho real de tu sidebar)
        mainContent.style.marginLeft = "220px"; /* O el valor que uses en tu CSS */
    } else {
        // Oculta el sidebar y expande el contenedor principal
        sidebar.style.display = 'none';
        mainContent.style.marginLeft = "0";
    }
}