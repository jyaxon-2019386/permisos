let dataTableInstance;

document.addEventListener('DOMContentLoaded', () => {

    const tipoBoletaSelect = document.getElementById('tipoBoletaFilter');

    loadTicketsAndInitTable(tipoBoletaSelect.value);

    tipoBoletaSelect.addEventListener('change', () => {
        const nuevoTipoBoleta = tipoBoletaSelect.value;
        // Al cambiar de filtro, deseleccionar todo
        if (dataTableInstance) {
            $('#selectAllCheckbox').prop('checked', false);
        }
        loadTicketsAndInitTable(nuevoTipoBoleta);
    });

    // Delegación de eventos para botones de acción en la tabla (ej. Ver Detalles)
    $('#boletas-table-body').on('click', 'button', async function () {
        const action = $(this).data('action');
        const boletaId = $(this).data('id');

        if (!action || !boletaId) return;

        if (action === 'details') {
            const tipoBoleta = tipoBoletaSelect.value;
            const rowData = dataTableInstance.row($(this).parents('tr')).data();
            mostrarDetalles(rowData, tipoBoleta);
        }
    });

    // --- LÓGICA PARA LA SELECCIÓN DE BOLETAS ---
    const bulkAuthorizeBtn = document.getElementById('bulkAuthorizeBtn');

    function toggleBulkButton() {
        const anyChecked = $('.ticket-checkbox:checked').length > 0;
        bulkAuthorizeBtn.disabled = !anyChecked;
    }

    // Evento para el checkbox "Seleccionar Todo"
    $('#boletas-table thead').on('change', '#selectAllCheckbox', function () {
        const isChecked = $(this).prop('checked');
        $('.ticket-checkbox').prop('checked', isChecked);
        toggleBulkButton();
    });

    // Evento para los checkboxes individuales (usando delegación)
    $('#boletas-table-body').on('change', '.ticket-checkbox', function () {
        if (!$(this).prop('checked')) {
            $('#selectAllCheckbox').prop('checked', false);
        }
        // Verificar si todos están marcados para actualizar el checkbox principal
        const allChecked = $('.ticket-checkbox').length === $('.ticket-checkbox:checked').length;
        $('#selectAllCheckbox').prop('checked', allChecked);
        toggleBulkButton();
    });

    // Evento para el botón de autorización masiva
    bulkAuthorizeBtn.addEventListener('click', async () => {
        const selectedTickets = [];
        $('.ticket-checkbox:checked').each(function () {
            selectedTickets.push({
                idBoleta: $(this).data('id'),
                tipoBoleta: $(this).data('type')
            });
        });

        if (selectedTickets.length === 0) {
            Swal.fire('Atención', 'No ha seleccionado ninguna boleta.', 'warning');
            return;
        }

        const result = await Swal.fire({
            title: '¿Confirmar Autorización?',
            text: `Está a punto de autorizar ${selectedTickets.length} boleta(s). Esta acción no se puede deshacer.`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Sí, autorizar',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'btn btn-success me-2',
                cancelButton: 'btn btn-secondary'
            },
            buttonsStyling: false
        });

        if (result.isConfirmed) {
            Swal.fire({
                title: 'Procesando...',
                text: 'Autorizando boletas seleccionadas. Por favor espere.',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const response = await bulkActualizarEstadoBoletas(selectedTickets);

            if (response && response.success) {
                Swal.fire({
                    title: '¡Operación Completa!',
                    html: `Se procesaron las boletas.<br><strong>Autorizadas:</strong> ${response.successCount}<br><strong>Fallidas:</strong> ${response.failCount}`,
                    icon: 'success'
                });
                // Recargar la tabla usando el trigger del select para mantener el filtro
                tipoBoletaSelect.dispatchEvent(new Event('change'));
            } else {
                Swal.fire('Error', response.error || 'Ocurrió un error al procesar las boletas.', 'error');
            }
        }
    });
});

/**
 * Función principal que obtiene los datos del backend y luego inicializa la tabla.
 */
async function loadTicketsAndInitTable(tipoBoleta) {
    if (dataTableInstance) {
        dataTableInstance.processing(true);
    } else {
        // Ajustado para tener 6 columnas (con el checkbox)
        $('#boletas-table-body').html('<tr><td colspan="6" class="text-center">Cargando...</td></tr>');
    }

    const idDepartamentoP = sessionStorage.getItem('departamento');
    const idSolicitante = sessionStorage.getItem('idUsuario');

    if (!idDepartamentoP || !idSolicitante) {
        console.error("No se encontró el ID del departamento o del solicitante.");
        $('#boletas-table-body').html('<tr><td colspan="6" class="text-center text-danger">Error: No se pudo identificar al usuario.</td></tr>');
        return;
    }

    const ticketsData = await getTickets(tipoBoleta, idDepartamentoP, idSolicitante);
    initDataTable(ticketsData);
}

/**
 * Llama a la API para obtener los tickets pendientes.
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
            return data["my tickets"].map(ticket => ({
                ...ticket,
                EstadoTexto: 'Pendiente',
                EstadoClase: getEstadoInfo(1).clase
            }));
        }
        return [];
    } catch (error) {
        console.error("Error de conexión al obtener los tickets:", error);
        return [];
    }
}

/**
 * Inicializa la librería DataTables en nuestra tabla HTML.
 */
function initDataTable(ticketsData) {
    if (dataTableInstance) {
        // Limpia y redibuja la tabla con los nuevos datos
        dataTableInstance.clear().rows.add(ticketsData).draw();
        dataTableInstance.processing(false);
        // Habilitar/deshabilitar botones después de redibujar
        $('#selectAllCheckbox').prop('checked', false);
        $('#bulkAuthorizeBtn').prop('disabled', true);
        return;
    }

    dataTableInstance = new DataTable('#boletas-table', {
        data: ticketsData,
        responsive: true,
        order: [
            [2, 'desc'] // Ordenar por fecha de creación (ahora columna 2)
        ],
        columns: [{
            data: null,
            orderable: false,
            searchable: false,
            className: 'dt-body-center align-middle',
            render: (data, type, row) => `<input type="checkbox" class="ticket-checkbox" data-id="${row.idBoleta}" data-type="${$('#tipoBoletaFilter').val()}">`
        }, {
            data: 'idBoleta',
            className: 'align-middle',
            render: (data) => `<strong>#${data || '-'}</strong>`
        }, {
            data: 'FechaDeCreacion',
            className: 'align-middle',
            render: (data) => data || '-'
        }, {
            data: 'EstadoTexto',
            className: 'align-middle',
            render: (data, type, row) => `<span class="badge rounded-pill ${row.EstadoClase}">${data}</span>`
        }, {
            data: 'Solicitante',
            className: 'align-middle',
            render: (data) => data || '-'
        }, {
            data: 'idBoleta',
            orderable: false,
            searchable: false,
            className: 'dt-body-center align-middle',
            render: (data) => `<button class="btn btn-sm btn-outline-primary" data-id="${data}" data-action="details" title="Ver Detalles"><i class="fa fa-search"></i></button>`
        }],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.0.8/i18n/es-ES.json',
            processing: 'Cargando datos...'
        }
    });
}

/**
 * Envía la actualización del estado de UNA boleta al backend.
 */
async function actualizarEstadoBoleta(idBoleta, nuevoEstado, comentario, tipoBoleta) {
    const url = new URL('/permisos/assets/php/tickets/tickets.php', window.location.origin);
    const data = {
        quest: 'putTicketStateVacation',
        tipoBoleta: tipoBoleta,
        idBoleta: idBoleta,
        idEstado: nuevoEstado,
        comentario: comentario
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error al actualizar el estado de la boleta:", error);
        return { success: false, error: error.message || 'Error de conexión con el servidor.' };
    }
}

/**
 * Envía un array de boletas al backend para autorización masiva.
 */
async function bulkActualizarEstadoBoletas(ticketsArray) {
    const url = new URL('/permisos/assets/php/tickets/tickets.php', window.location.origin);
    const data = {
        quest: 'BULK_UPDATE_STATE',
        tickets: ticketsArray,
        idEstado: 4, // 4 = Autorizado
        comentario: 'Autorizado masivamente por el sistema.'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error en la autorización masiva:", error);
        return { success: false, error: 'Error de conexión con el servidor.' };
    }
}

/**
 * Muestra un modal profesional y de alto rendimiento con los detalles de la boleta.
 * @param {object} detalles - El objeto con los datos de la boleta.
 * @param {string} tipoBoleta - El tipo de boleta.
 */
function mostrarDetalles(detalles, tipoBoleta) {
    if (!detalles) {
        Swal.fire('Error', 'No se pudieron cargar los detalles de la boleta.', 'error');
        return;
    }

    const tipoBoletaNombre = getNombreTipoBoleta(tipoBoleta);
    const estadoInfo = getEstadoInfo(1); // Siempre muestra "Pendiente" en este modal de acción

    // Lógica de observaciones
    const observacionesKeys = ['observaciones1', 'observaciones2', 'observaciones3', 'observaciones4'];
    const observacionesHTML = observacionesKeys
        .map(key => (detalles[key] && detalles[key].trim() !== '') ? `<li class="list-group-item">${detalles[key]}</li>` : '')
        .join('');

    // --- Generar tarjetas de resumen dinámicamente para TODAS las boletas ---
    let summaryCardsHTML = '';
    const cards = [];

    // 1. Para 'Total de Días' (Usado en Vacaciones y Suspensión IGSS)
    if (detalles.TotalDias) {
        cards.push({ label: 'Total de Días', value: detalles.TotalDias });
    }

    // 2. Para 'Total de Horas' (Usado en Reposición, Justificación y Cita IGSS)
    const totalHoras = detalles.totalHoras || detalles.HorasTotal;
    if (totalHoras) {
        cards.push({ label: 'Total de Horas', value: `${totalHoras} Horas` });
    }

    // 3. Para 'Total de Horas Reponer' (Específico de Reposición de Tiempo)
    if (detalles.totalHorasR) {
        cards.push({ label: 'Total de Horas Reponer', value: `${detalles.totalHorasR} Horas` });
    }

    if (cards.length > 0) {
        // 'mb-4' crea la separación
        summaryCardsHTML = '<div class="row g-3 mb-4">';
        cards.forEach(card => {
            // 'col-md-6' crea el grid de 2 columnas
            summaryCardsHTML += `
            <div class="col-md-6">
                <div class="summary-card"> 
                    <span class="summary-label">${card.label}</span>
                    <span class="summary-value">${card.value}</span>
                </div>
            </div>`;
        });
        summaryCardsHTML += '</div>';
    }
    // --- Fin del bloque de tarjetas ---


    // Genera el contenido específico (AHORA SOLO LA TABLA)
    const tablaDetallesHTML = generarDetallesDinamicos(detalles, tipoBoleta);

    // --- ESTRUCTURA HTML DEL MODAL ---
    const content = `
    <div class="modal-content-wrapper">
        <div class="modal-header">
            <div class="modal-title-section">
                <p class="modal-type">${tipoBoletaNombre}</p>
                <h3 class="modal-id">Boleta de Permiso #${detalles.idBoleta}</h3>
            </div>
            <span class="badge rounded-pill fs-6 ${estadoInfo.clase}">${estadoInfo.texto}</span>
        </div>

        <div class="modal-body">
            <div class="modal-section">
                <h6 class="section-title">Información General</h6>
                <div class="section-content">
                    <div class="info-grid">
                        <div class="info-item">
                            <i class="fa fa-user-circle icon"></i>
                            <div>
                                <span class="info-label">Solicitante</span>
                                <span class="info-value">${detalles.Solicitante || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fa fa-briefcase icon"></i>
                            <div>
                                <span class="info-label">Puesto</span>
                                <span class="info-value">${detalles.Puesto || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fa fa-calendar icon"></i>
                            <div>
                                <span class="info-label">Fecha de Solicitud</span>
                                <span class="info-value">${detalles.FechaDeCreacion || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-section">
                <h6 class="section-title">Detalles de la Solicitud</h6>
                <div class="section-content">
                    
                    ${summaryCardsHTML} 

                    <h6 class="details-subtitle">Fechas de la Solicitud</h6>
                    ${tablaDetallesHTML}
                    
                </div>
            </div>

            ${observacionesHTML ? `
            <div class="modal-section">
                <h6 class="section-title">Observaciones del Solicitante</h6>
                <div class="section-content">
                    <ul class="list-group list-group-flush">${observacionesHTML}</ul>
                </div>
            </div>` : ''}

            <div class="modal-section action-section">
                <h6 class="section-title">Acción Requerida</h6>
                <div class="section-content">
                    <label for="autorizadorComentario" class="form-label fw-bold">Comentario del Autorizador</label>
                    <textarea id="autorizadorComentario" class="form-control" rows="3" 
                        placeholder="Añada un comentario."></textarea>
                </div>
            </div>
        </div>
    </div>
    `;

    Swal.fire({
        html: content,
        width: '900px',
        showConfirmButton: true,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: '<i class="fa fa-check"></i> Autorizar',
        denyButtonText: '<i class="fa fa-times"></i> No Autorizar',
        cancelButtonText: 'Cancelar',
        buttonsStyling: false,
        customClass: {
            popup: 'custom-swal-popup',
            confirmButton: 'btn btn-success me-2', // Verde
            denyButton: 'btn btn-outline-danger me-2',
            cancelButton: 'btn btn-outline-secondary'
        },
        preDeny: () => {
            // ... (Lógica de preDeny sin cambios) ...
            const comentario = document.getElementById('autorizadorComentario').value;
            if (!comentario || comentario.trim() === '') {
                const el = document.getElementById('autorizadorComentario');
                el.classList.add('is-invalid');
                Swal.showValidationMessage('Es obligatorio agregar un comentario para no autorizar la boleta.');
                return false;
            }
            return true;
        }
    }).then(async (result) => {
        
        // ==========================================================
        // --- 👇 LÓGICA DE CONFIRMACIÓN MODIFICADA AQUÍ 👇 ---
        // ==========================================================

        // 1. Obtener el comentario y la acción del primer modal
        const comentario = document.getElementById('autorizadorComentario').value;
        let nuevoEstado = 0;
        let accionTexto = '';
        let confirmButtonClass = '';

        if (result.isConfirmed) {
            nuevoEstado = 4; // Autorizado
            accionTexto = 'autorizar';
            confirmButtonClass = 'btn btn-success me-2';
        } else if (result.isDenied) {
            nuevoEstado = 5; // No Autorizado
            accionTexto = 'no autorizar';
            confirmButtonClass = 'btn btn-danger me-2';
        } else {
            // Si el usuario presionó "Cancelar" en el primer modal, no hacemos nada.
            return;
        }

        // 2. Mostrar el SEGUNDO modal de confirmación
        const confirmResult = await Swal.fire({
            title: `¿Está seguro de ${accionTexto} esta boleta?`,
            html: `<b>Comentario:</b><br>${comentario || '(Sin comentario)'}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: `Sí, ${accionTexto}`,
            cancelButtonText: 'Revisar de nuevo',
            buttonsStyling: false,
            customClass: {
                confirmButton: confirmButtonClass,
                cancelButton: 'btn btn-outline-secondary'
            }
        });

        // 3. Verificar la respuesta del SEGUNDO modal
        if (confirmResult.isConfirmed) {
            
            // 4. Si se confirma, ejecutar la lógica de procesamiento original
            Swal.fire({
                title: 'Procesando...',
                text: 'Por favor, espere mientras se actualiza el estado de la boleta.',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const response = await actualizarEstadoBoleta(detalles.idBoleta, nuevoEstado, comentario, tipoBoleta);

            if (response && response.success) {
                await Swal.fire({
                    title: '¡Actualizado!',
                    text: `La boleta ha sido marcada como "${nuevoEstado === 4 ? 'Autorizada' : 'No Autorizada'}".`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                // Recargar la tabla
                document.getElementById('tipoBoletaFilter').dispatchEvent(new Event('change'));
            } else {
                Swal.fire('Error', response.error || 'Ocurrió un problema al intentar actualizar la boleta.', 'error');
            }
        }
        // Si 'confirmResult' no es 'isConfirmed' (es decir, el usuario presionó "Revisar de nuevo"),
        // no se hace nada y el modal simplemente se cierra, permitiendo al usuario volver a revisar.
    });
}

/**
 * Genera el HTML para los detalles específicos de cada tipo de boleta.
 * (MODIFICADA para no incluir tarjetas de resumen, que ahora se manejan en mostrarDetalles)
 */
function generarDetallesDinamicos(ticket, tipoTicket) {
    let camposDinamicosHTML = '';

    switch (tipoTicket) {
        case 'getTicketVacationAuthorized':
            const fechasYDetalles = [
                { fecha: ticket.Fecha1, detalle: ticket.Detalle1 }, { fecha: ticket.Fecha2, detalle: ticket.Detalle2 },
                { fecha: ticket.Fecha3, detalle: ticket.Detalle3 }, { fecha: ticket.Fecha4, detalle: ticket.Detalle4 },
                { fecha: ticket.Fecha5, detalle: ticket.Detalle5 }
            ].filter(item => item.fecha && item.fecha.trim() !== '');
            let vacationDaysHTML = '<p class="text-muted">No se especificaron fechas.</p>';
            if (fechasYDetalles.length > 0) {
                vacationDaysHTML = `<div class="table-responsive"><table class="table table-bordered table-sm align-middle mb-0"><thead class="table-light"><tr><th style="width: 30%">Fecha</th><th>Descripción</th></tr></thead><tbody>${fechasYDetalles.map(item => `<tr><td>${formatearFecha(item.fecha)}</td><td>${item.detalle || 'Sin detalle'}</td></tr>`).join('')}</tbody></table></div>`;
            }
            // MODIFICADO: Solo devuelve la tabla
            camposDinamicosHTML = vacationDaysHTML;
            break;

        case 'getTicketTimeAuthorized':
            const fechasReposicion = [
                { fecha: ticket.Fecha1, fechaR: ticket.FechaR1 }, { fecha: ticket.Fecha2, fechaR: ticket.FechaR2 },
                { fecha: ticket.Fecha3, fechaR: ticket.FechaR3 }, { fecha: ticket.Fecha4, fechaR: ticket.FechaR4 },
                { fecha: ticket.Fecha5, fechaR: ticket.FechaR5 }
            ].filter(item => item.fecha || item.fechaR);
            let replaceTimeHTML = `<div class="table-responsive"><table class="table table-bordered table-sm align-middle mb-0"><thead class="table-light"><tr><th style="width: 50%">Fecha a reponer</th><th style="width: 50%">Fecha de reposición</th></tr></thead><tbody>`;
            if (fechasReposicion.length > 0) {
                replaceTimeHTML += fechasReposicion.map(item => `<tr><td>${item.fecha ? formatearFecha(item.fecha) : 'N/A'}</td><td>${item.fechaR ? formatearFecha(item.fechaR) : 'N/A'}</td></tr>`).join('');
            } else {
                replaceTimeHTML += `<tr><td colspan="2" class="text-center text-muted">No se especificaron fechas.</td></tr>`;
            }
            replaceTimeHTML += `</tbody></table></div>`;
            // MODIFICADO: Solo devuelve la tabla
            camposDinamicosHTML = replaceTimeHTML;
            break;

        case 'getTicketJustificationAuthorized':
            const fechasJustificacion = [{ fecha: ticket.fecha1 }, { fecha: ticket.fecha2 }, { fecha: ticket.fecha3 }, { fecha: ticket.fecha4 }, { fecha: ticket.fecha5 }].filter(item => item.fecha && item.fecha.trim() !== '');
            let justificationHTML;
            if (fechasJustificacion.length > 0) {
                justificationHTML = `<div class="table-responsive"><table class="table table-bordered table-sm align-middle mb-0"><thead class="table-light"><tr><th style="width: 100%">Fecha de la Justificación</th></tr></thead><tbody>${fechasJustificacion.map(item => `<tr><td>${formatearFecha(item.fecha)}</td></tr>`).join('')}</tbody></table></div>`;
            } else {
                justificationHTML = `<p class="text-muted">No se especificaron fechas.</p>`;
            }
            // MODIFICADO: Solo devuelve la tabla
            camposDinamicosHTML = justificationHTML;
            break;

        case 'getTicketRequestIGSSAuthorized':
            const igssHTML = `<div class="table-responsive"><table class="table table-bordered table-sm align-middle mb-0"><thead class="table-light"><tr><th style="width: 30%">Fecha de Cita</th><th style="width: 30%">Horario</th><th style="width: 40%">Detalle</th></tr></thead><tbody><tr><td>${formatearFecha(ticket.Fecha) || '-'}</td><td>${ticket.HoraInicio || '-'} a ${ticket.HoraFinal || '-'}</td><td>${ticket.Detalle || 'Sin detalle'}</td></tr></tbody></table></div>`;
            // MODIFICADO: Solo devuelve la tabla
            camposDinamicosHTML = igssHTML;
            break;

        case 'getUserTicketOffIGSSAuthorized':
            const suspensionHTML = `<div class="table-responsive"><table class="table table-bordered table-sm align-middle mb-0"><thead class="table-light"><tr><th style="width: 40%">Fecha de Inicio</th><th style="width: 40%">Fecha de Finalización</th><th style="width: 20%">Total de Días</th></tr></thead><tbody><tr><td>${formatearFecha(ticket.fechaInicio) || '-'}</td><td>${formatearFecha(ticket.fechaFinal) || '-'}</td><td>${ticket.TotalDias || '0'}</td></tr></tbody></table></div>`;
            // MODIFICADO: Solo devuelve la tabla
            camposDinamicosHTML = suspensionHTML;
            break;

        case 'getUserOffAuthorized':
            // ESTE SE QUEDA IGUAL porque no es una tarjeta de resumen, es un detalle
            camposDinamicosHTML = `<div class="col-md-6"><div class="detail-card-tipo"><h5>Tipo de Sanción</h5><ul class="list-group list-group-flush mt-2"><strong>${ticket.Tipo}</strong></ul></div></div>`;
            break;

        default:
            camposDinamicosHTML = `<div class="col-12"><p>Detalles no configurados para este tipo de boleta.</p></div>`;
            break;
    }
    return camposDinamicosHTML;
}

/**
 * Formatea una cadena de fecha a un formato legible.
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
        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    });
}

/**
 * Devuelve el nombre legible del tipo de boleta.
 */
function getNombreTipoBoleta(quest) {
    const types = {
        'getTicketVacationAuthorized': 'Vacaciones',
        'getTicketTimeAuthorized': 'Reposición de Tiempo',
        'getTicketJustificationAuthorized': 'Falta Justificada',
        'getTicketRequestIGSSAuthorized': 'Consulta IGSS',
        'getUserTicketOffIGSSAuthorized': 'Suspensión IGSS',
        'getUserOffAuthorized': 'Sanciones'
    };
    return types[quest] || 'Desconocido';
}

/**
 * Devuelve el objeto de información del estado según su ID.
 */
function getEstadoInfo(idEstado) {
    const estados = {
        1: { texto: 'Pendiente', clase: 'bg-estado-pendiente' }
    };
    return estados[idEstado] || { texto: 'Desconocido', clase: 'bg-secondary' };
}
}