
document.addEventListener('DOMContentLoaded', function () {
    const avatarURL = sessionStorage.getItem('avatar');
    if (avatarURL) {
        const avatarEl = document.getElementById('avatar');
        if (avatarEl) avatarEl.src = avatarURL;
    }

    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    const vacationForm = document.getElementById('vacationForm');
    const addDayBtn = document.getElementById('addDayBtn');
    const vacationEntriesContainer = document.getElementById('vacationEntriesContainer');
    const totalDiasSolicitadosSpan = document.getElementById('totalDiasSolicitados');
    const formTotalD = document.getElementById('formTotalD');
    const messageArea = document.getElementById('message-area');

    let entryCounter = 0;
    const MAX_VACATION_DAYS = 10;

    toggleSidebarBtn.addEventListener('click', function () {
        document.body.classList.toggle('sidebar-collapsed');
    });

    addDayBtn.addEventListener('click', addVacationDayEntry);
    addVacationDayEntry(); // Añadir primer día

    function addVacationDayEntry() {
        if (entryCounter >= MAX_VACATION_DAYS) {
            showMessage(`Solo puedes añadir un máximo de ${MAX_VACATION_DAYS} días.`, 'error');
            return;
        }

        entryCounter++;
        const newEntryDiv = document.createElement('div');
        newEntryDiv.classList.add('date-entry');
        newEntryDiv.dataset.id = entryCounter;

        newEntryDiv.innerHTML = `
            <div class="form-group date-input">
                <label for="fecha${entryCounter}">Fecha Día #${entryCounter}</label>
                <input type="text" id="fecha${entryCounter}" name="fecha${entryCounter}" class="form-control date-picker" required>
            </div>
            <div class="form-group type-select">
                <label for="desc${entryCounter}">Tipo de Día</label>
                <select id="desc${entryCounter}" name="desc${entryCounter}" class="form-control desc" required>
                    <option value="Todo el día">Todo el día</option>
                    <option value="Medio día (por la mañana)">Medio día mañana</option>
                    <option value="Medio día (por la tarde)">Medio día tarde</option>
                </select>
            </div>
            <button type="button" class="btn-remove-day"><i class="fas fa-trash-alt"></i></button>
        `;

        vacationEntriesContainer.appendChild(newEntryDiv);

        newEntryDiv.querySelector('.btn-remove-day').addEventListener('click', function () {
            newEntryDiv.remove();
            updateTotalDays();
            updateEntryLabels();
        });

        newEntryDiv.querySelector('select').addEventListener('change', updateTotalDays);

        const dateInput = newEntryDiv.querySelector('input.date-picker');
        flatpickr(dateInput, {
            dateFormat: "Y-m-d",
            minDate: "today",
            locale: "es"
        });

        dateInput.addEventListener('change', updateTotalDays);
        updateTotalDays();
        updateEntryLabels();
    }

    function updateEntryLabels() {
        const entries = vacationEntriesContainer.querySelectorAll('.date-entry');
        entries.forEach((entryDiv, index) => {
            const newIndex = index + 1;
            entryDiv.dataset.id = newIndex;

            const dateInput = entryDiv.querySelector('input.date-picker');
            const dateLabel = entryDiv.querySelector('label[for^="fecha"]');
            dateInput.id = `fecha${newIndex}`;
            dateInput.name = `fecha${newIndex}`;
            dateLabel.htmlFor = `fecha${newIndex}`;
            dateLabel.textContent = `Fecha Día #${newIndex}`;

            const descSelect = entryDiv.querySelector('select');
            const descLabel = entryDiv.querySelector('label[for^="desc"]');
            descSelect.id = `desc${newIndex}`;
            descSelect.name = `desc${newIndex}`;
            descLabel.htmlFor = `desc${newIndex}`;
        });
        entryCounter = entries.length;
    }

    function updateTotalDays() {
        let total = 0;
        vacationEntriesContainer.querySelectorAll('.date-entry').forEach(entry => {
            const selectElement = entry.querySelector('select');
            if (selectElement.value === "Todo el día") total += 1;
            else if (selectElement.value.includes("Medio día")) total += 0.5;
        });
        totalDiasSolicitadosSpan.textContent = total.toFixed(2);
        formTotalD.value = total;
    }

    function showMessage(message, type) {
        messageArea.textContent = message;
        messageArea.className = `message-area ${type} show`;
        setTimeout(() => messageArea.classList.remove('show'), 5000);
    }

    // CAPTURAR ENVÍO DEL FORMULARIO
    vacationForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(vacationForm);
        const data = {};

        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Agregar campos dinámicos de fechas y tipos
        const entries = vacationEntriesContainer.querySelectorAll('.date-entry');
        entries.forEach((entry, index) => {
            const idx = index + 1;
            const fecha = entry.querySelector(`input[name="fecha${idx}"]`)?.value;
            const desc = entry.querySelector(`select[name="desc${idx}"]`)?.value;
            if (fecha && desc) {
                data[`fecha${idx}`] = fecha;
                data[`desc${idx}`] = desc;
            }
        });

        if (!data.totalD || parseFloat(data.totalD) <= 0) {
            showMessage('Debes agregar al menos un día válido para enviar la solicitud.', 'error');
            return;
        }

        await postTicketVacations(data);
    });
});

// ENVÍO AL BACKEND
async function postTicketVacations(data) {
    const allowedDescs = [
        "Todo el día",
        "Medio día (por la mañana)",
        "Medio día (por la tarde)"
    ];

    for (let i = 1; i <= 10; i++) {
        const desc = data[`desc${i}`];
        if (desc && !allowedDescs.includes(desc)) {
            const messageArea = document.getElementById('message-area');
            if (messageArea) {
                messageArea.textContent = `desc${i} tiene un valor inválido: "${desc}". Solo se permite: ${allowedDescs.join(', ')}`;
                messageArea.className = 'message-area error show';
                setTimeout(() => messageArea.classList.remove('show'), 5000);
            }
            return;
        }
    }
        console.log("Datos enviados al backend:", data);

    try {
        data.quest = 'postTicketVacations';

        const response = await fetch('../../assets/php/tickets/tickets.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        const messageArea = document.getElementById('message-area');
        if (!response.ok) {
            if (messageArea) {
                messageArea.textContent = result.error || 'Error al crear la boleta';
                messageArea.className = 'message-area error show';
                setTimeout(() => messageArea.classList.remove('show'), 5000);
            }
            return;
        }
        if (messageArea) {
            messageArea.textContent = result.success || 'Boleta creada correctamente';
            messageArea.className = 'message-area success show';
            setTimeout(() => messageArea.classList.remove('show'), 5000);
        }
        return result;
    } catch (error) {
        const messageArea = document.getElementById('message-area');
        if (messageArea) {
            messageArea.textContent = error.message;
            messageArea.className = 'message-area error show';
            setTimeout(() => messageArea.classList.remove('show'), 5000);
        }
    }
}
