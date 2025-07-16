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
    const horaF1 = document.getElementById('confirmationTimeFrom').value;
    const totalH = document.getElementById('confirmationTimeTo').value;

    const data = {
        quest: 'putTicketOffRRHH',
        horaF1: horaF1,
        totalH: totalH,
        idBoleta: idBoleta,
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

        // Manejo por código de estado
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
            const resultado = await updateTicketState(idBoleta);

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
                    text: 'No se pudo actualizar el estado. Inténtalo de nuevo.',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
            }
        }
    });
}




window.handleTicketReplacement = handleTicketReplacement;
window.updateTicketState = updateTicketState;
window.updateTicketTimeIGSS = updateTicketTimeIGSS;
window.handleConfirmationIGSS = handleConfirmationIGSS;