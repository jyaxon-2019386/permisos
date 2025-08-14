import { notyf } from '../../../plugins/notify.js';

const MAX_ENTRIES = 5;

document.addEventListener('DOMContentLoaded', () => {

    const avatarURL = sessionStorage.getItem('avatar');
    if (avatarURL) {
        const avatarEl = document.getElementById('avatar');
        if (avatarEl) avatarEl.src = avatarURL;
    }

    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', () => document.body.classList.toggle('sidebar-collapsed'));
    }

    // --- 1. ELEMENT SELECTORS --- //
    const absenceContainer = document.getElementById('absenceEntriesContainer');
    const replacementContainer = document.getElementById('replacementEntriesContainer');
    const addAbsenceBtn = document.getElementById('addAbsenceDayBtn');
    const workingHoursSelect = document.getElementById('workingHoursSelect');
    const addReplacementBtn = document.getElementById('addReplacementDayBtn');
    const totalAbsenceEl = document.getElementById('totalAbsenceHours');
    const totalReplacementEl = document.getElementById('totalReplacementHours');
    const form = document.getElementById('absenceAndReplacementForm');
    const submitBtn = document.getElementById('submitBtn');

    let entryCounter = 0;
    flatpickr.localize(flatpickr.l10ns.es);

    // --- 2. CORE FUNCTIONS --- //

    const createDayEntryHTML = (type) => {
        const entryId = `${type}-entry-${Date.now()}`;
        const hoursInDay = workingHoursSelect.value;
        return `
            <div class="special-entry-item card p-3 mb-3" id="${entryId}">
                <div class="row g-3 align-items-center">
                    <div class="col-lg-4 col-md-12">
                        <label class="form-label fw-bold">Fecha</label>
                        <input type="text" class="form-control flatpickr-date" placeholder="Seleccionar fecha..." required>
                    </div>
                    <div class="col-lg-5 col-md-12">
                        <label class="form-label fw-bold">Tipo de Día</label>
                        <div class="day-type-container">
                            <div class="form-control day-type-label">Día Completo (${hoursInDay}h)</div>
                            <input type="hidden" class="day-type-select" value="full">
                        </div>
                        <div class="time-range-container" style="display: none;">
                            <div class="input-group">
                                <input type="text" class="form-control flatpickr-time-start" placeholder="Inicio">
                                <span class="input-group-text">-</span>
                                <input type="text" class="form-control flatpickr-time-end" placeholder="Fin">
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-12">
                        <div class="d-flex align-items-center justify-content-end h-100 gap-2">
                            <div class="d-flex flex-column align-items-center" title="Horario Específico">
                                <i class="fas fa-clock mb-1"></i>
                                <div class="form-check form-switch m-0">
                                    <input class="form-check-input specify-time-switch" type="checkbox" role="switch">
                                </div>
                            </div>
                            <div class="d-flex flex-column align-items-center" title="Descontar comida (1h)">
                                <i class="fas fa-utensils mb-1"></i>
                                <div class="form-check form-switch m-0">
                                    <input class="form-check-input meal-switch" type="checkbox" role="switch">
                                </div>
                            </div>
                            <button type="button" class="btn btn-outline-danger btn-sm btn-remove-day" title="Eliminar día">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="row mt-4">
                    <div class="col-12">
                        <label class="form-label">Descripción (opcional)</label>
                        <input type="text" class="form-control entry-description" placeholder="Ej: Cita médica, cita personal, etc.">
                    </div>
                </div>
            </div>
        `;
    };

    const initializeEntry = (entryElement) => {
        flatpickr(entryElement.querySelector('.flatpickr-date'), {
            altInput: true,
            altFormat: "j F, Y",
            dateFormat: "Y-m-d",
            locale: "es",
            onChange: updateTotalHours
        });

        const timePickerOptions = {
            enableTime: true,
            noCalendar: true,
            dateFormat: "h:i:K",
            time_24hr: false,
            onChange: updateTotalHours
        };
        flatpickr(entryElement.querySelector('.flatpickr-time-start'), timePickerOptions);
        flatpickr(entryElement.querySelector('.flatpickr-time-end'), timePickerOptions);

        const specifyTimeSwitch = entryElement.querySelector('.specify-time-switch');
        const dayTypeContainer = entryElement.querySelector('.day-type-container');
        const timeRangeContainer = entryElement.querySelector('.time-range-container');
        
        specifyTimeSwitch.addEventListener('change', (e) => {
            if (e.target.checked) {
                dayTypeContainer.style.display = 'none';
                timeRangeContainer.style.display = 'block';
            } else {
                dayTypeContainer.style.display = 'block';
                timeRangeContainer.style.display = 'none';
            }
            updateTotalHours();
        });

        entryElement.querySelector('.meal-switch').addEventListener('change', updateTotalHours);
        entryElement.querySelector('.btn-remove-day').addEventListener('click', () => {
            entryElement.remove();
            updateTotalHours();
        });
        
        entryElement.querySelector('.entry-description').addEventListener('input', updateTotalHours);

        updateTotalHours();
    };

    const addEntry = (container, type) => {
        const entryCount = container.querySelectorAll('.special-entry-item').length;
        if (entryCount >= MAX_ENTRIES) {
            notyf.error(`Solo puedes añadir un máximo de ${MAX_ENTRIES} entradas por sección.`);
            return;
        }

        const newEntryHTML = createDayEntryHTML(type);
        container.insertAdjacentHTML('beforeend', newEntryHTML);
        const newEntryElement = container.lastElementChild;
        initializeEntry(newEntryElement);
    };

    const updateTotalHours = () => {
        const workingHoursPerDay = parseFloat(workingHoursSelect.value) || 8; 

        let totalAbsence = calculateSectionTotal(absenceContainer, workingHoursPerDay);
        let totalReplacement = calculateSectionTotal(replacementContainer, workingHoursPerDay);

        const absenceLabels = absenceContainer.querySelectorAll('.day-type-label');
        absenceLabels.forEach(label => label.textContent = `Día Completo (${workingHoursPerDay}h)`);
        
        const replacementLabels = replacementContainer.querySelectorAll('.day-type-label');
        replacementLabels.forEach(label => label.textContent = `Día Completo (${workingHoursPerDay}h)`);

        totalAbsenceEl.textContent = totalAbsence.toFixed(2);
        totalReplacementEl.textContent = totalReplacement.toFixed(2);
    };

    const calculateSectionTotal = (container, workingHoursPerDay) => {
        let sectionTotal = 0;
        const entries = container.querySelectorAll('.special-entry-item');

        entries.forEach(entry => {
            const specifyTimeSwitch = entry.querySelector('.specify-time-switch');
            const mealSwitch = entry.querySelector('.meal-switch');
            const dateInput = entry.querySelector('.flatpickr-date');
            
            if (!dateInput.value) return;

            if (specifyTimeSwitch.checked) {
                const startTimeStr = entry.querySelector('.flatpickr-time-start').value;
                const endTimeStr = entry.querySelector('.flatpickr-time-end').value;

                if (startTimeStr && endTimeStr) {
                    const start_date = flatpickr.parseDate(startTimeStr, "h:i:K");
                    const end_date = flatpickr.parseDate(endTimeStr, "h:i:K");

                    if (end_date && start_date) {
                        let diff = (end_date.getTime() - start_date.getTime()) / (1000 * 60 * 60);
                        if (diff < 0) {
                            diff += 24; // Handle cases where end time is on the next day
                        }
                        if (mealSwitch.checked) {
                            diff -= 1;
                        }
                        sectionTotal += diff;
                    }
                }
            } else {
                let hours = workingHoursPerDay;
                if (mealSwitch.checked) {
                    hours -= 1;
                }
                sectionTotal += hours;
            }
        });
        return sectionTotal;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const workingHoursPerDay = parseFloat(workingHoursSelect.value) || 8;
        const totalAbsence = calculateSectionTotal(absenceContainer, workingHoursPerDay);
        const totalReplacement = calculateSectionTotal(replacementContainer, workingHoursPerDay);

        if (totalAbsence <= 0) {
            notyf.error('Debes solicitar al menos un rango de horas válido.');
            return;
        }
        
        if (totalReplacement <= 0) {
            notyf.error('Debes reponer al menos un rango de horas válido.');
            return;
        }

        const absenceEntries = absenceContainer.querySelectorAll('.special-entry-item');
        const replacementEntries = replacementContainer.querySelectorAll('.special-entry-item');
        
        let allDatesFilled = true;
        absenceEntries.forEach(entry => {
            if (!entry.querySelector('.flatpickr-date').value) {
                allDatesFilled = false;
            }
        });
        replacementEntries.forEach(entry => {
            if (!entry.querySelector('.flatpickr-date').value) {
                allDatesFilled = false;
            }
        });

        if (!allDatesFilled) {
            notyf.error('Por favor, selecciona una fecha para cada día solicitado y a reponer.');
            return;
        }

        submitBtn.disabled = true;

        const formData = {
            totalH: totalAbsence.toFixed(2),
            totalHR: totalReplacement.toFixed(2),
            observaciones1: document.getElementById('observaciones')?.value || null,
            idSolicitante: sessionStorage.getItem('idUsuario'),
            idCreador: sessionStorage.getItem('idUsuario'),
            idDepartamento: sessionStorage.getItem('idDepartamento'),
            idGerente: sessionStorage.getItem('idGerente') || null,
            idRH: sessionStorage.getItem('idRH') || null,
            idEstado: null
        };

        const convertTimeToDecimal = (timeStr) => {
            if (!timeStr) return null;
            const date = flatpickr.parseDate(timeStr, "h:i:K");
            if (!date) return null;
            return (date.getHours() + date.getMinutes() / 60).toFixed(2);
        };

        for (let i = 1; i <= MAX_ENTRIES; i++) {
            const absenceEntry = absenceEntries[i - 1];
            const replacementEntry = replacementEntries[i - 1];

            if (absenceEntry) {
                const isSpecificTime = absenceEntry.querySelector('.specify-time-switch').checked;
                const mealSwitch = absenceEntry.querySelector('.meal-switch');
                const description = absenceEntry.querySelector('.entry-description').value || null;
                
                formData[`fecha${i}`] = absenceEntry.querySelector('.flatpickr-date').value;
                formData[`desc${i}A`] = description;

                if (isSpecificTime) {
                    let startTimeStr = absenceEntry.querySelector('.flatpickr-time-start').value;
                    let endTimeStr = absenceEntry.querySelector('.flatpickr-time-end').value;
                    formData[`horaI${i}`] = convertTimeToDecimal(startTimeStr);
                    formData[`horaF${i}`] = convertTimeToDecimal(endTimeStr);
                } else {
                    let hours = workingHoursPerDay;
                    if (mealSwitch.checked) {
                        hours -= 1;
                    }
                    formData[`horaI${i}`] = 8.00;
                    formData[`horaF${i}`] = 8.00 + hours;
                }
            } else {
                formData[`fecha${i}`] = null;
                formData[`horaI${i}`] = null;
                formData[`horaF${i}`] = null;
                formData[`desc${i}A`] = null;
            }

            if (replacementEntry) {
                const isSpecificTime = replacementEntry.querySelector('.specify-time-switch').checked;
                const mealSwitch = replacementEntry.querySelector('.meal-switch');
                const description = replacementEntry.querySelector('.entry-description').value || null;

                formData[`fecha${i}R`] = replacementEntry.querySelector('.flatpickr-date').value;
                formData[`desc${i}R`] = description;
                
                if (isSpecificTime) {
                    let startTimeStr = replacementEntry.querySelector('.flatpickr-time-start').value;
                    let endTimeStr = replacementEntry.querySelector('.flatpickr-time-end').value;
                    formData[`horaI${i}R`] = convertTimeToDecimal(startTimeStr);
                    formData[`horaF${i}R`] = convertTimeToDecimal(endTimeStr);
                } else {
                    let hours = workingHoursPerDay;
                    if (mealSwitch.checked) {
                        hours -= 1;
                    }
                    formData[`horaI${i}R`] = 8.00;
                    formData[`horaF${i}R`] = 8.00 + hours;
                }
            } else {
                formData[`fecha${i}R`] = null;
                formData[`horaI${i}R`] = null;
                formData[`horaF${i}R`] = null; 
                formData[`desc${i}R`] = null;
            }
        }
        
        await postTicketTime(formData);

        submitBtn.disabled = false;
    };

    // --- 3. EVENT LISTENERS --- //
    addAbsenceBtn.addEventListener('click', () => addEntry(absenceContainer, 'absence'));
    addReplacementBtn.addEventListener('click', () => addEntry(replacementContainer, 'replacement'));
    form.addEventListener('submit', handleSubmit);

    workingHoursSelect.addEventListener('change', () => {
        updateTotalHours();
        // Update the 'Día Completo' label on all existing entries
        const allLabels = document.querySelectorAll('.day-type-label');
        allLabels.forEach(label => {
            const workingHours = workingHoursSelect.value;
            label.textContent = `Día Completo (${workingHours}h)`;
        });
    }); 

    addEntry(absenceContainer, 'absence');
    addEntry(replacementContainer, 'replacement');

    updateTotalHours();
});

async function postTicketTime(data) {
    try {
        const idUsuario = sessionStorage.getItem('idUsuario');
        const response = await fetch(`../../assets/php/auth/auth.php?quest=getUserData&idUsuario=${idUsuario}`);
        
        if (response.ok) {
            const userData = await response.json();
            data.idEstado = userData.user.nivel;
            data.idJefe = userData.user.idJefe || null;
            data.idGerente = userData.user.idGerente || null;
            data.idRH = userData.user.idRH || null;
            data.idSolicitante = idUsuario;
            data.idCreador = idUsuario;
            data.idDepartamento = userData.user.idDepartamento;
        } else {
            notyf.error('No se pudo obtener la información de usuario.');
            return;
        }
    } catch (error) {
        notyf.error('Error de conexión al obtener datos de usuario: ' + error.message);
        return;
    }

    const today = new Date();
    data.fechaSolicitud = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    for (let i = 1; i <= MAX_ENTRIES; i++) {
        if (!data[`fecha${i}`]) data[`fecha${i}`] = null;
        if (!data[`horaI${i}`]) data[`horaI${i}`] = null;
        if (!data[`horaF${i}`]) data[`horaF${i}`] = null;
        if (!data[`desc${i}A`]) data[`desc${i}A`] = null;
        if (!data[`fecha${i}R`]) data[`fecha${i}R`] = null;
        if (!data[`horaI${i}R`]) data[`horaI${i}R`] = null;
        if (!data[`horaF${i}R`]) data[`horaF${i}R`] = null;
        if (!data[`desc${i}R`]) data[`desc${i}R`] = null;
    }
    
    try {
        data.quest = 'postTicketTime';

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