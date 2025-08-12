import { notyf } from '../../../plugins/notify.js';

document.addEventListener('DOMContentLoaded', function () {
    // Configuración inicial de la interfaz (avatar, sidebar)
    const avatarURL = sessionStorage.getItem('avatar');
    if (avatarURL) {
        const avatarEl = document.getElementById('avatar');
        if (avatarEl) avatarEl.src = avatarURL;
    }

    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', () => document.body.classList.toggle('sidebar-collapsed'));
    }

    // Elementos del formulario
    const igssOffForm = document.getElementById('igssOffForm');
    const container = document.getElementById('igssEntriesContainer');

    // Configura Flatpickr en español para toda la página
    flatpickr.localize(flatpickr.l10ns.es);

    /**
     * CAMBIO: La función ahora cuenta TODOS los días del rango, incluyendo fines de semana.
     * La validación de día de la semana ha sido eliminada.
     */
    const actualizarTotalDias = () => {
        const startDateInput = document.querySelector('.flatpickr-date-start');
        const endDateInput = document.querySelector('.flatpickr-date-end');
        let totalDays = 0;

        if (startDateInput?.value && endDateInput?.value) {
            const startDate = new Date(startDateInput.value);
            const endDate = new Date(endDateInput.value);

            // Asegurarse de que la fecha de fin no sea anterior a la de inicio
            if (endDate >= startDate) {
                // Calcula la diferencia en milisegundos
                const differenceInTime = endDate.getTime() - startDate.getTime();
                // Convierte la diferencia a días y se le suma 1 para incluir el día de inicio
                totalDays = (differenceInTime / (1000 * 3600 * 24)) + 1;
            }
        }
        
        // Actualiza el texto en la página y el valor del input oculto
        document.getElementById('totalDiasSolicitados').textContent = Math.round(totalDays);
        document.getElementById('formTotalD').value = Math.round(totalDays);
    };

    /**
     * Añade el bloque para seleccionar el rango de fechas.
     * Solo permite que se añada un bloque.
     */
    const addDayEntry = () => {
        if (container.children.length > 0) {
            notyf.error('Solo puedes añadir un rango de fechas para este tipo de boleta.');
            return;
        }

        const newEntryHTML = `
            <div class="special-entry-item card p-3 mb-3">
                <div class="row g-3 align-items-center">
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Fecha Inicio</label>
                        <input type="text" class="form-control flatpickr-date-start" placeholder="Seleccionar fecha..." required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Fecha Final</label>
                        <input type="text" class="form-control flatpickr-date-end" placeholder="Seleccionar fecha..." required>
                    </div>
                </div>
            </div>`;
        container.insertAdjacentHTML('beforeend', newEntryHTML);

        const startDatePicker = container.querySelector('.flatpickr-date-start');
        const endDatePicker = container.querySelector('.flatpickr-date-end');
        
        const endDateInstance = flatpickr(endDatePicker, {
            altInput: true,
            altFormat: "j F, Y",
            dateFormat: "Y-m-d",
            onChange: actualizarTotalDias,
        });

        flatpickr(startDatePicker, {
            altInput: true,
            altFormat: "j F, Y",
            dateFormat: "Y-m-d",
            minDate: "today",
            onChange: (selectedDates) => {
                if (selectedDates.length > 0) {
                    endDateInstance.set('minDate', selectedDates[0]);
                }
                actualizarTotalDias();
            }
        });
    };

    // Event listener para enviar el formulario
    igssOffForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const startDateValue = document.querySelector('.flatpickr-date-start')?.value;
        const endDateValue = document.querySelector('.flatpickr-date-end')?.value;

        if (!startDateValue || !endDateValue) {
            notyf.error('Por favor, selecciona las fechas de inicio y finalización.');
            return;
        }
        
        const data = {
            fechaInicio: startDateValue,
            fechaFinal: endDateValue,
            totalD: document.getElementById('formTotalD').value,
            observaciones1: document.getElementById('observaciones')?.value || null,
        };
        
        await postTicketOffIGSS(data);
    });

    // Iniciar la lógica de la página
    addDayEntry();
});


async function postTicketOffIGSS(data) {
    try {
        const idUsuario = sessionStorage.getItem('idUsuario');
        if (!idUsuario) {
            notyf.error('Error de autenticación. Por favor, inicie sesión de nuevo.');
            return;
        }
        const response = await fetch(`../../assets/php/auth/auth.php?quest=getUserData&idUsuario=${idUsuario}`);
        
        if (response.ok) {
            const userData = await response.json();
            data.idSolicitante = idUsuario;
            data.idCreador = idUsuario;
            data.idDepartamento = userData.user.idDepartamento;
            data.idEstado = userData.user.nivel;
            data.idJefe = userData.user.idJefe || null;
            data.idGerente = userData.user.idGerente || null;
            data.idRH = userData.user.idRH || null;
        } else {
            notyf.error('No se pudo obtener la información del usuario para enviar la boleta.');
            return; 
        }
    } catch (error) {
        notyf.error('Error de conexión al obtener datos de usuario: ' + error.message);
        return; 
    }

    const today = new Date();
    data.fechaSolicitud = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    try {
        data.quest = 'postTicketOffIGSS';

        const response = await fetch('../../assets/php/tickets/tickets.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            notyf.error(result.detalle || result.error || 'Error al crear la boleta');
        } else {
            notyf.success(result.success || 'Boleta creada correctamente');
            setTimeout(() => {
                window.location.href = '../../pages/ticket/new-ticket.html';
            }, 2000);
        }
    } catch (error) {
        notyf.error('Error de conexión: ' + error.message);
    }
}

function logout() {
    sessionStorage.clear();
    window.location.href = '../../pages/authentication/signin/login.html';
}

window.logout = logout;