import { notyf } from "../../../plugins/notify.js";

document.addEventListener('DOMContentLoaded', async function () {
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

    let entryCounter = 0;
    const MAX_VACATION_DAYS = 10;

    toggleSidebarBtn.addEventListener('click', function () {
        document.body.classList.toggle('sidebar-collapsed');
    });

    addDayBtn.addEventListener('click', addVacationDayEntry);
    addVacationDayEntry(); // Añadir primer día

    function addVacationDayEntry() {
        if (entryCounter >= MAX_VACATION_DAYS) {
            notyf.error(`Solo puedes añadir un máximo de ${MAX_VACATION_DAYS} días.`, 'error');
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
                    <option value="Todo el día.">Todo el día.</option>
                    <option value="Medio día (por la mañana).">Medio día (por la mañana).</option>
                    <option value="Medio día (por la tarde).">Medio día (por la tarde).</option>
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
            altInput: true,
            altFormat: "j F, Y",
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
            if (selectElement.value === "Todo el día.") total += 1;
            else if (selectElement.value.includes("Medio día")) total += 0.5;
        });
        totalDiasSolicitadosSpan.textContent = total.toFixed(2);
        formTotalD.value = total;
    }

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
            notyf.error('Debes agregar al menos un día válido para enviar la solicitud.', 'error');
            return;
        }

        await postTicketVacations(data);
    });

    const idUsuario = sessionStorage.getItem('idUsuario');
    try {
        const response = await fetch(`../../assets/php/auth/auth.php?quest=getUserData&idUsuario=${idUsuario}`);
        const data = await response.json();

        if (response.ok) {
            document.getElementById('formIdSolicitante').value = data.user.idSolicitante;
            document.getElementById('formIdCreador').value = data.user.idSolicitante;
            document.getElementById('formIdDepartamento').value = data.user.idDepartamento;
            document.getElementById('diasDisponibles').textContent = data.user.vacaciones;
        } else {
            console.error("Error al obtener los datos del usuario:", data.error);
        }
    } catch (error) {
        console.error("Error al realizar la solicitud:", error);
    }


});


async function postTicketVacations(data) {
    // Obtener nivel del usuario desde el endpoint
    try {
        const idUsuario = sessionStorage.getItem('idUsuario');
        const response = await fetch(`../../assets/php/auth/auth.php?quest=getUserData&idUsuario=${idUsuario}`);
        const userData = await response.json();

        if (response.ok) {
            data.idEstado = userData.user.nivel;
        } else {
            console.error("Error al obtener el nivel del usuario:", userData.error);
            data.idEstado = null;
        }
    } catch (error) {
        console.error("Error al realizar la solicitud para obtener el nivel del usuario:", error);
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

    for (const key in data) {
        if (data[key] === "" || data[key] === undefined) {
            data[key] = null;
        }
    }

    for (let i = 1; i <= 10; i++) {
        if (!data[`fecha${i}`]) {
            data[`fecha${i}`] = null;
        }
        if (!data[`desc${i}`]) {
            data[`desc${i}`] = null;
        }
    }

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

        if (!response.ok) {
            // Mostrar mensaje de error con notyf
            notyf.error(result.detalle || result.error || 'Error al crear la boleta');
        } else {
            // Mostrar mensaje de éxito con notyf
            notyf.success(result.success || 'Boleta creada correctamente');
            // Redireccionar a la página de boletas
            setTimeout(() => {
                window.location.href = '../../pages/ticket/new-ticket.html';
            }, 2000);
        } 

        return result;

    } catch (error) {
        // Mostrar mensaje de error de conexión con notyf
        notyf.error('Error de conexión: ' + error.message);
    }
}


function logout() {
    sessionStorage.clear('usuario');
    sessionStorage.clear('avatar');
    sessionStorage.clear('id_usuario');
    window.location.href = '../../pages/authentication/signin/login.html';
}

window.logout = logout;
