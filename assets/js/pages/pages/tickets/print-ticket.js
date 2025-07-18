
/**
 * Genera el HTML para el detalle de una boleta, ideal para impresión o PDF, con un diseño de media página.
 * @param {object} ticket - El objeto con los datos de la boleta.
 * @param {string} tituloBoleta - El título específico de la boleta.
 * @param {string} tipoTicket - Identificador del tipo de boleta.
 * @returns {string} - El HTML del detalle de la boleta.
 */
function generarHTMLDetalleImpresion(ticket, tituloBoleta, tipoTicket) {
    const nombreEmpresa = getEmpresa(ticket.Empresa);
    const observaciones = [
        ticket.observaciones, ticket.observaciones1, ticket.observaciones2,
        ticket.observaciones3, ticket.observaciones4, ticket.observaciones5
    ].filter(Boolean).join('; ');

    const solicitante = ticket.Solicitante || 'No especificado';
    const puesto = ticket.Puesto || ticket.Cargo || 'No especificado';
    const departamento = ticket.Departamento || 'No especificado';
    const estado = ticket.Estado || 'No especificado';
    const fechaSolicitud = ticket.FechaDeCreacion || 'No especificada';

    let rightColumnHTML = '';

    switch (tipoTicket) {
        case 'getTicketOffRRHH':
            rightColumnHTML = `
                <h4 style="margin-top:0; margin-bottom: 10px; font-size: 14px; color: #333;">Detalle de la Sanción</h4>
                <p style="margin: 5px 0;"><strong>Tipo de Sanción:</strong></p>
                <p style="margin: 5px 0; font-size: 14px; font-weight: 600;">${ticket.Tipo || 'No especificado'}</p>`;
            break;

        case 'getUserTicketOffIGSSRRHH':
            rightColumnHTML = `
                <h4 style="margin-top:0; margin-bottom: 10px; font-size: 14px; color: #333;">Detalle de Suspensión</h4>
                <p style="margin: 5px 0;"><strong>Fecha de Inicio:</strong> ${formatAndFilterDate(ticket.fechaInicio) || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Fecha Final:</strong> ${formatAndFilterDate(ticket.fechaFinal) || 'N/A'}</p>
                <p style="margin-top: 15px; font-size: 14px;"><strong>Total de Días:</strong> ${ticket.TotalDias || '0'}</p>`;
            break;

        case 'getTicketRequestIGSSRRHH':
            rightColumnHTML = `
                <h4 style="margin-top:0; margin-bottom: 10px; font-size: 14px; color: #333;">Detalle de Consulta</h4>
                <p style="margin: 5px 0;"><strong>Fecha:</strong> ${formatAndFilterDate(ticket.Fecha) || 'N/A'}</p>
                <div class="col-md-6"><strong>Detalle:</strong> ${ticket.Detalles || 'Boleta de Consulta de IGSS'}</div>
                <p style="margin: 5px 0;"><strong>Hora Inicio:</strong> ${ticket.HoraInicio || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Hora Final:</strong> ${ticket.HoraFinal || 'N/A'}</p>
                <p style="margin-top: 15px; font-size: 14px;"><strong>Total de Horas:</strong> ${ticket.HorasTotal || '0'}</p>`;
            break;

        case 'getTicketJustificationRRHH':
            const specialDays = [];
            for (let i = 1; i <= 5; i++) {
                const date = formatAndFilterDate(ticket[`fecha${i}`]);
                const detail = ticket[`Detalle${i}`];
                if (date) {
                    specialDays.push({ date, detail: detail || 'Día completo' });
                }
            }
            let specialRows = specialDays.map(day => `
                <tr>
                    <td style="padding: 4px 8px; border: 1px solid #ddd;">${day.date}</td>
                    <td style="padding: 4px 8px; border: 1px solid #ddd;">${day.details || 'Boleta de Falta Justificada Especial'}</td>
                </tr>`).join('');
            if (!specialRows) specialRows = '<tr><td colspan="2" style="padding: 5px; text-align: center;">No hay fechas.</td></tr>';

            rightColumnHTML = `
                <h4 style="margin-top:0; margin-bottom: 10px; font-size: 14px; color: #333;">Detalle de Permiso</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr>
                            <th style="padding: 6px; border: 1px solid #ddd; background-color: #f2f2f2;">Fecha</th>
                            <th style="padding: 6px; border: 1px solid #ddd; background-color: #f2f2f2;">Detalle</th>
                        </tr>
                    </thead>
                    <tbody>${specialRows}</tbody>
                </table>
                <p style="margin-top: 15px; font-size: 14px;"><strong>Total de Horas:</strong> ${ticket.totalHoras || '0'}</p>`;
            break;

        case 'getTicketVacationsRRHH':
            const vacationDays = [];
            for (let i = 1; i <= 5; i++) {
                const date = formatAndFilterDate(ticket[`Fecha${i}`]);
                const detail = ticket[`Detalle${i}`];
                if (date) {
                    vacationDays.push({ date, detail: detail || 'Día completo' });
                }
            }
            let vacationRows = vacationDays.map(day => `
                <tr>
                    <td style="padding: 4px 8px; border: 1px solid #ddd;">${day.date}</td>
                    <td style="padding: 4px 8px; border: 1px solid #ddd;">${day.detail}</td>
                </tr>`).join('');
            if (!vacationRows) vacationRows = '<tr><td colspan="2" style="padding: 5px; text-align: center;">No hay fechas.</td></tr>';

            rightColumnHTML = `
                <h4 style="margin-top:0; margin-bottom: 10px; font-size: 14px; color: #333;">Detalle de Vacaciones</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr>
                            <th style="padding: 6px; border: 1px solid #ddd; background-color: #f2f2f2;">Fecha</th>
                            <th style="padding: 6px; border: 1px solid #ddd; background-color: #f2f2f2;">Detalle</th>
                        </tr>
                    </thead>
                    <tbody>${vacationRows}</tbody>
                </table>
                <p style="margin-top: 15px; font-size: 14px;"><strong>Total de Días:</strong> ${ticket.TotalDias || '0'}</p>`;
            break;

        case 'getTicketReplaceTimeRRHH':
            const fechasAReponer = [ticket.Fecha1, ticket.Fecha2, ticket.Fecha3, ticket.Fecha4, ticket.Fecha5].map(formatAndFilterDate).filter(Boolean);
            const fechasReposicion = [ticket.FechaR1, ticket.FechaR2, ticket.FechaR3, ticket.FechaR4, ticket.FechaR5].map(formatAndFilterDate).filter(Boolean);
            let replacementRows = '';
            const maxRows = Math.max(fechasAReponer.length, fechasReposicion.length);
            if (maxRows > 0) {
                for (let i = 0; i < maxRows; i++) {
                    replacementRows += `
                        <tr>
                            <td style="padding: 4px 8px; border: 1px solid #ddd; text-align: center;">${fechasAReponer[i] || ''}</td>
                            <td style="padding: 4px 8px; border: 1px solid #ddd; text-align: center;">${fechasReposicion[i] || ''}</td>
                        </tr>`;
                }
            } else {
                replacementRows = '<tr><td colspan="2" style="padding: 5px; text-align: center;">No hay fechas.</td></tr>';
            }

            rightColumnHTML = `
                <h4 style="margin-top:0; margin-bottom: 10px; font-size: 14px; color: #333;">Detalle de Reposición</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr>
                            <th style="padding: 6px; border: 1px solid #ddd; background-color: #f2f2f2;">Fechas a Reponer</th>
                            <th style="padding: 6px; border: 1px solid #ddd; background-color: #f2f2f2;">Fechas de Reposición</th>
                        </tr>
                    </thead>
                    <tbody>${replacementRows}</tbody>
                </table>
                <p style="margin-top: 10px; font-size: 13px;"><strong>Horas a Reponer:</strong> ${ticket.totalHoras || '0'}<br>
                <strong>Horas Repuestas:</strong> ${ticket.totalHorasR || '0'}</p>`;
            break;

        default:
            rightColumnHTML = `<p>Detalles no configurados para este tipo de boleta.</p>`;
            break;
    }

    // Obtener la firma del jefe inmediato
    const firmaInfo = getFirmaJefe(departamento); // Obtiene el objeto con src y style
    const defaultImgStyle = "max-width: 150px; height: auto; display: block; margin: 0 auto;"; // Estilo por defecto
    const customImgStyle = firmaInfo.style || defaultImgStyle; // Usa el estilo específico o el por defecto

    const firmaJefeHTML = firmaInfo.src ? `<img src="${firmaInfo.src}" alt="Firma del Jefe Inmediato" style="${customImgStyle}">` : '';


    return `
        <div style="max-width: 800px; margin: auto; font-family: 'Poppins', sans-serif; border: 1px solid #ccc; border-radius: 8px; padding: 20px; font-size: 12px;">
            <header style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; border-bottom: 2px solid #0056b3;">
                <img src="../../assets/img/logos/econsa.webp" alt="Logo de la Empresa" style="width: 120px; height: auto;">
                <div style="text-align: right;">
                    <h2 style="color: #0056b3; margin: 0; font-size: 20px; font-weight: 700;">${tituloBoleta}</h2>
                    <p style="color: #555; margin: 4px 0 0; font-size: 16px;">#${ticket.idBoleta || 'N/A'}</p>
                </div>
            </header>

            <main style="padding: 15px 0; display: flex; justify-content: space-between; gap: 25px;">
                <div style="width: 48%;">
                    <h4 style="margin-top:0; margin-bottom: 10px; font-size: 14px; color: #333;">Información del Colaborador</h4>
                    <p style="margin: 5px 0;"><strong>Solicitante:</strong> ${solicitante}</p>
                    <p style="margin: 5px 0;"><strong>Puesto:</strong> ${puesto}</p>
                    <p style="margin: 5px 0;"><strong>Departamento:</strong> ${departamento}</p>
                    <p style="margin: 5px 0;"><strong>Empresa:</strong> ${nombreEmpresa}</p>
                    <p style="margin: 5px 0;"><strong>Fecha de Solicitud:</strong> ${fechaSolicitud}</p>
                    <p style="margin: 5px 0;"><strong>Estado:</strong> <span style="font-weight: 600;">${estado}</span></p>
                </div>
                <div style="width: 48%; border-left: 1px solid #eee; padding-left: 25px;">
                    ${rightColumnHTML}
                </div>
            </main>

            <div style="padding-top: 10px;">
                    <h4 style="margin-top:0; margin-bottom: 5px; font-size: 14px; color: #333;">Observaciones</h4>
                    <p style="margin: 5px 0; font-size: 12px; min-height: 40px;">${observaciones || 'Sin observaciones.'}</p>
            </div>

            <footer style="margin-top: 40px; display: flex; justify-content: space-around; align-items: flex-end; padding-top: 15px; border-top: 1px solid #ccc;">
                <div style="text-align: center; width: 45%;">
                    <div style="height: 70px; display: flex; align-items: flex-end; justify-content: center;">
                        ${firmaJefeHTML}
                    </div>
                    <div style="border-bottom: 1px solid #333; width: 100%; margin: 0 auto 8px auto;"></div>
                    <p style="margin: 0; font-weight: 600; color: #333; font-size: 11px;">Firma del Jefe Inmediato</p>
                </div>
                <div style="text-align: center; width: 45%;">
                    <div style="height: 70px; display: flex; align-items: flex-end; justify-content: center;">
                        </div>
                    <div style="border-bottom: 1px solid #333; width: 100%; margin: 0 auto 8px auto;"></div>
                    <p style="margin: 0; font-weight: 600; color: #333; font-size: 11px;">Firma del Colaborador</p>
                </div>
            </footer>
        </div>
    `;
}

/**
 * Genera el HTML para la vista rápida dentro del modal, con un diseño mejorado.
 * @param {object} ticket - El objeto con los datos de la boleta.
 * @param {string} tituloBoleta - El título específico de la boleta.
 * @param {string} tipoTicket - El valor del select 'tipoTicket'.
 * @returns {string} - El HTML del detalle de la boleta para el modal.
 */
function generarHTMLDetalle(ticket, tituloBoleta, tipoTicket) {
    // --- Las funciones de ayuda y variables iniciales se mantienen igual ---
    const nombreEmpresa = getEmpresa(ticket.Empresa);
    const observaciones = [
        ticket.observaciones, ticket.observaciones1, ticket.observaciones2,
        ticket.observaciones3, ticket.observaciones4, ticket.observaciones5
    ].filter(Boolean).join('; ');

    let camposDinamicosHTML = '';

    switch (tipoTicket) {
        case 'getTicketOffRRHH':
            camposDinamicosHTML = `<div class="col-12"><strong>Tipo de Sanción:</strong> ${ticket.Tipo || 'No especificado'}</div>`;
            break;

        case 'getTicketRequestIGSSRRHH':
    const fechaConsulta = formatAndFilterDate(ticket.Fecha) || 'N/A';
    const horaInicio = ticket.HoraInicio || 'N/A';
    const horaFinal = ticket.HoraFinal || 'N/A';
    const totalHoras = ticket.HorasTotal || '0.00';
    const detalleConsulta = ticket.Detalles || 'Boleta de Consulta de IGSS';

    // ✨ CAMBIO: Se crean variables formateadas para mostrar en 12h
    const horaInicio12h = formatTimeTo12Hour(horaInicio);
    const horaFinal12h = formatTimeTo12Hour(horaFinal);

    camposDinamicosHTML = `
        <div class="col-12">
            <div class="row text-center fw-bold mb-1">
                <div class="col-3"><strong>Fecha</strong></div>
                <div class="col-3"><strong>Hora Inicio</strong></div>
                <div class="col-3"><strong>Hora Final</strong></div>
                <div class="col-3"><strong>Total Horas</strong></div>
            </div>
            <div class="row text-center border rounded py-2 align-items-center">
                <div class="col-3">${fechaConsulta}</div>
                <div class="col-3">${horaInicio12h}</div>
                <div class="col-3">${horaFinal12h}</div>
                <div class="col-3">${totalHoras}</div>
            </div>
        </div>
        <div class="col-12 mt-3">
            <strong>Detalle de la Consulta:</strong> ${detalleConsulta}
        </div>`;

    const mostrarConfirmacion = horaInicio !== 'N/A' && horaFinal !== 'N/A';
    
    if (mostrarConfirmacion && ticket.Estado !== 'Confirmada por Recepcion') {
        camposDinamicosHTML += `
            <div class="col-12 mt-4">
                <h6 class="text-primary mb-3">Confirmar Fecha y Horario</h6>
                <div class="row g-3 align-items-end">
                    <div class="col-md-4">
                        <label for="confirmationDate" class="form-label fw-bold small">Fecha:</label>
                        <input type="date" class="form-control form-control-sm" id="confirmationDate" value="${getCurrentDate()}">
                    </div>
                    <div class="col-md-4">
                        <label for="confirmationTimeFrom" class="form-label fw-bold small">Hora Inicio:</label>
                        <input type="time" class="form-control form-control-sm" id="confirmationTimeFrom" value="${horaInicio !== 'N/A' ? horaInicio : ''}">
                    </div>
                    <div class="col-md-4">
                        <label for="confirmationTimeTo" class="form-label fw-bold small">Hora Final Real:</label>
                        <input type="time" class="form-control form-control-sm" id="confirmationTimeTo">
                    </div>
                </div>
                <div class="row mt-3 align-items-center">
                    <div class="col-md-6"></div>
                    <div class="col-md-6 text-center text-md-end">
                        <span class="text-muted small">TOTAL DE HORAS CONFIRMADAS</span>
                        <h4 class="fw-bold text-success mb-0" id="totalConfirmedHours">0.00</h4>
                    </div>
                </div>
            </div>`;

            setTimeout(() => {
                const timeFrom = document.getElementById('confirmationTimeFrom');
                const timeTo = document.getElementById('confirmationTimeTo');
                const totalSpan = document.getElementById('totalConfirmedHours');

                if (timeFrom?.dataset.default) timeFrom.value = timeFrom.dataset.default;

                const convertirHoraDecimal = h => {
                    const [hh, mm] = (h || '').split(':').map(Number);
                    return isNaN(hh) || isNaN(mm) ? 0 : hh + mm / 60;
                };

                const actualizarTotalHoras = () => {
                    const total = Math.max(0, convertirHoraDecimal(timeTo.value) - convertirHoraDecimal(timeFrom.value));
                    totalSpan.textContent = total.toFixed(2);
                };

                timeFrom?.addEventListener('change', actualizarTotalHoras);
                timeTo?.addEventListener('change', actualizarTotalHoras);
                actualizarTotalHoras();

                document.getElementById('btnConfirmarConsulta')?.addEventListener('click', () => {
                    const fecha = document.getElementById('confirmationDate').value;
                    const hi = timeFrom.value;
                    const hf = timeTo.value;
                    const total = totalSpan.textContent;

                    if (!fecha || !hi || !hf) {
                        notyf.error("Por favor completa todos los campos de confirmación.");
                        return;
                    }

                    console.log("Confirmado IGSS:", { fecha, hi, hf, total });
                    // actualizarBoletaIGSS(ticket.idBoleta, fecha, hi, hf, total);
                });
            }, 100);
        }
        break;
        case 'getTicketJustificationRRHH':
            const specialDays = [];
            for (let i = 1; i <= 5; i++) {
                const date = formatAndFilterDate(ticket[`fecha${i}`]);
                const detail = ticket[`Detalle${i}`];
                if (date) {
                    specialDays.push({ date, detail: detail || 'Boleta de Falta Justificada Especial' });
                }
            }
            let specialHTML = '<div class="col-12"><p class="text-center">No hay fechas para mostrar.</p></div>';
            if (specialDays.length > 0) {
                let rowsHTML = specialDays.map(day => `
                    <div class="row">
                        <div class="col-6 text-center border-end py-1">${day.date}</div>
                        <div class="col-6 text-center py-1">${day.details || 'Boleta de Falta Justificada Especial'}</div>
                    </div>`).join('');
                specialHTML = `
                    <div class="col-12">
                        <div class="row text-center fw-bold mb-1"><div class="col-6"><strong>Fecha</strong></div><div class="col-6"><strong>Detalle</strong></div></div>
                        <div class="container border rounded">${rowsHTML}</div>
                    </div>`;
            }
            camposDinamicosHTML = `
                ${specialHTML}
                <div class="col-12 mt-3"><strong>Total de Horas:</strong> ${ticket.totalHoras || '0'}</div>`;
            break;

        case 'getTicketVacationsRRHH':
            const vacationDays = [];
            for (let i = 1; i <= 5; i++) {
                const date = formatAndFilterDate(ticket[`Fecha${i}`]);
                const detail = ticket[`Detalle${i}`];
                if (date) {
                    vacationDays.push({ date, detail: detail || 'Día completo' });
                }
            }
            let vacationHTML = '<div class="col-12"><p class="text-center">No hay fechas para mostrar.</p></div>';
            if (vacationDays.length > 0) {
                let rowsHTML = vacationDays.map(day => `
                    <div class="row">
                        <div class="col-6 text-center border-end py-1">${day.date}</div>
                        <div class="col-6 text-center py-1">${day.detail}</div>
                    </div>`).join('');
                vacationHTML = `
                    <div class="col-12">
                        <div class="row text-center fw-bold mb-1"><div class="col-6"><strong>Fecha</strong></div><div class="col-6"><strong>Detalle</strong></div></div>
                        <div class="container border rounded">${rowsHTML}</div>
                    </div>`;
            }
            camposDinamicosHTML = `
                ${vacationHTML}
                <div class="col-12 mt-3"><strong>Total de Días Solicitados:</strong> ${ticket.TotalDias || '0'}</div>`;
            break;

        case 'getTicketReplaceTimeRRHH':
            const fechasAReponer = [ticket.Fecha1, ticket.Fecha2, ticket.Fecha3, ticket.Fecha4, ticket.Fecha5].map(formatAndFilterDate).filter(Boolean);
            const fechasReposicion = [ticket.FechaR1, ticket.FechaR2, ticket.FechaR3, ticket.FechaR4, ticket.FechaR5].map(formatAndFilterDate).filter(Boolean);
            let fechasHTML = '<div class="col-12"><p class="text-center">No hay fechas para mostrar.</p></div>';
            if (fechasAReponer.length > 0 || fechasReposicion.length > 0) {
                let rowsHTML = '';
                const maxRows = Math.max(fechasAReponer.length, fechasReposicion.length);
                for (let i = 0; i < maxRows; i++) {
                    rowsHTML += `
                        <div class="row">
                            <div class="col-6 text-center border-end py-1">${fechasAReponer[i] || '&nbsp;'}</div>
                            <div class="col-6 text-center py-1">${fechasReposicion[i] || '&nbsp;'}</div>
                        </div>`;
                }
                fechasHTML = `
                    <div class="col-12">
                        <div class="row text-center fw-bold mb-1"><div class="col-6"><strong>Fechas a Reponer</strong></div><div class="col-6"><strong>Fechas de Reposición</strong></div></div>
                        <div class="container border rounded">${rowsHTML}</div>
                    </div>`;
            }
            camposDinamicosHTML = `
                ${fechasHTML}
                <div class="col-md-6 mt-3"><strong>Total Horas a Reponer:</strong> ${ticket.totalHoras || '0'}</div>
                <div class="col-md-6 mt-3"><strong>Total Horas Repuestas:</strong> ${ticket.totalHorasR || '0'}</div>`;
            break;
            
        default:
            camposDinamicosHTML = `<div class="col-12"><p>Detalles no configurados para este tipo de boleta.</p></div>`;
            break;
    }

    // --- El HTML principal que envuelve todo se mantiene igual ---
    return `
        <div class="card shadow-sm mb-4">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">${tituloBoleta}</h5>
                <span class="badge bg-light text-dark fs-6">#${ticket.idBoleta || 'N/A'}</span>
            </div>
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-6"><strong>Colaborador:</strong> ${ticket.Solicitante || '-'}</div>
                    <div class="col-md-6"><strong>Puesto:</strong> ${ticket.Puesto || ticket.Cargo || '-'}</div>
                    <div class="col-md-6"><strong>Empresa:</strong> ${nombreEmpresa}</div>
                    <div class="col-md-6"><strong>Departamento:</strong> ${ticket.Departamento || '-'}</div>
                    <div class="col-md-6"><strong>Estado:</strong> <span class="badge bg-info text-dark">${ticket.Estado || '-'}</span></div>
                    <div class="col-md-6"><strong>Fecha de Solicitud:</strong> ${ticket.FechaDeCreacion || '-'}</div>
                    <div class="col-12"><strong>Última Actualización:</strong> ${formatearFecha(ticket.FechaActualizado || ticket.fecha_actualizado, true)}</div>
                </div>
            </div>
        </div>

        <div class="card shadow-sm mb-4">
            <div class="card-header bg-light text-dark">
                <h6 class="mb-0">Detalles Específicos</h6>
            </div>
            <div class="card-body">
                <div class="row g-3">
                    ${camposDinamicosHTML}
                </div>
            </div>
        </div>

        <div class="card shadow-sm">
            <div class="card-header bg-light text-dark">
                <h6 class="mb-0">Observaciones</h6>
            </div>
            <div class="card-body">
                <p class="mb-0">${observaciones || 'Sin observaciones.'}</p>
            </div>
        </div>
    `;
}

/**
 * Imprime el detalle de una boleta abriendo una nueva ventana.
 * @param {number | string} idBoleta - El ID de la boleta a imprimir.
 */
function imprimirDetalleBoleta(idBoleta) {
    const ticket = ticketsData.find(t => t.idBoleta == idBoleta);
    if (!ticket) {
        console.error('No se encontró la boleta.');
        return;
    }
    const tipoTicket = document.getElementById('tipoTicket').value;
    const tituloBoleta = obtenerTituloBoleta(tipoTicket);
    const htmlContenido = generarHTMLDetalleImpresion(ticket, tituloBoleta, tipoTicket);
    const ventanaImpresion = window.open('', 'Imprimir Boleta', 'height=800,width=900');
    ventanaImpresion.document.write('<html><head><title>Detalle de Boleta</title>');
    ventanaImpresion.document.write('<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">');
    ventanaImpresion.document.write('</head><body>');
    ventanaImpresion.document.write(htmlContenido);
    ventanaImpresion.document.write('</body></html>');
    ventanaImpresion.document.close();
    ventanaImpresion.focus();
    ventanaImpresion.onload = function() {
        ventanaImpresion.print();
        ventanaImpresion.close();
    };
}

/**
 * Exporta el detalle de una boleta a un archivo PDF.
 * @param {number | string} idBoleta - El ID de la boleta a exportar.
 */
function exportarDetallePDF(idBoleta) {
    const ticket = ticketsData.find(t => t.idBoleta == idBoleta);
    if (!ticket) {
        console.error('No se encontró la boleta.');
        return;
    }
    const tipoTicket = document.getElementById('tipoTicket').value;
    const tituloBoleta = obtenerTituloBoleta(tipoTicket);
    const htmlContenido = generarHTMLDetalleImpresion(ticket, tituloBoleta, tipoTicket);
    const elemento = document.createElement('div');
    elemento.innerHTML = htmlContenido;
    const opciones = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `Boleta_${tituloBoleta.replace(/ /g, '_')}_${ticket.idBoleta}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(elemento).set(opciones).save();
}


function mostrarDetalles(idBoleta) {
    const ticket = ticketsData.find(t => t.idBoleta == idBoleta);
    if (!ticket) return;

    const tipoTicket = document.getElementById('tipoTicket').value;
    const tituloBoleta = obtenerTituloBoleta(tipoTicket); // Asumimos que esta función existe

    const modalContent = document.getElementById('modalContent');
    // Ensure that generarHTMLDetalle creates the necessary elements for confirmation if needed
    modalContent.innerHTML = generarHTMLDetalle(ticket, tituloBoleta, tipoTicket);
    

    const modalFooter = document.querySelector('#detailsModal .modal-footer');
    let footerButtons = `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
        <button type="button" class="btn btn-primary" onclick="imprimirDetalleBoleta(${idBoleta})"><i class="fa fa-print"></i> Imprimir</button>
        <button type="button" class="btn btn-danger" onclick="exportarDetallePDF(${idBoleta})"><i class="fa fa-file-pdf"></i> Exportar a PDF</button>
    `;

    if (tipoTicket === 'getTicketRequestIGSSRRHH') {
        footerButtons += `<button type="button" class="btn btn-success" onclick="handleConfirmationIGSS(${idBoleta})"><i class="fa-solid fa-clock"></i> Confirmar Hora Final</button>`;
    }

    if (tipoTicket === 'getTicketReplaceTimeRRHH') {
        // Aprueba la boleta idEstado = 12
        footerButtons += `<button type="button" class="btn btn-success" onclick="handleTicketReplacement(${idBoleta}, 12)"><i class="fa-solid fa-check"></i> Revisado</button>`;

        // Rechaza la boleta idEstado = 13
        footerButtons += `<button type="button" class="btn btn-danger" onclick="handleTicketReplacement(${idBoleta}, 13)"><i class="fa-solid fa-x"></i> No Repuso Tiempo</button>`;
    }

    modalFooter.innerHTML = footerButtons;

    const detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));
    detailsModal.show();
}

function updateTotalConfirmedHours() {
    const from = document.getElementById('confirmationTimeFrom').value;
    const to = document.getElementById('confirmationTimeTo').value;
    const output = document.getElementById('totalConfirmedHours');

    if (!from || !to) {
        output.value = '';
        return;
    }

    const [fromHours, fromMinutes] = from.split(':').map(Number);
    const [toHours, toMinutes] = to.split(':').map(Number);

    let totalMinutes = (toHours * 60 + toMinutes) - (fromHours * 60 + fromMinutes);

    if (totalMinutes <= 0) {
        output.value = 'Rango inválido';
        return;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    output.value = `${hours}h ${minutes}m`;
}

