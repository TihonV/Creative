// --- Глобальные переменные ---
let gameState = {
    xp: 20,
    level: 5,
    gold: 70000,
    diamonds: 2150,
    green: 0
};

// --- Функция показа экрана ---
function showScreen(screenId) {
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    // Показываем нужный
    document.getElementById(screenId).classList.add('active');
}

// --- Обработчик клика по стартовому экрану ---
document.getElementById('start-screen').addEventListener('click', () => {
    showScreen('main-menu');
});

// --- Инициализация при загрузке ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("🎮 FC Web 25 запущена!");
    // Устанавливаем начальный экран
    showScreen('start-screen');
});

// --- Обработчики кнопок ---
document.querySelectorAll('.menu-button').forEach(button => {
    button.addEventListener('click', () => {
        alert(`${button.textContent} пока недоступен.`);
    });
});

document.querySelector('.play-button').addEventListener('click', () => {
    alert('Игра начата!');
});

document.querySelector('.squad-block').addEventListener('click', () => {
    alert('Открывается экран "МОЯ КОМАНДА".');
});

// --- Обработчики кнопок в ивентах ---
document.querySelectorAll('#events-screen .skin-card button').forEach(button => {
    button.addEventListener('click', () => {
        alert('Скин получен! 🎉');
        // Увеличиваем валюту
        gameState.diamonds += 500;
        updateCurrencyDisplay();
        showNotification("Награда за скин!");
    });
});

document.querySelectorAll('#events-screen .quest-item button').forEach(button => {
    button.addEventListener('click', () => {
        alert('Задание выполнено! 🏆');
        // Увеличиваем XP
        gameState.xp += 20;
        if (gameState.xp >= 120) {
            gameState.level++;
            gameState.xp = 0;
        }
        updateCurrencyDisplay();
        showNotification("Задание выполнено!");
    });
});

// --- Обновление отображения валюты ---
function updateCurrencyDisplay() {
    document.querySelector('.xp').textContent = `${gameState.xp}/120XP`;
    document.querySelector('.level').textContent = gameState.level;
    document.querySelector('.currency.gold').textContent = gameState.gold;
    document.querySelector('.currency.diamond').textContent = gameState.diamonds;
    document.querySelector('.currency.green').textContent = gameState.green;
}

// --- Уведомления ---
function showNotification(message) {
    const notification = document.querySelector('.notification');
    notification.textContent = message;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// --- Сохранение данных в localStorage ---
function saveGame() {
    localStorage.setItem('fcGameState', JSON.stringify(gameState));
}

// --- Загрузка данных из localStorage ---
function loadGame() {
    const saved = localStorage.getItem('fcGameState');
    if (saved) {
        gameState = JSON.parse(saved);
        updateCurrencyDisplay();
    }
}

// --- Загрузка при запуске ---
loadGame();
