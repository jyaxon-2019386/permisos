export const notyf = new Notyf({
    duration: 2000,
    position: { x: 'right', y: 'top' },
    types: [
        {
            type: 'success',
            background: '#4CAF50',
            icon: { className: 'fas fa-circle-check', tagName: 'i', color: '#fff' }
        },
        {
            type: 'error',
            background: '#FF5252',
            icon: { className: 'fas fa-times-circle', tagName: 'i', color: '#fff' }
        },
        {
            type: 'warning',
            background: '#FFC107',
            icon: { className: 'fas fa-circle-exclamation', tagName: 'i', color: '#fff' }
        }
    ]
});
