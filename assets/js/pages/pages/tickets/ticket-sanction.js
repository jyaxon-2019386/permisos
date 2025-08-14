import { notyf } from "../../../plugins/notify.js";

document.addEventListener("DOMContentLoaded", async function () {
    // Avatar
    const avatarURL = sessionStorage.getItem("avatar");
    if (avatarURL) {
        const avatarEl = document.getElementById("avatar");
        if (avatarEl) avatarEl.src = avatarURL;
    }

    // Elementos del DOM
    const toggleSidebarBtn = document.getElementById("toggleSidebar");
    const sanctionForm = document.getElementById("sanctionForm");
    const addDayBtn = document.getElementById("addDayBtn");
    const sanctionEntriesContainer = document.getElementById("sanctionEntriesContainer");
    const totalDiasSolicitadosSpan = document.getElementById("totalDiasSolicitados");
    const formTotalD = document.getElementById("formTotalD");

    let entryCounter = 0;
    const MAX_DAYS = 10;

    // Sidebar toggle
    toggleSidebarBtn.addEventListener("click", function () {
        document.body.classList.toggle("sidebar-collapsed");
    });

    // Botón para añadir días
    addDayBtn.addEventListener("click", addSanctionDayEntry);
    addSanctionDayEntry(); // Primer día por defecto

    function addSanctionDayEntry() {
        if (entryCounter >= MAX_DAYS) {
            notyf.open({
                type: "warning",
                message: `Solo puedes añadir un máximo de ${MAX_DAYS} días.`,
            });
            return;
        }
        entryCounter++;

        const newEntryDiv = document.createElement("div");
        newEntryDiv.classList.add("date-entry");
        newEntryDiv.dataset.id = entryCounter;

        newEntryDiv.innerHTML = `
            <div class="form-group date-input">
                <label for="fecha${entryCounter}">Fecha Día #${entryCounter}</label>
                <input type="text" id="fecha${entryCounter}" name="fecha${entryCounter}" class="form-control date-picker" required>
            </div>
            <button type="button" class="btn-remove-day"><i class="fas fa-trash-alt"></i></button>
        `;

        sanctionEntriesContainer.appendChild(newEntryDiv);

        // Eliminar entrada
        newEntryDiv.querySelector(".btn-remove-day").addEventListener("click", function () {
            newEntryDiv.remove();
            updateEntryLabels();
            updateTotalDays();
        });

        // Inicializar calendario
        const dateInput = newEntryDiv.querySelector("input.date-picker");
        flatpickr(dateInput, {
            altInput: true,
            altFormat: "j F, Y",
            dateFormat: "Y-m-d",
            minDate: "today",
            locale: "es",
        });

        dateInput.addEventListener("change", updateTotalDays);
        updateTotalDays();
        updateEntryLabels();
    }

    function updateEntryLabels() {
        const entries = sanctionEntriesContainer.querySelectorAll(".date-entry");
        entries.forEach((entryDiv, index) => {
            const newIndex = index + 1;
            entryDiv.dataset.id = newIndex;

            const dateInput = entryDiv.querySelector("input.date-picker");
            const dateLabel = entryDiv.querySelector('label[for^="fecha"]');
            dateInput.id = `fecha${newIndex}`;
            dateInput.name = `fecha${newIndex}`;
            dateLabel.htmlFor = `fecha${newIndex}`;
            dateLabel.textContent = `Fecha Día #${newIndex}`;
        });
        entryCounter = entries.length;
    }

    function updateTotalDays() {
        // Cada día cuenta como 1
        const total = sanctionEntriesContainer.querySelectorAll(".date-entry").length;
        totalDiasSolicitadosSpan.textContent = total;
        formTotalD.value = total;
    }

    // Enviar formulario
    sanctionForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = new FormData(sanctionForm);
        const data = {};

        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Agregar días dinámicos
        const entries = sanctionEntriesContainer.querySelectorAll(".date-entry");
        let fechasValidas = true;

        entries.forEach((entry, index) => {
            const dateInput = entry.querySelector("input.date-picker");
            if (!dateInput.value || dateInput.value.trim() === "") {
                fechasValidas = false;
            }
        });

        if (!fechasValidas) {
            notyf.error("Debes ingresar todas las fechas de los días agregados.");
            return;
        }


        // Validación de días
        if (!data.totalD || parseFloat(data.totalD) <= 0) {
            notyf.error("Debes agregar al menos un día válido para enviar la solicitud.");
            return;
        }
        
        const tipoSeleccionado = document.querySelector('input[name="tipoSancion"]:checked')?.value || null;

        if (!tipoSeleccionado) {
            notyf.error("Debes seleccionar un tipo de sanción.");
            return;
        }

        data.tipo = tipoSeleccionado; // string simple


        await postTicketSanction(data);
    });

    // Cargar datos del usuario
    const idUsuario = sessionStorage.getItem("idUsuario");
    try {
        const response = await fetch(`../../assets/php/auth/auth.php?quest=getUserData&idUsuario=${idUsuario}`);
        const data = await response.json();

        if (response.ok) {
            document.getElementById("formIdSolicitante").value = data.user.idSolicitante;
            document.getElementById("formIdCreador").value = data.user.idSolicitante;
            document.getElementById("formIdDepartamento").value = data.user.idDepartamento;
        } else {
            console.error("Error al obtener los datos del usuario:", data.error);
        }
    } catch (error) {
        console.error("Error al realizar la solicitud:", error);
    }
});

// Guardar boleta de sanción
async function postTicketSanction(data) {
    try {
        const idUsuario = sessionStorage.getItem("idUsuario");
        const response = await fetch(`../../assets/php/auth/auth.php?quest=getUserData&idUsuario=${idUsuario}`);
        const userData = await response.json();

        if (response.ok) {
            data.idEstado = userData.user.nivel;
        } else {
            console.error("Error al obtener el nivel del usuario:", userData.error);
            data.idEstado = null;
        }
    } catch (error) {
        console.error("Error al obtener nivel:", error);
        data.idEstado = null;
    }

    const today = new Date();
    data.fechaSolicitud = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    data.observaciones1 = document.getElementById("observaciones")?.value || null;

    // Normalizar datos vacíos
    for (const key in data) {
        if (data[key] === "" || data[key] === undefined) {
            data[key] = null;
        }
    }

    for (let i = 1; i <= 10; i++) {
        if (!data[`fecha${i}`]) data[`fecha${i}`] = null;
    }

    try {
        data.quest = "postTicketSanction"; // endpoint adaptado

        const response = await fetch("../../assets/php/tickets/tickets.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            notyf.error(result.detalle || result.error || "Error al crear la boleta");
        } else {
            notyf.success(result.success || "Boleta creada correctamente");
            setTimeout(() => {
                window.location.href = "../../pages/ticket/new-ticket.html";
            }, 2000);
        }
        return result;
    } catch (error) {
        notyf.error("Error de conexión: " + error.message);
    }
}

// Logout
function logout() {
    sessionStorage.clear();
    window.location.href = "../../pages/authentication/signin/login.html";
}
window.logout = logout;
