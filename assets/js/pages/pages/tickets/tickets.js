// Almacena la lista completa de tickets obtenida de la API
let ticketsData = [];

// Variables de paginación y ordenamiento
let currentPage = 1;
let pageSize = 10;
let totalPages = 1;
let currentSortColumn = null; // Columna actualmente ordenada
let currentSortDirection = 'asc'; // Dirección de ordenamiento: 'asc' o 'desc'

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
        // Reinicia paginación y ordenamiento al cambiar el tipo de ticket
        currentPage = 1;
        currentSortColumn = null;
        currentSortDirection = 'asc';
        getTickets(tipo, currentPage);
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
        // Reinicia ordenamiento al limpiar filtros
        currentSortColumn = null;
        currentSortDirection = 'asc';
        filtrarYMostrarTickets();
    });

    // 4. Listener para los clics en los botones de detalles (delegación de eventos)
    ticketsContainer.addEventListener('click', (event) => {
        const detailsButton = event.target.closest('.btn-details');
        if (detailsButton) {
            const boletaId = detailsButton.dataset.id;
            mostrarDetalles(boletaId);
        }
        const printButton = event.target.closest('.btn-print');
        if (printButton) {
            const boletaId = printButton.dataset.id;
            imprimirDetalleBoleta(boletaId);
        }
        const pdfButton = event.target.closest('.btn-pdf');
        if (pdfButton) {
            const boletaId = pdfButton.dataset.id;
            exportarDetallePDF(boletaId);
        }
    });

    // Listener para ordenar columnas (delegación de eventos en thead)
    ticketsContainer.addEventListener('click', (event) => {
        const th = event.target.closest('th[data-sort-by]');
        if (th) {
            const column = th.dataset.sortBy;
            sortTickets(column);
        }
    });
});


// --- LÓGICA DE DATOS (API) ---
// Su única responsabilidad es OBTENER los datos del servidor
async function getTickets(tipo, pagina = 1) {
    const contenedor = document.getElementById('ticketsContainer');
    mostrarCargando(contenedor);

    try {
        const url = new URL(`/permisos/assets/php/tickets/tickets.php`, window.location.origin);
        url.searchParams.set('quest', tipo);
        url.searchParams.set('page', pagina); // ← usa la página recibida
        url.searchParams.set('limit', 10);

        const response = await fetch(url.toString());
        const data = await response.json();

        if (response.ok && data.success && (data.boletas || data["my tickets"])) {
            ticketsData = data.boletas || data["my tickets"];
            currentPage = data.paginaActual || pagina; // ← usa el backend o la que enviaste
            totalPages = data.totalPaginas || 1;

            // Después de obtener los datos, aplica el filtro y el ordenamiento actual
            filtrarYMostrarTickets();
            mostrarPaginacion(totalPages); // Se llama desde filtrarYMostrarTickets también, pero aquí asegura que se vea
        } else {
            ticketsData = [];
            mostrarError(data.error || data.message || "No se encontraron tickets.");
        }
    } catch (error) {
        ticketsData = [];
        console.error("Error al obtener tickets:", error);
        mostrarError("Error de conexión al obtener los tickets.");
    }
}


// --- LÓGICA DE FILTRADO LOCAL ---
// Filtra los datos ya existentes en `ticketsData`, los ordena y los muestra
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
            // Usa FechaDeCreacion o fechaSolicitud para la comparación
            const fechaTicketStr = ticket.FechaDeCreacion || ticket.fechaSolicitud;
            if (!fechaTicketStr) return false; // Si no hay fecha, no incluir
            const fechaTicket = new Date(fechaTicketStr.replace(' ', 'T'));
            return fechaTicket >= fechaInicio;
        });
    }

    // 3. Filtrar por Fecha de Fin
    if (fechaFinValue) {
        const fechaFin = new Date(fechaFinValue + 'T23:59:59');
        ticketsFiltrados = ticketsFiltrados.filter(ticket => {
            // Usa FechaDeCreacion o fechaSolicitud para la comparación
            const fechaTicketStr = ticket.FechaDeCreacion || ticket.fechaSolicitud;
            if (!fechaTicketStr) return false; // Si no hay fecha, no incluir
            const fechaTicket = new Date(fechaTicketStr.replace(' ', 'T'));
            return fechaTicket <= fechaFin;
        });
    }

    // 4. Aplicar ordenamiento
    if (currentSortColumn) {
        ticketsFiltrados.sort((a, b) => {
            let valA = a[currentSortColumn];
            let valB = b[currentSortColumn];

            // Manejo específico para fechas si la columna es de fecha
            if (currentSortColumn === 'FechaDeCreacion' || currentSortColumn === 'FechaActualizado') {
                valA = new Date((a.FechaDeCreacion || a.fechaSolicitud || '').replace(' ', 'T'));
                valB = new Date((b.FechaDeCreacion || b.fechaSolicitud || '').replace(' ', 'T'));
            } else if (currentSortColumn === 'idBoleta') {
                valA = parseInt(a.idBoleta.replace('B-', ''), 10); // Asegura comparación numérica para ID
                valB = parseInt(b.idBoleta.replace('B-', ''), 10);
            }
            // Asegura que los valores sean cadenas para la comparación localeCompare, si no son números o fechas
            if (typeof valA === 'string' && typeof valB === 'string') {
                return currentSortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            // Para números o fechas
            if (valA < valB) {
                return currentSortDirection === 'asc' ? -1 : 1;
            }
            if (valA > valB) {
                return currentSortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    // Calcular total de páginas
    totalPages = Math.ceil(ticketsFiltrados.length / pageSize) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    // Obtener los tickets de la página actual
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const ticketsPagina = ticketsFiltrados.slice(startIdx, endIdx);

    mostrarTickets(ticketsPagina);
    mostrarPaginacion(totalPages);
}

// Nueva función para ordenar los tickets
function sortTickets(column) {
    if (currentSortColumn === column) {
        // Si ya está ordenado por esta columna, invierte la dirección
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        // Si es una nueva columna, ordena ascendente por defecto
        currentSortColumn = column;
        currentSortDirection = 'asc';
    }
    currentPage = 1; // Reinicia la paginación al ordenar
    filtrarYMostrarTickets(); // Vuelve a filtrar y mostrar con el nuevo orden
}


function mostrarPaginacion(totalPages) {
    const paginacionContainer = document.getElementById('paginacionContainer') || (() => {
        const container = document.createElement('div');
        container.id = 'paginacionContainer';
        container.className = 'd-flex justify-content-center my-3';
        document.getElementById('ticketsContainer').parentElement.appendChild(container);
        return container;
    })();

    paginacionContainer.innerHTML = '';
    if (totalPages <= 1) return;

    const ul = document.createElement('ul');
    ul.className = 'pagination pagination-sm';

    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = startPage + maxVisible - 1;

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    const createPageButton = (page, text = null, isActive = false, isDisabled = false) => {
        const li = document.createElement('li');
        li.className = 'page-item' + (isActive ? ' active' : '') + (isDisabled ? ' disabled' : '');
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.textContent = text || page;
        a.onclick = (e) => {
            e.preventDefault();
            if (!isDisabled && currentPage !== page) {
                currentPage = page;
                // Al hacer clic en un botón de paginación, siempre se debe recargar desde el backend
                // ya que el filtrado y ordenamiento local solo aplican a la página actual de `ticketsData`
                const tipo = document.getElementById('tipoTicket').value;
                getTickets(tipo, page); // 🔁 Recarga la página desde el backend
            }
        };
        li.appendChild(a);
        return li;
    };

    ul.appendChild(createPageButton(currentPage - 1, '«', false, currentPage === 1));

    if (startPage > 1) {
        ul.appendChild(createPageButton(1));
        if (startPage > 2) {
            const li = document.createElement('li');
            li.className = 'page-item disabled';
            li.innerHTML = `<span class="page-link">...</span>`;
            ul.appendChild(li);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        ul.appendChild(createPageButton(i, null, i === currentPage));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const li = document.createElement('li');
            li.className = 'page-item disabled';
            li.innerHTML = `<span class="page-link">...</span>`;
            ul.appendChild(li);
        }
        ul.appendChild(createPageButton(totalPages));
    }

    ul.appendChild(createPageButton(currentPage + 1, '»', false, currentPage === totalPages));

    paginacionContainer.appendChild(ul);
}


// Reiniciar página al cambiar filtros
[idBoletaInput, fechaInicioInput, fechaFinInput].forEach(input => {
    input.addEventListener('input', () => {
        currentPage = 1;
        filtrarYMostrarTickets();
    });
    input.addEventListener('change', () => {
        currentPage = 1;
        filtrarYMostrarTickets();
    });
});


// --- FUNCIONES DE RENDERIZADO (UI) ---
// Esta función ahora solo se encarga de 'pintar' los tickets que recibe
function mostrarTickets(tickets) {
    const contenedor = document.getElementById('ticketsContainer');
    contenedor.innerHTML = '';

    if (!tickets.length) {
        contenedor.innerHTML = '<div class="alert alert-warning text-center">No hay boletas para mostrar con los filtros seleccionados.</div>';
        return;
    }

    // Detectar si es boleta de sanción
    const tipoTicket = document.getElementById('tipoTicket').value;
    const esSancion = tipoTicket === 'getTicketOffRRHH';

    const table = document.createElement('table');
    table.className = 'table table-hover table-bordered text-center align-middle';
    table.innerHTML = `
        <thead class="table-light">
            <tr>
                <th data-sort-by="idBoleta" class="${currentSortColumn === 'idBoleta' ? currentSortDirection : ''}">ID Boleta <i class="fa fa-${currentSortColumn === 'idBoleta' ? (currentSortDirection === 'asc' ? 'sort-asc' : 'sort-desc') : 'sort'}"></i></th>
                <th data-sort-by="FechaDeCreacion" class="${currentSortColumn === 'FechaDeCreacion' ? currentSortDirection : ''}">Fecha Creación <i class="fa fa-${currentSortColumn === 'FechaDeCreacion' ? (currentSortDirection === 'asc' ? 'sort-asc' : 'sort-desc') : 'sort'}"></i></th>
                <th data-sort-by="Solicitante" class="${currentSortColumn === 'Solicitante' ? currentSortDirection : ''}">Solicitante <i class="fa fa-${currentSortColumn === 'Solicitante' ? (currentSortDirection === 'asc' ? 'sort-asc' : 'sort-desc') : 'sort'}"></i></th>
                <th data-sort-by="Departamento" class="${currentSortColumn === 'Departamento' ? currentSortDirection : ''}">Departamento <i class="fa fa-${currentSortColumn === 'Departamento' ? (currentSortDirection === 'asc' ? 'sort-asc' : 'sort-desc') : 'sort'}"></i></th>
                <th data-sort-by="Estado" class="${currentSortColumn === 'Estado' ? currentSortDirection : ''}">Estado <i class="fa fa-${currentSortColumn === 'Estado' ? (currentSortDirection === 'asc' ? 'sort-asc' : 'sort-desc') : 'sort'}"></i></th>
                <th data-sort-by="FechaActualizado" class="${currentSortColumn === 'FechaActualizado' ? currentSortDirection : ''}">Fecha Actualizado <i class="fa fa-${currentSortColumn === 'FechaActualizado' ? (currentSortDirection === 'asc' ? 'sort-asc' : 'sort-desc') : 'sort'}"></i></th>
                ${esSancion ? `<th data-sort-by="Tipo" class="${currentSortColumn === 'Tipo' ? currentSortDirection : ''}">Tipo de Sanción <i class="fa fa-${currentSortColumn === 'Tipo' ? (currentSortDirection === 'asc' ? 'sort-asc' : 'sort-desc') : 'sort'}"></i></th>` : ''}
                <th>Detalle</th>
            </tr>
        </thead>
    `;
    const tbody = document.createElement('tbody');
    tickets.forEach(ticket => {
        const row = document.createElement('tr');
        const estado = ticket.Estado || (getEstado(ticket.idEstado)?.texto || '-');
        const clase = ticket.Estado ? getEstadoPorTexto(ticket.Estado).clase : (getEstado(ticket.idEstado)?.clase || '');
        // Para boleta de sanción, mostrar ticket.Tipo en la columna
        row.innerHTML = `
            <td><strong>#${ticket.idBoleta || '-'}</strong></td>
            <td>${ticket.FechaDeCreacion || ticket.fechaSolicitud || '-'}</td>
            <td>${ticket.Solicitante || '-'}</td>
            <td>${ticket.Departamento || '-'}</td>
            <td><span class="badge rounded-pill ${clase}">${estado}</span></td>
            <td>${formatearFecha(ticket.FechaActualizado || ticket.fecha_actualizado, true)}</td>
            ${esSancion ? `<td>${ticket.Tipo || ticket.tipoSancion || '-'}</td>` : ''}
            <td>
            <button class="btn btn-sm btn-outline-primary btn-details" data-id="${ticket.idBoleta}" title="Ver Detalles">
                <i class="fa fa-search"></i>
            </button>
            <button class="btn btn-sm btn-outline-secondary btn-print ms-1" data-id="${ticket.idBoleta}" title="Imprimir Detalle">
                <i class="fa fa-print"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-pdf ms-1" data-id="${ticket.idBoleta}" title="Exportar Detalle PDF">
                <i class="fa fa-file-pdf"></i>
            </button>
        </td>
        `;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    contenedor.appendChild(table);
}


// Botones de imprimir y exportar PDF
function agregarBotonesExportar() {
    let exportContainer = document.getElementById('exportContainer');
    if (!exportContainer) {
        exportContainer = document.createElement('div');
        exportContainer.id = 'exportContainer';
        exportContainer.className = 'd-flex justify-content-end gap-2 mb-2';
        document.getElementById('ticketsContainer').parentElement.prepend(exportContainer);
    }
    exportContainer.innerHTML = `
        <button id="btnImprimir" class="btn btn-outline-primary btn-sm"><i class="fa fa-print"></i> Imprimir</button>
        <button id="btnExportarPDF" class="btn btn-outline-danger btn-sm"><i class="fa fa-file-pdf"></i> Exportar PDF</button>
    `;
    document.getElementById('btnImprimir').onclick = imprimirTabla;
    document.getElementById('btnExportarPDF').onclick = exportarPDF;
}

function imprimirTabla() {
    const tabla = document.querySelector('#ticketsContainer table');
    if (!tabla) return;
    const ventana = window.open('', '', 'width=900,height=700');
    ventana.document.write('<html><head><title>Imprimir Boletas</title>');
    ventana.document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">');
    ventana.document.write('</head><body>');
    ventana.document.write(tabla.outerHTML);
    ventana.document.write('</body></html>');
    ventana.document.close();
    ventana.focus();
    ventana.print();
    ventana.close();
}

function exportarPDF() {
    const tabla = document.querySelector('#ticketsContainer table');
    if (!tabla) return;
    // Usar html2pdf.js para exportar la tabla
    const opt = {
        margin: 0.5,
        filename: 'boletas.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().from(tabla).set(opt).save();
}

// Llama a agregarBotonesExportar cada vez que se muestran tickets
const oldMostrarTickets = mostrarTickets;
mostrarTickets = function(tickets) {
    oldMostrarTickets(tickets);
    agregarBotonesExportar();
}


// Función para mostrar detalles en el modal
function mostrarDetalles(idBoleta) {
    const ticket = ticketsData.find(t => t.idBoleta == idBoleta);
    if (!ticket) return;

    const tipoTicket = document.getElementById('tipoTicket').value;
    const tituloBoleta = obtenerTituloBoleta(tipoTicket);
    const esSancion = tipoTicket === 'getTicketOffRRHH'; // Mantienes esta lógica si es necesaria para otras funciones

    // Unir observaciones si existen (pueden venir como observaciones1, observaciones2, etc. o como observaciones)
    let observaciones = '';
    if (ticket.observaciones) {
        observaciones = ticket.observaciones;
    } else {
        // Buscar campos observaciones1, observaciones2, ...
        const obsArr = [];
        for (let i = 1; i <= 5; i++) {
            if (ticket[`observaciones${i}`]) obsArr.push(ticket[`observaciones${i}`]);
        }
        observaciones = obsArr.join('; ');
    }

    const modalLabel = document.getElementById('detailsModalLabel');
    const modalContent = document.getElementById('modalContent');

    modalLabel.textContent = `Detalles de la Boleta #${ticket.idBoleta}`;

    modalContent.innerHTML = `
        <h5>Información General</h5>
        <div class="row g-3">
            <div class="col-md-6"><strong>Solicitante:</strong> ${ticket.Solicitante || '-'}</div>
            <div class="col-md-6"><strong>Departamento:</strong> ${ticket.Departamento || '-'}</div>
            <div class="col-md-6"><strong>Fecha Creación:</strong> ${ticket.FechaDeCreacion || ticket.fechaSolicitud || '-'}</div>
            <div class="col-md-6"><strong>Estado:</strong> ${ticket.Estado || (getEstado(ticket.idEstado)?.texto || '-')}</div>
            <div class="col-md-6"><strong>Fecha Actualizado:</strong> ${formatearFecha(ticket.FechaActualizado || ticket.fecha_actualizado, true)}</div>
            ${esSancion ? `<div class='col-md-6'><strong>Tipo de Sanción:</strong> ${ticket.Tipo || ticket.tipoSancion || '-'}</div>` : ''}
            <div class="col-12"><strong>Observaciones:</strong> ${observaciones || 'Sin observaciones.'}</div>
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

// Utilidad: Obtener clase de estado por texto
function getEstadoPorTexto(texto) {
    const estados = {
        'Esperando Nivel 1': { clase: 'bg-estado-pendiente' },
        'Esperando Nivel 2': { clase: 'bg-estado-pendiente' },
        'Esperando Nivel 3': { clase: 'bg-estado-pendiente' },
        'Autorizado': { clase: 'bg-estado-autorizado' },
        'Denegado Nivel 1': { clase: 'bg-estado-denegado' },
        'Denegado Nivel 2': { clase: 'bg-estado-denegado' },
        'Denegado Nivel 3': { clase: 'bg-estado-denegado' },
        'Esperando GG': { clase: 'bg-estado-pendiente' },
        'Autorizado por GG': { clase: 'bg-estado-autorizado' },
        'Rechazado por GG': { clase: 'bg-estado-denegado' },
        'Confirmado Recepción': { clase: 'bg-estado-autorizado' },
        'Revisado por RRHH': { clase: 'bg-estado-otro' },
        'No Repuso Tiempo': { clase: 'bg-estado-denegado' },
        'Anulado': { clase: 'bg-estado-anulado' },
        'Denegado por Sistema': { clase: 'bg-estado-denegado' }
    };
    return estados[texto] || { clase: 'bg-estado-anulado' };
}

function formatearFecha(fechaStr, incluirHora = false) {
    if (!fechaStr) return '-';
    // Asegurarse de que la fecha sea parseable, incluso con formato ISO sin 'Z'
    const fecha = new Date(fechaStr.replace(' ', 'T'));
    if (isNaN(fecha.getTime())) return fechaStr;

    const opcionesFecha = { day: '2-digit', month: '2-digit', year: 'numeric' };
    let fechaFormateada = fecha.toLocaleDateString('es-GT', opcionesFecha);

    if (incluirHora) {
        const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }; // Añadido seconds
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
        mainContent.style.marginLeft = "220px"; /* O el valor que usas en tu CSS */
    } else {
        // Oculta el sidebar y expande el contenedor principal
        sidebar.style.display = 'none';
        mainContent.style.marginLeft = "0";
    }
}

/**
 * Mapea el valor del tipo de boleta a un título descriptivo.
 * @param {string} tipoTicket - El valor del select 'tipoTicket'.
 * @returns {string} - El título correspondiente a la boleta.
 */
function obtenerTituloBoleta(tipoTicket) {
    const titulos = {
        'getTicketVacationsRRHH': 'Boleta de Vacaciones',
        'getTicketReplaceTimeRRHH': 'Boleta de Reposición de Tiempo',
        'getTicketJustificationRRHH': 'Boleta de Falta Justificada',
        'getTicketRequestIGSSRRHH': 'Boleta de Consulta IGSS',
        'getUserTicketOffIGSSRRHH': 'Boleta de Suspensión IGSS',
        'getTicketOffRRHH': 'Boleta de Sanción'
    };
    return titulos[tipoTicket] || 'Boleta de Usuario';
}