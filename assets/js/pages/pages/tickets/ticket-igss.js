import { notyf } from '../../../plugins/notify.js';

document.addEventListener('DOMContentLoaded', async function () {
    // --- Basic UI Setup ---
    const avatarURL = sessionStorage.getItem('avatar');
    if (avatarURL) {
        const avatarEl = document.getElementById('avatar');
        if (avatarEl) avatarEl.src = avatarURL;
    }

    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', () => document.body.classList.toggle('sidebar-collapsed'));
    }

    // --- Form Element Selectors ---
    const igssForm = document.getElementById('igssForm');
    const container = document.getElementById('igssEntriesContainer');
    const addDayBtn = document.getElementById('addDayBtn');
    const workingHoursSelect = document.getElementById('workingHoursSelect');
    const totalHorasSpan = document.getElementById('totalHorasSolicitadas');

    let entryCounter = 0;
    flatpickr.localize(flatpickr.l10ns.es);

    // 💡 NOTE: The user data fetch that was here has been REMOVED.
    // We will now fetch this data inside the postTicketIgss function.

    const updateTotalHours = () => {
        let totalHours = 0;
        const hoursInDay = parseFloat(workingHoursSelect.value) || 8;
        let specificTimeActive = false;

        document.querySelectorAll('.special-entry-item').forEach(item => {
            const specifyTimeSwitch = item.querySelector('.specify-time-switch');

            if (specifyTimeSwitch.checked) {
                specificTimeActive = true;
                return; // Stop iterating if any entry is specific time
            }
            totalHours += hoursInDay;
        });
        
        if (specificTimeActive) {
            totalHorasSpan.textContent = 'Por Confirmar en Recepción';
            document.getElementById('formTotalH').value = 0.00; // Server will handle total calculation
        } else {
            totalHorasSpan.textContent = totalHours.toFixed(2);
            document.getElementById('formTotalH').value = totalHours.toFixed(2);
        }
    };

    const addDayEntry = () => {
        entryCounter++;
        if (entryCounter > 1) { // Only one entry is allowed
            notyf.error('Solo puedes añadir un día para este tipo de boleta.');
            return;
        }

        const entryId = `entry-${Date.now()}`;
        const hoursInDay = workingHoursSelect.value;
        const newEntryHTML = `
            <div class="special-entry-item card p-3 mb-3" id="${entryId}">
                <div class="row g-3 align-items-center">
                    <div class="col-md-4">
                        <label class="form-label fw-bold">Fecha</label>
                        <input type="text" class="form-control flatpickr-date" placeholder="Seleccionar fecha..." required>
                    </div>
                    <div class="col-md-5">
                        <label class="form-label fw-bold">Tipo de Día</label>
                        <div class="day-type-container">
                            <div class="form-control day-type-label">Día Completo (${hoursInDay}h)</div>
                            <input type="hidden" class="day-type-select" value="full">
                        </div>
                        <div class="time-range-container" style="display: none;">
                            <div class="input-group">
                                <input type="text" class="form-control flatpickr-time-start" placeholder="Inicio">
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="d-flex align-items-center justify-content-end h-100 gap-2">
                            <div class="d-flex flex-column align-items-center" title="Horario Específico" >
                                <i class="fas fa-clock mb-2 fs-4"></i>
                                <div class="form-check form-switch m-0">
                                    <input class="form-check-input specify-time-switch" type="checkbox" role="switch" style="transform: scale(1.4);">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-12">
                        <label class="form-label">Descripción</label>
                        <input type="text" class="form-control entry-description" placeholder="Ej: Cita médica, cita personal, etc.">
                    </div>
                </div>
            </div>`;

        container.insertAdjacentHTML('beforeend', newEntryHTML);
        const newEntryElement = document.getElementById(entryId);

        flatpickr(newEntryElement.querySelector('.flatpickr-date'), {
            altInput: true,
            altFormat: "j F, Y",
            dateFormat: "Y-m-d",
            minDate: "today",
            locale: "es",
            onChange: updateTotalHours
        });

        flatpickr(newEntryElement.querySelector('.flatpickr-time-start'), {
            enableTime: true,
            noCalendar: true,
            dateFormat: "h:i K",
            time_24hr: false,
            onChange: updateTotalHours
        });

        newEntryElement.querySelector('.specify-time-switch').addEventListener('change', (e) => {
            const parentItem = e.target.closest('.special-entry-item');
            const dayTypeContainer = parentItem.querySelector('.day-type-container');
            const timeRangeContainer = parentItem.querySelector('.time-range-container');
            dayTypeContainer.style.display = e.target.checked ? 'none' : 'block';
            timeRangeContainer.style.display = e.target.checked ? 'block' : 'none';
            updateTotalHours();
        });

        updateTotalHours();
    };
    
    // --- Event Listeners ---
    addDayBtn.addEventListener('click', addDayEntry);
    
    workingHoursSelect.addEventListener('change', () => {
        const workingHours = workingHoursSelect.value;
        document.querySelectorAll('.day-type-label').forEach(label => {
            label.textContent = `Día Completo (${workingHours}h)`;
        });
        updateTotalHours();
    });

    igssForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Basic validation
        let allDatesFilled = true;
        document.querySelectorAll('.special-entry-item .flatpickr-date').forEach(input => {
            if (!input.value) {
                allDatesFilled = false;
            }
        });

        if (!allDatesFilled) {
            notyf.error('Por favor, selecciona una fecha para cada día solicitado.');
            return;
        }
        
        // Prepare main data object
        const data = {
            totalH: document.getElementById('formTotalH').value,
            observaciones1: document.getElementById('observaciones')?.value || null,
        };

        // Populate entries data
        const entries = document.querySelectorAll('.special-entry-item');
        entries.forEach((entry, index) => {
            const idx = index + 1;
            const isSpecificTime = entry.querySelector('.specify-time-switch').checked;
            
            data[`fecha${idx}`] = entry.querySelector('.flatpickr-date').value;
            data[`desc${idx}`] = entry.querySelector('.entry-description').value || null;
            
            if (isSpecificTime) {
                const startTimeStr = entry.querySelector('.flatpickr-time-start').value;
                const convertToDecimalTime = (time12hr) => {
                    if (!time12hr) return null;
                    const [time, modifier] = time12hr.split(' ');
                    let [hours, minutes] = time.split(':');
                    let hoursNum = parseInt(hours, 10);
                    if (modifier === 'PM' && hoursNum !== 12) hoursNum += 12;
                    if (modifier === 'AM' && hoursNum === 12) hoursNum = 0;
                    return (hoursNum + (parseInt(minutes, 10) / 60));
                };
                const horaIDecimal = convertToDecimalTime(startTimeStr);
                data[`horaI${idx}`] = horaIDecimal ? horaIDecimal.toFixed(2) : null;
                data[`horaF${idx}`] = null;
            } else {
                let hoursDecimal = parseFloat(workingHoursSelect.value) || 8;
                data[`horaI${idx}`] = "8.00";
                data[`horaF${idx}`] = (8.00 + hoursDecimal).toFixed(2);
            }
        });
        
        // Send data to be processed and submitted
        await postTicketIgss(data);
    });

    // Automatically add the first day entry on page load
    addDayEntry();
});

async function postTicketIgss(data) {
    // 💡 ADDED: Fetch user data just-in-time
    try {
        const idUsuario = sessionStorage.getItem('idUsuario');
        if (!idUsuario) {
            notyf.error('Error de autenticación. Por favor, inicie sesión de nuevo.');
            return;
        }
        const response = await fetch(`../../assets/php/auth/auth.php?quest=getUserData&idUsuario=${idUsuario}`);
        
        if (response.ok) {
            const userData = await response.json();
            // 💡 CHANGED: Add fetched data directly to the 'data' object
            data.idSolicitante = idUsuario;
            data.idCreador = idUsuario;
            data.idDepartamento = userData.user.idDepartamento;
            data.idEstado = userData.user.nivel;
            data.idJefe = userData.user.idJefe || null;
            data.idGerente = userData.user.idGerente || null;
            data.idRH = userData.user.idRH || null;
        } else {
            notyf.error('No se pudo obtener la información del usuario para enviar la boleta.');
            return; // 💡 CRITICAL: Stop submission if user data fails
        }
    } catch (error) {
        notyf.error('Error de conexión al obtener datos de usuario: ' + error.message);
        return; // 💡 CRITICAL: Stop submission on connection error
    }

    // Add submission date
    const today = new Date();
    data.fechaSolicitud = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Ensure unused fields are null
    for (let i = 1; i <= 4; i++) { // Assuming a max of 4, adjust if needed
        if (!data[`fecha${i}`]) data[`fecha${i}`] = null;
        if (!data[`horaI${i}`] ) data[`horaI${i}`] = null;
        if (!data[`horaF${i}`]) data[`horaF${i}`] = null;
        if (!data[`desc${i}`]) data[`desc${i}`] = null;
    }

    // Final POST request to create the ticket
    try {
        data.quest = 'postTicketRequestIGSS';

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