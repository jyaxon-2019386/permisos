import { notyf } from '../../../plugins/notify.js'

async function updateTicketState(ticketId, newState) {
    const data = {
        quest: 'putStateTickets',
        idBoleta: ticketId,
        nuevoEstado: newState
    };

    try {
        const response = await fetch('/permisos/assets/php/tickets/tickets.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            notyf.success(`Boleta #${ticketId} actualizada correctamente.`);
            return { success: true, result };
        }

        // Manejo por código de estado
        if (response.status === 409) {
            notyf.open({
            type: 'warning',
            message: `La boleta #${ticketId} ya tiene este estado.`
        });

            return { success: false, tipo: 'estadoRepetido' };
        }

        notyf.error(result.error || result.message || 'Error desconocido.');
        return { success: false, tipo: 'errorGeneral' };

    } catch (error) {
        console.error('Error de red o parsing:', error);
        notyf.error('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
        return { success: false, tipo: 'errorRed', error };
    }
}


async function handleTicketReplacement(idBoleta, newState) {
    const confirmAction = newState === 12 ? "aprobar" : "marcar como 'No Repuso'";

    Swal.fire({
        title: `¿Confirmar ${confirmAction}?`,
        html: `<strong>Boleta #${idBoleta}</strong><br>Esta acción no se puede deshacer.`,
        icon: 'question',
        iconColor: '#007bff',
        showCancelButton: true,
        confirmButtonText: `Sí, ${confirmAction}`,
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#198754',
        cancelButtonColor: '#6c757d',
        reverseButtons: true
    }).then(async (result) => {
        if (result.isConfirmed) {
            const resultado = await updateTicketState(idBoleta, newState);

            if (resultado.success) {
                // Cierra modal si existe
                const detailsModalElement = document.getElementById('detailsModal');
                if (detailsModalElement) {
                    const detailsModal = bootstrap.Modal.getInstance(detailsModalElement);
                    if (detailsModal) {
                        detailsModal.hide();
                    }
                }

                // Recarga tabla
                getTickets(tipoActual, currentPage);
            } else if (resultado.tipo === 'estadoRepetido') {
                // No mostrar nada adicional, ya fue notificado por notyf
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo actualizar el estado. Inténtalo de nuevo.',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
            }
        }
    });
}
async function updateTicketTimeIGSS(idBoleta) {
    const horaF1Input = document.getElementById('confirmationTimeTo');
    const horaInicioInput = document.getElementById('confirmationTimeFrom');
    const totalHTextElement = document.getElementById('totalConfirmedHours');

    let horaF1 = null;
    let totalH = 8.00; // Valor por defecto

    // Obtener hora final si existe
    if (horaF1Input) {
        const valor = horaF1Input.value.trim();
        if (valor !== '') {
            horaF1 = valor;
        }
    }

    // Obtener total horas si existe y es numérico
    if (totalHTextElement) {
        const totalHText = totalHTextElement.textContent;
        const parsedTotal = parseFloat(totalHText.replace(/[^0-9.]/g, ''));
        if (!isNaN(parsedTotal)) {
            totalH = parsedTotal;
        }
    }

    // Validar que hora final no sea menor a la hora de inicio
    if (horaF1 && horaInicioInput && horaInicioInput.value) {
        const [hInicio, mInicio] = horaInicioInput.value.split(':').map(Number);
        const [hFinal, mFinal] = horaF1.split(':').map(Number);

        const minutosInicio = hInicio * 60 + mInicio;
        const minutosFinal = hFinal * 60 + mFinal;

        if (minutosFinal < minutosInicio) {
            notyf.open({
                type: 'error',
                message: 'La hora final no puede ser menor que la hora de inicio.'
            });
            return { success: false, tipo: 'horaInvalida' };
        }
    }

    const data = {
        quest: 'putTicketOffRRHH',
        horaF1, // puede ser string 'HH:mm' o null
        totalH: isNaN(totalH) ? 8.00 : totalH,
        idBoleta,
    };

    try {
        const response = await fetch('/permisos/assets/php/tickets/tickets.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            notyf.success(`Boleta #${idBoleta} actualizada correctamente.`);
            return { success: true, result };
        }

        if (response.status === 400) {
            notyf.open({
                type: 'error',
                message: `Datos inválidos para la boleta #${idBoleta}.`
            });
            return { success: false, tipo: 'valide' };
        }

        notyf.error(result.error || result.message || 'Error desconocido.');
        return { success: false, tipo: 'errorGeneral' };

    } catch (error) {
        console.error('Error de red o parsing:', error);
        notyf.error('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
        return { success: false, tipo: 'errorRed', error };
    }
}


async function handleConfirmationIGSS(idBoleta) {
    // const confirmAction = newState === 12 ? "aprobar" : "marcar como 'No Repuso'";

    Swal.fire({
        title: `¿Confirmar horario?`,
        html: `<strong>Boleta #${idBoleta}</strong><br>Esta acción no se puede deshacer.`,
        icon: 'question',
        iconColor: '#007bff',
        showCancelButton: true,
        confirmButtonText: `Sí, confirmar`,
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#198754',
        cancelButtonColor: '#6c757d',
        reverseButtons: true
    }).then(async (result) => {
        if (result.isConfirmed) {
            const resultado = await updateTicketTimeIGSS(idBoleta);

            if (resultado.success) {
                // Cierra modal si existe
                const detailsModalElement = document.getElementById('detailsModal');
                if (detailsModalElement) {
                    const detailsModal = bootstrap.Modal.getInstance(detailsModalElement);
                    if (detailsModal) {
                        detailsModal.hide();
                    }
                }

                // Recarga tabla
                getTickets(tipoActual, currentPage);
            } else if (resultado.tipo === 'valide') {
                // No mostrar nada adicional, ya fue notificado por notyf
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo actualizar la boleta. Inténtalo de nuevo.',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
            }
        }
    });
}

function getCurrentDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Convierte una hora en formato de 24h (ej: "14:30") a formato de 12h con AM/PM (ej: "02:30 PM").
 * @param {string} time24 La hora en formato de 24 horas.
 * @returns {string} La hora en formato de 12 horas o 'N/A' si la entrada es inválida.
 */
function formatTimeTo12Hour(time24) {
    if (!time24 || time24 === 'N/A') {
        return 'N/A';
    }

    const [hours, minutes] = time24.split(':');
    const hoursNum = parseInt(hours, 10);

    const ampm = hoursNum >= 12 ? 'PM' : 'AM';
    let hours12 = hoursNum % 12;
    hours12 = hours12 ? hours12 : 12; // La hora '0' debe ser '12'

    const hours12Padded = String(hours12).padStart(2, '0');

    return `${hours12Padded}:${minutes} ${ampm}`;
}
window.handleTicketReplacement = handleTicketReplacement;
window.updateTicketState = updateTicketState;
window.updateTicketTimeIGSS = updateTicketTimeIGSS;
window.handleConfirmationIGSS = handleConfirmationIGSS;
window.getCurrentDate = getCurrentDate;
window.formatTimeTo12Hour = formatTimeTo12Hour;