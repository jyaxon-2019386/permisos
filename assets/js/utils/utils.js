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

/**
 * Utilidad para obtener el nombre de la empresa a partir de su ID.
 * @param {number | string} idEmpresa - El ID de la empresa.
 * @returns {string} - El nombre de la empresa.
 */
function getEmpresa(idEmpresa) {
    const empresas = {
        1: 'PROQUIMA',
        2: 'UNHESA',
        3: 'ECONACIONAL'
    };
    return empresas[idEmpresa] || idEmpresa || 'No especificada';
}


/**
 * Calculates the difference in hours between two time strings (HH:MM).
 * @param {string} timeFrom - Start time string (e.g., "07:00").
 * @param {string} timeTo - End time string (e.g., "10:30").
 * @returns {number} The difference in hours, or NaN if times are invalid.
 */
function calculateHoursDifference(timeFrom, timeTo) {
    if (!timeFrom || !timeTo) return 0;

    const [hFrom, mFrom] = timeFrom.split(':').map(Number);
    const [hTo, mTo] = timeTo.split(':').map(Number);

    const minutesFrom = hFrom * 60 + mFrom;
    const minutesTo = hTo * 60 + mTo;

    // Handle overnight cases (e.g., from 22:00 to 02:00 next day) if needed.
    // For now, assuming times are within the same 24-hour period.
    let diffMinutes = minutesTo - minutesFrom;

    if (diffMinutes < 0) {
        // If end time is earlier than start time, assume it's on the next day
        diffMinutes += 24 * 60;
    }

    return diffMinutes / 60; // Return in hours
}

/**
 * Formatea una fecha y filtra las que son placeholders (ej. '2000-01-01').
 * @param {string} dateString - La fecha en formato string.
 * @returns {string|null} - La fecha formateada como DD/MM/YYYY o null si es inválida.
 */
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

function formatAndFilterDate(dateString) {
    if (!dateString || dateString.startsWith('2000-01-01')) {
        return null;
    }
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null; // Fecha inválida
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return null;
    }
}

/**
 * Obtiene la ruta de la firma del jefe inmediato según el departamento.
 * @param {string} departamento - El nombre del departamento.
 * @returns {object} - Un objeto con la ruta de la imagen de la firma y el estilo, o un objeto vacío si no se encuentra.
 */
function getFirmaJefe(departamento) {
    const firmas = {
        'Recursos Humanos': { src: '../../assets/img/firmas/rrhh.png', style: 'max-width: 140px; height: auto;' },
        'Sistemas': { src: '../../assets/img/firmas/sistemas.png' },
        'Comercialización UNHESA': { src: '../../assets/img/firmas/unhesa.png', style: 'max-width: 65px; height: auto;' }, // Antonio Jolón
        'Logística': { src: '../../assets/img/firmas/logistica.png', style: 'max-width: 300px; height: auto;' },
        'Investigación y Desarrollo': { src: '../../assets/img/firmas/id.png', style: 'max-width: 85px; height: auto;' },
        'Compras': { src: '../../assets/img/firmas/compras.png', style: 'max-width: 120px; height: auto;' },
        'Planificación': { src: '../../assets/img/firmas/planificacion.png' }, // Juan Carlos Monterroso
        'Producción': { src: '../../assets/img/firmas/planificacion.png' }, // Uso planificacion.png porque es el mismo jefe.
        'Mercadeo': { src: '../../assets/img/firmas/unhesa.png', style: 'max-width: 65px; height: auto;' }, // Uso unhesa.png porque es el mismo jefe.
        'Mantenimiento': { src: '../../assets/img/firmas/planificacion.png' }, // Juan Carlos Monterroso
        'Gestión de Calidad': { src: '../../assets/img/firmas/calidad.png' },
        'Gerencias': { src: '../../assets/img/firmas/gerencias.png' },
        'Finanzas': { src: '../../assets/img/firmas/finanzas.png', style: 'max-width: 130px; height: auto;' },
        'Contabilidad': { src: '../../assets/img/firmas/contabilidad.png', style: 'max-width: 300px; height: auto;' },
        'Comercialización PROQUIMA': { src: '../../assets/img/firmas/proquima.png', style: 'max-width: 130px; height: auto;' },
        'Administración': { src: '../../assets/img/firmas/administracion.png', style: 'max-width: 135px; height: auto;' },
        // Puedo agregar más departamentos y sus firmas aquí

    };

    return firmas[departamento] || { src: '' };
}

function obtenerTituloBoleta(tipoTicket) {
    switch (tipoTicket) {
        case 'getTicketOffRRHH': return 'Boleta de Sanción';
        case 'getUserTicketOffIGSSRRHH': return 'Boleta de Suspensión IGSS';
        case 'getTicketRequestIGSSRRHH': return 'Boleta de Consulta IGSS';
        case 'getTicketJustificationRRHH': return 'Boleta de Permiso Justificado';
        case 'getTicketVacationsRRHH': return 'Boleta de Solicitud de Vacaciones';
        case 'getTicketReplaceTimeRRHH': return 'Boleta de Reposición de Tiempo';
        default: return 'Detalle de Boleta';
    }
}

window.getFirmaJefe = getFirmaJefe;