// --- Глобальные переменные для пенальти ---
let penaltyScene, penaltyCamera, penaltyRenderer, penaltyControls;
let stadiumModel = null;
let playerModel = null;
let goalkeeperModel = null;
let ballModel = null;
let currentPenaltyPlayer = null;

// --- Инициализация 3D-пенальти ---
function initPenalty3D() {
    const container = document.getElementById('penalty-viewer');

    // Создание сцены
    penaltyScene = new THREE.Scene();
    penaltyScene.background = new THREE.Color(0x000000);

    // Камера
    penaltyCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    penaltyCamera.position.set(0, 5, 15); // Над полем

    // Рендерер
    penaltyRenderer = new THREE.WebGLRenderer({ antialias: true });
    penaltyRenderer.setSize(container.clientWidth, container.clientHeight);
    penaltyRenderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(penaltyRenderer.domElement);

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    penaltyScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1).normalize();
    penaltyScene.add(directionalLight);

    // Управление камерой
    penaltyControls = new THREE.OrbitControls(penaltyCamera, penaltyRenderer.domElement);
    penaltyControls.enableDamping = true;
    penaltyControls.dampingFactor = 0.05;
    penaltyControls.screenSpacePanning = false;
    penaltyControls.minDistance = 5;
    penaltyControls.maxDistance = 50;

    // Загрузка модели стадиона
    const loader = new THREE.GLTFLoader();
    loader.load(
        'models/stadium.glb',
        (gltf) => {
            stadiumModel = gltf.scene;
            penaltyScene.add(stadiumModel);
            centerAndScaleModel(stadiumModel);
        },
        (progress) => {
            console.log(`Загрузка стадиона: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
        },
        (error) => {
            console.error('Ошибка загрузки стадиона:', error);
        }
    );

    // Загрузка модели игрока (общая)
    loader.load(
        'models/player_common.glb',
        (gltf) => {
            playerModel = gltf.scene;
            penaltyScene.add(playerModel);
            playerModel.position.set(-5, 0, 10); // Позиция игрока
            centerAndScaleModel(playerModel);
        },
        (progress) => {
            console.log(`Загрузка игрока: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
        },
        (error) => {
            console.error('Ошибка загрузки игрока:', error);
        }
    );

    // Загрузка модели вратаря
    loader.load(
        'models/player_common.glb',
        (gltf) => {
            goalkeeperModel = gltf.scene;
            penaltyScene.add(goalkeeperModel);
            goalkeeperModel.position.set(0, 0, 0); // Перед воротами
            centerAndScaleModel(goalkeeperModel);
        },
        (progress) => {
            console.log(`Загрузка вратаря: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
        },
        (error) => {
            console.error('Ошибка загрузки вратаря:', error);
        }
    );

    // Загрузка модели мяча
    loader.load(
        'models/ball.glb',
        (gltf) => {
            ballModel = gltf.scene;
            penaltyScene.add(ballModel);
            ballModel.position.set(-5, 0, 10); // На точке пенальти
            centerAndScaleModel(ballModel);
        },
        (progress) => {
            console.log(`Загрузка мяча: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
        },
        (error) => {
            console.error('Ошибка загрузки мяча:', error);
        }
    );

    // Анимационный цикл
    function animate() {
        requestAnimationFrame(animate);
        if (penaltyControls) penaltyControls.update();
        if (penaltyRenderer && penaltyScene && penaltyCamera) {
            penaltyRenderer.render(penaltyScene, penaltyCamera);
        }
    }
    animate();

    // Адаптивность
    window.addEventListener('resize', function() {
        if (penaltyCamera && penaltyRenderer) {
            penaltyCamera.aspect = container.clientWidth / container.clientHeight;
            penaltyCamera.updateProjectionMatrix();
            penaltyRenderer.setSize(container.clientWidth, container.clientHeight);
        }
    });
}

// --- Центрирование и масштабирование модели ---
function centerAndScaleModel(model) {
    if (!model) return;

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length();

    model.position.sub(center);

    const scale = 1 / size;
    model.scale.set(scale, scale, scale);

    penaltyCamera.position.z = size * 2;
    penaltyControls.update();
}

// --- Функция выполнения удара ---
function performPenalty(kickType) {
    console.log(`Выполнен удар: ${kickType}`);

    // Здесь можно добавить анимацию мяча
    if (ballModel) {
        // Просто перемещаем мяч к воротам
        const target = new THREE.Vector3(0, 0, 0);
        const duration = 2000; // 2 секунды
        const startTime = Date.now();

        function animateBall() {
            const elapsed = Date.now() - startTime;
            const t = Math.min(elapsed / duration, 1);

            // Линейная интерполяция
            ballModel.position.lerp(target, t * 0.1);

            if (t < 1) {
                requestAnimationFrame(animateBall);
            } else {
                // Проверяем, забил ли гол
                const success = Math.random() > 0.3; // 70% шанс забить
                if (success) {
                    alert("ГОООООЛ! 🎉");
                    // Добавляем очки
                    updateQuestProgress("Забей пенальти");
                } else {
                    alert("Промах! 😢");
                }
            }
        }

        animateBall();
    }
}

// --- Обновление прогресса заданий ---
function updateQuestProgress(questName) {
    const quests = JSON.parse(localStorage.getItem('quests') || '[]');
    const quest = quests.find(q => q.name === questName);
    if (quest) {
        quest.completed = true;
        localStorage.setItem('quests', JSON.stringify(quests));
        showNotification("Задание выполнено! Получите награду.");
    }
}

// --- Отображение уведомления ---
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#00ff00';
    notification.style.color = 'black';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '8px';
    notification.style.zIndex = '1000';
    document.body.appendChild(notification);

    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}

// --- Инициализация при загрузке ---
document.addEventListener('DOMContentLoaded', function () {
    // Инициализируем 3D-пенальти при загрузке страницы
    initPenalty3D();
});

// --- Обработчики событий ---
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn-quiet').addEventListener('click', () => {
        performPenalty('Quiet');
    });

    document.getElementById('btn-cavadinha').addEventListener('click', () => {
        performPenalty('Cavadinha');
    });

    document.getElementById('btn-replace').addEventListener('click', () => {
        alert('Игрок заменён.');
    });

    document.getElementById('btn-super-kick').addEventListener('click', () => {
        performPenalty('Super Kick');
    });

    document.getElementById('btn-penalty-back').addEventListener('click', () => {
        showScreen('mode-select');
    });
});
