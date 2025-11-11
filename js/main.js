// --- Глобальные переменные ---
let scene, camera, renderer, controls;
let currentModel = null;
const container = document.getElementById('3d-viewer');
const modelContainer = document.getElementById('model-container');
const cardsContainer = document.querySelector('.cards-container');
const backBtn = document.getElementById('back-btn');

// --- Загрузка и отображение модели (только GLB) ---
function loadAndDisplayModel(modelName) {
    // Очистка предыдущей сцены
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

    // Очистка контейнера
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Создание новой сцены
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Чёрный фон

    // Камера
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Рендерер
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Управление камерой
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 10;

    // Путь к модели
    const modelPath = `models/${modelName}.glb`;

    // Загрузчик GLTF (работает с GLB)
    const loader = new THREE.GLTFLoader();

    console.log(`Загрузка модели: ${modelPath}`);

    loader.load(
        modelPath,
        (gltf) => {
            console.log(`✅ Модель ${modelName}.glb успешно загружена.`);
            currentModel = gltf.scene;

            // Центрируем и масштабируем модель
            centerAndScaleModel(currentModel);

            // Добавляем в сцену
            scene.add(currentModel);

            // Запускаем анимацию (если есть)
            if (gltf.animations && gltf.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(currentModel);
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
                // Анимация будет обновляться в animate()
                window.mixer = mixer; // Сохраняем для анимации
            }

        },
        (progress) => {
            console.log(`⏳ Загрузка ${modelName}.glb: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
        },
        (error) => {
            console.error(`❌ Ошибка загрузки модели ${modelName}.glb:`, error);
            alert(`Не удалось загрузить модель "${modelName}". Убедитесь, что файл models/${modelName}.glb существует и корректен.`);
        }
    );
}

// --- Центрирование и масштабирование модели ---
function centerAndScaleModel(model) {
    if (!model) return;

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length();

    // Центрируем модель относительно начала координат
    model.position.sub(center);

    // Масштабируем модель под сцену
    const scale = 2 / size; // Коэффициент 2 — можно изменить под вашу модель
    model.scale.set(scale, scale, scale);

    // Настройка камеры
    camera.position.z = size * 1.5;
    controls.update(); // Обновляем управление после изменения камеры
}

// --- Анимационный цикл ---
function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
    // Обновляем анимацию, если есть
    if (window.mixer) {
        window.mixer.update(0.016); // ~60 FPS
    }
}
animate(); // Запускаем цикл

// --- Обработчики событий ---
document.querySelectorAll('.view-btn').forEach(button => {
    button.addEventListener('click', function() {
        const card = this.closest('.player-card');
        const modelName = card.getAttribute('data-model');
        loadAndDisplayModel(modelName);
        // Показываем 3D-контейнер, скрываем карточки
        modelContainer.style.display = 'flex';
        cardsContainer.style.display = 'none';
    });
});

backBtn.addEventListener('click', function() {
    // Скрываем 3D-контейнер, показываем карточки
    modelContainer.style.display = 'none';
    cardsContainer.style.display = 'flex'; // Возвращаем к flex-раскладке

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
    // Удаляем аниматор
    window.mixer = null;
});

// --- Адаптивность ---
window.addEventListener('resize', function() {
    if (camera && renderer) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
});
