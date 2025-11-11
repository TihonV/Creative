// --- Ждём загрузки DOM ---
document.addEventListener('DOMContentLoaded', function () {

    console.log("DOM загружен, инициализация...");

    // --- Инициализация переменных ---
    let scene, camera, renderer, controls;
    let currentModel = null;
    const container = document.getElementById('3d-viewer');
    const modelContainer = document.getElementById('model-container');
    const cardsContainer = document.querySelector('.cards-container');
    const backBtn = document.getElementById('back-btn');

    // --- Проверяем, что элементы найдены ---
    if (!container || !modelContainer || !cardsContainer || !backBtn) {
        console.error("❌ Один или несколько основных элементов не найдены в DOM.");
        return; // Останавливаем выполнение, если элементы не найдены
    }

    // --- Загрузка и отображение модели (только GLB) ---
    function loadAndDisplayModel(modelName) {
        console.log(`Загрузка модели: ${modelName}`);

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
        scene.background = new THREE.Color(0x000000);

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
                    window.mixer = mixer;
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

        model.position.sub(center);

        const scale = 2 / size;
        model.scale.set(scale, scale, scale);

        camera.position.z = size * 1.5;
        controls.update();
    }

    // --- Анимационный цикл ---
    function animate() {
        requestAnimationFrame(animate);
        if (controls) controls.update();
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
        if (window.mixer) {
            window.mixer.update(0.016);
        }
    }
    animate();

    // --- Обработчики событий для кнопок ---
    // Находим все кнопки "Внешний вид" ДО подключения обработчиков
    const viewButtons = document.querySelectorAll('.view-btn');

    if (viewButtons.length === 0) {
        console.error("❌ Кнопки '.view-btn' не найдены в DOM.");
    } else {
        console.log(`✅ Найдено ${viewButtons.length} кнопок 'Внешний вид'.`);
        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const card = this.closest('.player-card');
                if (card) {
                    const modelName = card.getAttribute('data-model');
                    if (modelName) {
                        console.log(`Кнопка 'Внешний вид' нажата для модели: ${modelName}`);
                        loadAndDisplayModel(modelName);
                        modelContainer.style.display = 'flex';
                        cardsContainer.style.display = 'none';
                    } else {
                        console.error("❌ У карточки нет атрибута data-model.");
                    }
                } else {
                    console.error("❌ Не удалось найти родительскую карточку для кнопки.");
                }
            });
        });
    }

    // Обработчик для кнопки "Назад"
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            console.log("Кнопка 'Назад к карточкам' нажата.");
            modelContainer.style.display = 'none';
            cardsContainer.style.display = 'flex';

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
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            window.mixer = null;
        });
    } else {
        console.error("❌ Кнопка '#back-btn' не найдена в DOM.");
    }

    // --- Адаптивность ---
    window.addEventListener('resize', function() {
        if (camera && renderer) {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    });

    console.log("✅ Скрипт main.js успешно инициализирован.");
});

// --- Обработчик ошибок (для отладки) ---
window.addEventListener('error', function(e) {
    console.error("❌ Произошла глобальная ошибка JavaScript:", e.error);
});
