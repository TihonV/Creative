// --- Функция показа экрана (не используется, так как мы используем переходы через href) ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// --- Обработчик клика по стартовому экрану ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('start-screen')) {
        document.getElementById('start-screen').addEventListener('click', () => {
            showScreen('main-menu');
        });
    }
});

// --- Уведомления ---
function showNotification(message) {
    const notification = document.querySelector('.notification');
    if (notification) {
        notification.textContent = message;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}
