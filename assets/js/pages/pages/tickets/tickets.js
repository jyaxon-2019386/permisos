
// Almacena la lista completa de tickets obtenida de la API
let ticketsData = [];
const usaPaginacionBackend = true;

// Variables de paginación y ordenamiento
let currentPage = 1;
let pageSize = 50;
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
    const departamentoSelect = document.getElementById('departamentoFilter'); // Nuevo filtro
    const btnLimpiar = document.getElementById('btnLimpiarFiltros');
    const ticketsContainer = document.getElementById('ticketsContainer');

    // Inicializar datos al cargar la página
    const tipoInicial = tipoTicketSelect.value;
    getTickets(tipoInicial, 1);

    // --- EVENTOS ---

    // 1. Cuando cambia el TIPO de boleta, se piden nuevos datos al servidor
    tipoTicketSelect.addEventListener('change', () => {
        const tipo = tipoTicketSelect.value;
        // Reinicia paginación y ordenamiento al cambiar el tipo de ticket
        currentPage = 1;
        currentSortColumn = null;
        currentSortDirection = 'asc';
        getTickets(tipo, currentPage);
    });

    // 2. Filtro por ID con búsqueda exacta en el backend
    idBoletaInput.addEventListener('input', debounce(() => {
    currentPage = 1;
    filtrarYMostrarTickets();
}, 500));

    // 3. Filtros de fecha - aplicar filtrado local cuando cambian
    fechaInicioInput.addEventListener('change', () => {
        currentPage = 1;
        filtrarYMostrarTickets();
    });

    fechaFinInput.addEventListener('change', () => {
        currentPage = 1;
        filtrarYMostrarTickets();
    });

    // 4. Filtro por departamento - aplicar filtrado local
    if (departamentoSelect) {
        departamentoSelect.addEventListener('change', () => {
            currentPage = 1;
            filtrarYMostrarTickets();
        });
    }

    // 5. El botón Limpiar resetea los campos y aplica el filtro local
    btnLimpiar.addEventListener('click', () => {
        idBoletaInput.value = '';
        fechaInicioInput.value = '';
        fechaFinInput.value = '';
        if (departamentoSelect) departamentoSelect.value = '';
        
        // Reinicia ordenamiento al limpiar filtros
        currentSortColumn = null;
        currentSortDirection = 'asc';
        
        // Recargar datos desde el backend
        const tipo = tipoTicketSelect.value;
        getTickets(tipo, 1);
    });

    // 6. Listener para los clics en los botones de detalles (delegación de eventos)
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

    // 7. Listener para ordenar columnas (delegación de eventos en thead)
    ticketsContainer.addEventListener('click', (event) => {
        const th = event.target.closest('th[data-sort-by]');
        if (th) {
            const column = th.dataset.sortBy;
            sortTickets(column);
        }
    });
});

// Función debounce para evitar múltiples llamadas
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// --- LÓGICA DE DATOS (API) ---
let tipoActual = 'putStateTickets'; // o el tipo que uses para cargar tickets, cambia según tu lógica

async function getTickets(tipo, pagina = 1) {
    const contenedor = document.getElementById('ticketsContainer');
    mostrarCargando(contenedor);

    try {
        // Actualizo variables globales de estado
        tipoActual = tipo;
        currentPage = pagina;

        const url = new URL(`/permisos/assets/php/tickets/tickets.php`, window.location.origin);
        url.searchParams.set('quest', tipo);
        url.searchParams.set('page', pagina);
        url.searchParams.set('limit', pageSize);

        const response = await fetch(url.toString());
        const data = await response.json();

        if (response.ok && data.success && (data.boletas || data["my tickets"])) {
            ticketsData = data.boletas || data["my tickets"];
            currentPage = data.paginaActual || pagina;
            totalPages = data.totalPaginas || 1;

            // Después de obtener los datos, poblar el filtro de departamentos
            poblarFiltroDepartamentos();
            
            // Aplicar filtros locales y mostrar
            filtrarYMostrarTickets();
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


// Función para poblar el filtro de departamentos
function poblarFiltroDepartamentos() {
    const departamentoSelect = document.getElementById('departamentoFilter');
    if (!departamentoSelect) return;

    // Obtener departamentos únicos de los datos
    const departamentos = [...new Set(ticketsData.map(ticket => ticket.Departamento).filter(dept => dept))];
    departamentos.sort();

    // Limpiar opciones existentes (excepto la primera)
    departamentoSelect.innerHTML = '<option value="">Todos los departamentos</option>';

    // Agregar opciones de departamentos
    departamentos.forEach(departamento => {
        const option = document.createElement('option');
        option.value = departamento;
        option.textContent = departamento;
        departamentoSelect.appendChild(option);
    });
}

// --- LÓGICA DE FILTRADO LOCAL ---
function filtrarYMostrarTickets() {
    // Si usa paginación backend y no hay filtros locales activos, mostrar directamente
    if (usaPaginacionBackend && !hayFiltrosLocalesActivos()) {
        mostrarTickets(ticketsData);
        mostrarPaginacion(totalPages);
        return;
    }

    // Aplicar filtros locales
    const idBoletaValue = document.getElementById('idBoletaFilter').value.trim();
    const fechaInicioValue = document.getElementById('fechaInicio').value;
    const fechaFinValue = document.getElementById('fechaFin').value;
    const departamentoValue = document.getElementById('departamentoFilter')?.value || '';

    let ticketsFiltrados = [...ticketsData];

    // Filtro por ID (búsqueda por coincidencia)
    if (idBoletaValue) {
        ticketsFiltrados = ticketsFiltrados.filter(ticket =>
            ticket.idBoleta && ticket.idBoleta.toString().includes(idBoletaValue)
        );
    }

    // Filtro por departamento
    if (departamentoValue) {
        ticketsFiltrados = ticketsFiltrados.filter(ticket =>
            ticket.Departamento && ticket.Departamento.toLowerCase().includes(departamentoValue.toLowerCase())
        );
    }

    // Filtro por fecha de inicio
    if (fechaInicioValue) {
        const fechaInicio = new Date(fechaInicioValue);
        fechaInicio.setHours(0, 0, 0, 0); // Inicio del día
        
        ticketsFiltrados = ticketsFiltrados.filter(ticket => {
            const fechaTicketStr = ticket.FechaDeCreacion || ticket.fechaSolicitud;
            if (!fechaTicketStr) return false;
            
            try {
                const fechaTicket = new Date(fechaTicketStr.replace(' ', 'T'));
                fechaTicket.setHours(0, 0, 0, 0); // Inicio del día
                return !isNaN(fechaTicket.getTime()) && fechaTicket >= fechaInicio;
            } catch (error) {
                console.warn('Error al parsear fecha:', fechaTicketStr, error);
                return false;
            }
        });
    }

    // Filtro por fecha de fin
    if (fechaFinValue) {
        const fechaFin = new Date(fechaFinValue);
        fechaFin.setHours(23, 59, 59, 999); // Final del día
        
        ticketsFiltrados = ticketsFiltrados.filter(ticket => {
            const fechaTicketStr = ticket.FechaDeCreacion || ticket.fechaSolicitud;
            if (!fechaTicketStr) return false;
            
            try {
                const fechaTicket = new Date(fechaTicketStr.replace(' ', 'T'));
                return !isNaN(fechaTicket.getTime()) && fechaTicket <= fechaFin;
            } catch (error) {
                console.warn('Error al parsear fecha:', fechaTicketStr, error);
                return false;
            }
        });
    }

    // Aplicar ordenamiento si está activo
    if (currentSortColumn) {
        ticketsFiltrados.sort((a, b) => {
            let valA = a[currentSortColumn];
            let valB = b[currentSortColumn];

            // Manejo especial para fechas
            if (currentSortColumn === 'FechaDeCreacion' || currentSortColumn === 'FechaActualizado') {
                const fechaA = new Date((a.FechaDeCreacion || a.fechaSolicitud || '').replace(' ', 'T'));
                const fechaB = new Date((b.FechaDeCreacion || b.fechaSolicitud || '').replace(' ', 'T'));
                valA = isNaN(fechaA.getTime()) ? new Date(0) : fechaA;
                valB = isNaN(fechaB.getTime()) ? new Date(0) : fechaB;
            } 
            // Manejo especial para ID de boleta
            else if (currentSortColumn === 'idBoleta') {
                valA = parseInt(String(a.idBoleta || '0').replace(/[^\d]/g, ''), 10) || 0;
                valB = parseInt(String(b.idBoleta || '0').replace(/[^\d]/g, ''), 10) || 0;
            }
            // Manejo para strings
            else {
                valA = String(valA || '').toLowerCase();
                valB = String(valB || '').toLowerCase();
            }

            // Comparación
            if (typeof valA === 'string' && typeof valB === 'string') {
                const result = valA.localeCompare(valB);
                return currentSortDirection === 'asc' ? result : -result;
            }
            
            if (valA < valB) return currentSortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return currentSortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Paginación local
    const totalItems = ticketsFiltrados.length;
    totalPages = Math.ceil(totalItems / pageSize) || 1;
    
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const ticketsPagina = ticketsFiltrados.slice(startIdx, endIdx);

    mostrarTickets(ticketsPagina);
    mostrarPaginacion(totalPages);
}

// Función para verificar si hay filtros locales activos
function hayFiltrosLocalesActivos() {
    const idBoleta = document.getElementById('idBoletaFilter').value.trim();
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    const departamento = document.getElementById('departamentoFilter')?.value || '';

    return fechaInicio || fechaFin || departamento || idBoleta;
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

function mostrarPaginacion(numTotalPages) { // Renombrado para mayor claridad
    const paginacionContainer = document.getElementById('paginacionContainer') || (() => {
        const container = document.createElement('div');
        container.id = 'paginacionContainer';
        container.className = 'd-flex justify-content-center my-3';
        document.getElementById('ticketsContainer').parentElement.appendChild(container);
        return container;
    })();

    paginacionContainer.innerHTML = '';
    // Usa numTotalPages que se le pasa, que será el total de páginas del backend
    // o el total de páginas de los tickets filtrados localmente.
    if (numTotalPages <= 1) return;

    const ul = document.createElement('ul');
    ul.className = 'pagination pagination-sm';

    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = startPage + maxVisible - 1;

    if (endPage > numTotalPages) { // Usa numTotalPages aquí
        endPage = numTotalPages;
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
                // Determine if local filters are active
                if (hayFiltrosLocalesActivos()) {
                    // If local filters are active, just update currentPage and re-render locally
                    currentPage = page;
                    filtrarYMostrarTickets();
                } else {
                    // If NO local filters are active, fetch new data from the backend
                    // This will also update currentPage and totalPages global variables
                    const tipo = document.getElementById('tipoTicket').value;
                    getTickets(tipo, page);
                }
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

    if (endPage < numTotalPages) { // Usa numTotalPages aquí
        if (endPage < numTotalPages - 1) { // Usa numTotalPages aquí
            const li = document.createElement('li');
            li.className = 'page-item disabled';
            li.innerHTML = `<span class="page-link">...</span>`;
            ul.appendChild(li);
        }
        ul.appendChild(createPageButton(numTotalPages)); // Usa numTotalPages aquí
    }

    ul.appendChild(createPageButton(currentPage + 1, '»', false, currentPage === numTotalPages)); // Usa numTotalPages aquí

    paginacionContainer.appendChild(ul);
}

// --- FUNCIONES DE RENDERIZADO (UI) ---
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
        
        row.innerHTML = `
            <td><strong>#${ticket.idBoleta || '-'}</strong></td>
            <td>${formatearFecha(ticket.FechaDeCreacion || ticket.fechaSolicitud)}</td>
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