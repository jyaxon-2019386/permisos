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
            console.log('Success:', result);
            return result;
        } else {
            console.error('Error:', result);
            notyf.error(result.error || result.message || 'Error desconocido');
            throw new Error(result.error || result.message || 'Error desconocido durante la llamada a la API');
        }
    } catch (error) {
        console.error('Error de red o de parsing:', error);
        notyf.error('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
        throw error;
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
        reverseButtons: true,
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await updateTicketState(idBoleta, newState);

                // Cierra el modal detalles
                const detailsModalElement = document.getElementById('detailsModal');
                if (detailsModalElement) {
                    const detailsModal = bootstrap.Modal.getInstance(detailsModalElement);
                    if (detailsModal) {
                        detailsModal.hide();
                    }
                }

                notyf.success(`La boleta #${idBoleta} fue ${newState === 12 ? "aprobada" : "marcada como 'No Repuso'"} correctamente.`);

                // Recarga la tabla con tipo y página actual
                getTickets(tipoActual, currentPage);

            } catch (error) {
                console.error('Error al manejar el reemplazo de la boleta:', error);

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