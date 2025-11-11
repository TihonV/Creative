// --- Инициализация переменных ---
let scene, camera, renderer, controls;
let currentModel = null;
const container = document.getElementById('3d-viewer');
const modelContainer = document.getElementById('model-container');
const cardsContainer = document.querySelector('.cards-container');
const backBtn = document.getElementById('back-btn');

// --- Загрузка и отображение модели ---
function loadAndDisplayModel(modelName) {
    // Очистка предыдущей сцены
    if (currentModel) {
        scene.remove(currentModel);
    }
    if (renderer) {
        renderer.dispose();
    }
    // Очистка контейнера
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Создание новой сцены
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Чёрный фон

    // Создание камеры
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Создание рендера
    renderer = new THREE.WebGLRenderer({ antialias: true }); // Включаем сглаживание
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // Для ретины
    container.appendChild(renderer.domElement);

    // Свет
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Управление камерой (OrbitControls)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Плавное вращение
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 10;

    // Определение пути к модели и выбор загрузчика
    let modelPath = `models/${modelName}.glb`; // Пытаемся загрузить GLB
    let loader = new THREE.GLTFLoader();

    // Если вы хотите, чтобы приоритет был у FBX, поменяйте местами:
    // let modelPath = `models/${modelName}.fbx`;
    // let loader = new THREE.FBXLoader(); // Убедитесь, что подключили FBXLoader.js

    // Попробовать загрузить GLB
    loader.load(
        modelPath,
        (gltf) => {
            console.log(`Модель ${modelName}.glb загружена.`);
            currentModel = gltf.scene;
            scene.add(currentModel);

            // Центрирование и масштабирование модели
            centerAndScaleModel(currentModel);
        },
        (progress) => {
            console.log(`Загрузка ${modelName}.glb: ${(progress.loaded / progress.total * 100 ).toFixed(2)}%`);
        },
        (error) => {
            console.error(`Ошибка загрузки ${modelName}.glb:`, error);
            // Если GLB не загрузилась, пробуем FBX
            tryLoadFBX(modelName);
        }
    );
}

function tryLoadFBX(modelName) {
    console.log(`Пробуем загрузить ${modelName}.fbx...`);
    const fbxLoader = new THREE.FBXLoader();
    const fbxPath = `models/${modelName}.fbx`;

    fbxLoader.load(
        fbxPath,
        (object) => {
            console.log(`Модель ${modelName}.fbx загружена.`);
            currentModel = object;
            scene.add(currentModel);

            // Центрирование и масштабирование модели
            centerAndScaleModel(currentModel);
        },
        (progress) => {
            console.log(`Загрузка ${modelName}.fbx: ${(progress.loaded / progress.total * 100 ).toFixed(2)}%`);
        },
        (error) => {
            console.error(`Ошибка загрузки ${modelName}.fbx:`, error);
            alert(`Не удалось загрузить модель для ${modelName}. Ни GLB, ни FBX файл не найдены или повреждены.`);
        }
    );
}

// --- Центрирование и масштабирование модели ---
function centerAndScaleModel(model) {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length();

    // Центрируем модель
    model.position.x += (model.position.x - center.x);
    model.position.y += (model.position.y - center.y);
    model.position.z += (model.position.z - center.z);

    // Масштабируем модель, чтобы она помещалась в сцену
    const scale = 2 / size; // 2 - желаемый размер модели
    model.scale.set(scale, scale, scale);

    // Позиционируем камеру для лучшего обзора
    camera.position.z = size * 1.5; // Примерное расстояние
    controls.update(); // Обновляем controls после изменения камеры
}

// --- Анимационный цикл ---
function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update(); // Обновляем управление
    if (renderer && scene && camera) renderer.render(scene, camera);
}
animate(); // Запускаем цикл

// --- Обработчики событий ---
document.querySelectorAll('.view-btn').forEach(button => {
    button.addEventListener('click', function() {
        const card = this.closest('.player-card');
        const modelName = card.getAttribute('data-model');
        console.log(`Загрузка модели: ${modelName}`);
        loadAndDisplayModel(modelName);
        // Показываем 3D-контейнер, скрываем карточки
        modelContainer.style.display = 'flex';
        cardsContainer.style.display = 'none';
    });
});

backBtn.addEventListener('click', function() {
    // Скрываем 3D-контейнер, показываем карточки
    modelContainer.style.display = 'none';
    cardsContainer.style.display = 'grid'; // Возвращаем к grid-раскладке

    // Очищаем сцену и ресурсы при возврате
    if (currentModel) {
        scene.remove(currentModel);
        currentModel = null;
    }
    if (renderer) {
        renderer.dispose();
        renderer = null;
    }
    if (controls) {
        controls.dispose();
        controls = null;
    }
    // Удаляем canvas Three.js
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
});

// --- Адаптивность ---
window.addEventListener('resize', function() {
    if (camera && renderer) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
});
