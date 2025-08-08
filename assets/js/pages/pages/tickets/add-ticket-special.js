import { notyf } from '../../../plugins/notify.js';

const MAX_SPECIAL_DAYS = 5;

document.addEventListener('DOMContentLoaded', async function () {
    const avatarURL = sessionStorage.getItem('avatar');
    if (avatarURL) {
        const avatarEl = document.getElementById('avatar');
        if (avatarEl) avatarEl.src = avatarURL;
    }

    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', () => document.body.classList.toggle('sidebar-collapsed'));
    }

    const specialForm = document.getElementById('specialForm');
    const container = document.getElementById('specialEntriesContainer');
    const addDayBtn = document.getElementById('addDayBtn');
    const workingHoursSelect = document.getElementById('workingHoursSelect');
    const totalHorasSpan = document.getElementById('totalHorasSolicitadas');

    let entryCounter = 0;

    flatpickr.localize(flatpickr.l10ns.es);

    const updateTotalHours = () => {
        let totalHours = 0;
        let mealsCount = 0;
        const hoursInDay = parseFloat(workingHoursSelect.value) || 8;

        document.querySelectorAll('.special-entry-item').forEach(item => {
            const specifyTimeSwitch = item.querySelector('.specify-time-switch');
            const mealSwitch = item.querySelector('.meal-switch');

            if (mealSwitch && mealSwitch.checked) {
                mealsCount++;
            }

            if (specifyTimeSwitch.checked) {
                const startTimeStr = item.querySelector('.flatpickr-time-start').value;
                const endTimeStr = item.querySelector('.flatpickr-time-end').value;

                if (startTimeStr && endTimeStr) {
                    const start = new Date(`1970-01-01 ${startTimeStr}`);
                    const end = new Date(`1970-01-01 ${endTimeStr}`);
                    if (end > start) {
                        totalHours += (end - start) / (1000 * 60 * 60);
                    }
                }
            } else {
                totalHours += hoursInDay;
            }
        });

        totalHours = totalHours - mealsCount;
        totalHorasSpan.textContent = totalHours.toFixed(2);
        document.getElementById('formTotalH').value = totalHours.toFixed(2);
    };

    const addDayEntry = () => {
        if (document.querySelectorAll('.special-entry-item').length >= MAX_SPECIAL_DAYS) {
            notyf.open({
                type: 'warning',
                message: `Solo puedes añadir un máximo de ${MAX_SPECIAL_DAYS} días.`
            })
            return;
        }
        entryCounter++;

        const entryId = `entry-${Date.now()}`;
        const newEntryHTML = `
            <div class="special-entry-item" id="${entryId}">
                <div class="row g-3 align-items-center">
                    <div class="col-md-4">
                        <label class="form-label fw-bold">Fecha Día #${entryCounter}</label>
                        <input type="text" class="form-control flatpickr-date" placeholder="Seleccionar fecha..." required>
                    </div>
                    <div class="col-lg-5 col-md-12">
                        <div class="day-type-container">
                            <label class="form-label fw-bold">Tipo de Día</label>
                            <div class="form-control form-select-no-arrow">
                                Todo el Día
                            </div>
                            <input type="hidden" class="day-type-select" value="full">
                        </div>
                        <div class="time-range-container" style="display: none;">
                            <label class="form-label fw-bold">Horario Específico</label>
                            <div class="input-group">
                                <input type="text" class="form-control flatpickr-time-start" placeholder="Inicio">
                                <span class="input-group-text">-</span>
                                <input type="text" class="form-control flatpickr-time-end" placeholder="Fin">
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 entry-controls d-flex align-items-center justify-content-end gap-2">
                        <div class="d-flex flex-column align-items-center gap-1" title="Especificar horario">
                            <i class="fas fa-clock"></i>
                            <div class="form-check form-switch m-0">
                                <input class="form-check-input specify-time-switch" type="checkbox" role="switch" style="transform: scale(1.3);">
                            </div>
                        </div>
                        
                        <div class="d-flex flex-column align-items-center gap-1" title="Comida">
                            <i class="fas fa-utensils"></i>
                            <div class="form-check form-switch m-0">
                                <input class="form-check-input meal-switch" type="checkbox" role="switch" style="transform: scale(1.3);">
                            </div>
                        </div>

                        <button type="button" class="btn btn-outline-danger btn-sm btn-remove-day" title="Eliminar día">
                            <i class="fas fa-trash"></i>
                        </button>
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
            locale: "es"
        });

        const timePickerOptions = {
            enableTime: true,
            noCalendar: true,
            dateFormat: "h:i K",
            time_24hr: false
        };
        flatpickr(newEntryElement.querySelector('.flatpickr-time-start'), timePickerOptions);
        flatpickr(newEntryElement.querySelector('.flatpickr-time-end'), timePickerOptions);

        updateTotalHours();
    };

    container.addEventListener('change', (e) => {
        if (e.target.classList.contains('specify-time-switch')) {
            const parentItem = e.target.closest('.special-entry-item');
            const dayTypeContainer = parentItem.querySelector('.day-type-container');
            const timeRangeContainer = parentItem.querySelector('.time-range-container');
            dayTypeContainer.style.display = e.target.checked ? 'none' : 'block';
            timeRangeContainer.style.display = e.target.checked ? 'block' : 'none';
        }
        if (e.target.classList.contains('specify-time-switch') || e.target.classList.contains('meal-switch')) {
            updateTotalHours();
        }
        updateTotalHours();
    });

    container.addEventListener('click', (e) => {
        const removeButton = e.target.closest('.btn-remove-day');
        if (removeButton) {
            removeButton.closest('.special-entry-item').remove();
            updateTotalHours();
        }
    });

    addDayBtn.addEventListener('click', addDayEntry);
    workingHoursSelect.addEventListener('change', updateTotalHours);

    specialForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const totalHoras = parseFloat(totalHorasSpan.textContent);
        if (totalHoras <= 0) {
            notyf.error('Debes solicitar al menos un rango de horas válido.');
            return;
        }

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

        const data = {
            idSolicitante: document.getElementById('formIdSolicitante').value,
            idCreador: document.getElementById('formIdCreador').value,
            idDepartamento: document.getElementById('formIdDepartamento').value,
            totalH: totalHoras.toFixed(2)
        };

        const workingHoursPerDay = parseFloat(workingHoursSelect.value) || 8;

        const entries = document.querySelectorAll('.special-entry-item');
        entries.forEach((entry, index) => {
            const idx = index + 1;
            data[`fecha${idx}`] = entry.querySelector('.flatpickr-date').value;
            const isSpecificTime = entry.querySelector('.specify-time-switch').checked;

            if (isSpecificTime) {
                const startTimeStr = entry.querySelector('.flatpickr-time-start').value;
                const endTimeStr = entry.querySelector('.flatpickr-time-end').value;

                const convertToDecimalTime = (time12hr) => {
                    const [time, modifier] = time12hr.split(' ');
                    let [hours, minutes] = time.split(':');

                    let hoursNum = parseInt(hours, 10);
                    let minutesNum = parseInt(minutes, 10);

                    if (modifier === 'PM' && hoursNum !== 12) {
                        hoursNum += 12;
                    }
                    if (modifier === 'AM' && hoursNum === 12) {
                        hoursNum = 0;
                    }

                    return hoursNum + (minutesNum / 60);
                };

                const horaIDecimal = convertToDecimalTime(startTimeStr);
                const horaFDecimal = convertToDecimalTime(endTimeStr);

                data[`desc${idx}`] = `De ${startTimeStr} a ${endTimeStr}`;
                data[`horaI${idx}`] = horaIDecimal.toFixed(2);
                data[`horaF${idx}`] = horaFDecimal.toFixed(2);

                let hoursDecimal = horaFDecimal - horaIDecimal;
                const mealSwitch = entry.querySelector('.meal-switch');
                if (mealSwitch && mealSwitch.checked) {
                    hoursDecimal -= 1;
                }
                data[`horasDecimal${idx}`] = hoursDecimal.toFixed(2);
            } else {
                const dayType = entry.querySelector('.day-type-select').value;
                data[`desc${idx}`] = (dayType === 'full') ? 'Todo el día.' : 'Medio día.';

                let hoursDecimal = (dayType === 'full') ? workingHoursPerDay : workingHoursPerDay / 2;
                const mealSwitch = entry.querySelector('.meal-switch');
                if (mealSwitch && mealSwitch.checked) {
                    hoursDecimal -= 1;
                }
                data[`horasDecimal${idx}`] = hoursDecimal.toFixed(2);

                data[`horaI${idx}`] = null;
                data[`horaF${idx}`] = null;
            }
        });

        await postTicketSpecial(data);
    });

    try {
        const idUsuario = sessionStorage.getItem('idUsuario');
        const response = await fetch(`../../assets/php/auth/auth.php?quest=getUserData&idUsuario=${idUsuario}`);
        const userData = await response.json();

        if (response.ok) {
            document.getElementById('formIdSolicitante').value = userData.user.idSolicitante;
            document.getElementById('formIdCreador').value = userData.user.idSolicitante;
            document.getElementById('formIdDepartamento').value = userData.user.idDepartamento;
        } else {
            notyf.error("Error al cargar datos del usuario.");
        }
    } catch (error) {
        notyf.error("Error de conexión al cargar datos.");
    }

    addDayEntry();
});

async function postTicketSpecial(data) {
    try {
        const idUsuario = sessionStorage.getItem('idUsuario');
        const response = await fetch(`../../assets/php/auth/auth.php?quest=getUserData&idUsuario=${idUsuario}`);
        const userData = await response.json();
        data.idEstado = response.ok ? userData.user.nivel : null;
    } catch (error) {
        data.idEstado = null;
    }

    const today = new Date();
    data.fechaSolicitud = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    data.observaciones1 = document.getElementById('observaciones')?.value || null;
    data.observaciones2 = null;
    data.observaciones3 = null;
    data.observaciones4 = null;
    data.idJefe = null;
    data.idGerente = null;
    data.idRH = null;

    for (let i = 1; i <= MAX_SPECIAL_DAYS; i++) {
        if (!data[`fecha${i}`]) data[`fecha${i}`] = null;
        if (!data[`desc${i}`]) data[`desc${i}`] = null;
        if (!data[`horaI${i}`]) data[`horaI${i}`] = null;
        if (!data[`horaF${i}`]) data[`horaF${i}`] = null;
    }

    try {
        data.quest = 'postTicketSpecial';

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