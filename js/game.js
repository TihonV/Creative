// --- Глобальные переменные ---
let gameState = {
    xp: 20,
    level: 5,
    gold: 70000,
    diamonds: 2150,
    green: 0,
    quests: [
        { name: "Забей пенальти", completed: false },
        { name: "Выиграй 3 матча", completed: false }
    ]
};

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
        updateQuestsDisplay();
    }
}

// --- Обновление отображения валюты ---
function updateCurrencyDisplay() {
    const xpElement = document.querySelector('.xp');
    const levelElement = document.querySelector('.level');
    const goldElement = document.querySelector('.currency.gold');
    const diamondElement = document.querySelector('.currency.diamond');
    const greenElement = document.querySelector('.currency.green');

    if (xpElement) xpElement.textContent = `${gameState.xp}/120XP`;
    if (levelElement) levelElement.textContent = gameState.level;
    if (goldElement) goldElement.textContent = gameState.gold;
    if (diamondElement) diamondElement.textContent = gameState.diamonds;
    if (greenElement) greenElement.textContent = gameState.green;
}

// --- Обновление отображения заданий ---
function updateQuestsDisplay() {
    const questItems = document.querySelectorAll('.quest-item');
    questItems.forEach((item, index) => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.checked = gameState.quests[index].completed;
        }
    });
}

// --- Получение скина ---
function getSkin(skinName) {
    alert(`Скин "${skinName}" получен! 🎉`);
    gameState.diamonds -= 500; // Пример: скин стоит 500 бриллиантов
    updateCurrencyDisplay();
    showNotification(`Получен скин: ${skinName}`);
    saveGame();
}

// --- Выполнение задания ---
function completeQuest(questName) {
    const quest = gameState.quests.find(q => q.name === questName);
    if (quest) {
        quest.completed = true;
        gameState.xp += 20;
        if (gameState.xp >= 120) {
            gameState.level++;
            gameState.xp = 0;
        }
        updateCurrencyDisplay();
        updateQuestsDisplay();
        showNotification(`Задание "${questName}" выполнено! 🏆`);
        saveGame();
    }
}

// --- Загрузка при запуске ---
loadGame();
