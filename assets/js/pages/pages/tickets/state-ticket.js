// --- FUNCIONES UTILITARIAS ---
function getEstado(idEstado) {
    const estados = {
        1: { texto: 'Esperando Nivel 1', clase: 'bg-estado-pendiente' },
        2: { texto: 'Esperando Nivel 2', clase: 'bg-estado-pendiente' },
        3: { texto: 'Esperando Nivel 3', clase: 'bg-estado-pendiente' },
        4: { texto: 'Autorizado', clase: 'bg-estado-autorizado' },
        5: { texto: 'Denegado Nivel 1', clase: 'bg-estado-denegado' },
        6: { texto: 'Denegado Nivel 2', clase: 'bg-estado-denegado' },
        7: { texto: 'Denegado Nivel 3', clase: 'bg-estado-denegado' },
        8: { texto: 'Esperando GG', clase: 'bg-estado-pendiente' },
        9: { texto: 'Autorizado por GG', clase: 'bg-estado-autorizado' },
        10: { texto: 'Rechazado por GG', clase: 'bg-estado-denegado' },
        11: { texto: 'Confirmado Recepción', clase: 'bg-estado-autorizado' },
        12: { texto: 'Revisado por RRHH', clase: 'bg-estado-otro' },
        13: { texto: 'No Repuso Tiempo', clase: 'bg-estado-denegado' },
        14: { texto: 'Anulado', clase: 'bg-estado-anulado' },
        15: { texto: 'Denegado por Sistema', clase: 'bg-estado-denegado' },
    };
    return estados[idEstado] || { texto: 'Desconocido', clase: 'bg-estado-anulado' };
}

// Utilidad: Obtener clase de estado por texto
function getEstadoPorTexto(texto) {
    const estados = {
        'Esperando Nivel 1': { clase: 'bg-estado-pendiente' },
        'Esperando Nivel 2': { clase: 'bg-estado-pendiente' },
        'Esperando Nivel 3': { clase: 'bg-estado-pendiente' },
        'Autorizado': { clase: 'bg-estado-autorizado' },
        'Denegado Nivel 1': { clase: 'bg-estado-denegado' },
        'Denegado Nivel 2': { clase: 'bg-estado-denegado' },
        'Denegado Nivel 3': { clase: 'bg-estado-denegado' },
        'Esperando GG': { clase: 'bg-estado-pendiente' },
        'Autorizado por GG': { clase: 'bg-estado-autorizado' },
        'Rechazado por GG': { clase: 'bg-estado-denegado' },
        'Confirmado Recepción': { clase: 'bg-estado-autorizado' },
        'Revisado por RRHH': { clase: 'bg-estado-otro' },
        'No Repuso Tiempo': { clase: 'bg-estado-denegado' },
        'Anulado': { clase: 'bg-estado-anulado' },
        'Denegado por Sistema': { clase: 'bg-estado-denegado' }
    };
    return estados[texto] || { clase: 'bg-estado-anulado' };
}

window.getEstado = getEstado;
window.getEstadoPorTexto = getEstadoPorTexto;