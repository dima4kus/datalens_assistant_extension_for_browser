// Settings page script для DataLens Formula Assistant
document.addEventListener('DOMContentLoaded', function() {
    const aiApiClient = new AIApiClient();
    
    // Элементы интерфейса
    const modeLocal = document.getElementById('mode-local');
    const modeAI = document.getElementById('mode-ai');
    const aiSettings = document.getElementById('ai-settings');
    const aiProvider = document.getElementById('ai-provider');
    const apiKeyInput = document.getElementById('api-key');
    const toggleKeyBtn = document.getElementById('toggle-key');
    const testConnectionBtn = document.getElementById('test-connection');
    const testResult = document.getElementById('test-result');
    const saveHistoryCheckbox = document.getElementById('save-history');
    const autoCopyCheckbox = document.getElementById('auto-copy');
    const saveBtn = document.getElementById('save-settings');
    const resetBtn = document.getElementById('reset-settings');

    // Загрузка настроек при открытии страницы
    loadSettings();

    // Обработчики событий
    modeLocal.addEventListener('change', handleModeChange);
    modeAI.addEventListener('change', handleModeChange);
    toggleKeyBtn.addEventListener('click', toggleApiKeyVisibility);
    testConnectionBtn.addEventListener('click', testConnection);
    saveBtn.addEventListener('click', saveSettings);
    resetBtn.addEventListener('click', resetSettings);

    // Обработка изменения режима работы
    function handleModeChange() {
        if (modeAI.checked) {
            aiSettings.style.display = 'block';
            aiSettings.classList.add('fade-in');
        } else {
            aiSettings.style.display = 'none';
            aiSettings.classList.remove('fade-in');
        }
    }

    // Переключение видимости API ключа
    function toggleApiKeyVisibility() {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleKeyBtn.textContent = '🙈';
        } else {
            apiKeyInput.type = 'password';
            toggleKeyBtn.textContent = '👁️';
        }
    }

    // Тестирование подключения к API
    async function testConnection() {
        const provider = aiProvider.value;
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            showTestResult('error', 'Введите API ключ для тестирования');
            return;
        }

        testConnectionBtn.disabled = true;
        testConnectionBtn.textContent = 'Тестирование...';
        showTestResult('', 'Проверка подключения...');

        try {
            const result = await aiApiClient.callAI(provider, 'Тест подключения к DataLens Formula Assistant', apiKey);
            
            if (result.success) {
                showTestResult('success', `✅ Подключение к ${aiApiClient.providers[provider].name} успешно установлено`);
            } else {
                showTestResult('error', `❌ Ошибка подключения: ${result.error}`);
            }
        } catch (error) {
            showTestResult('error', `❌ Ошибка: ${error.message}`);
        } finally {
            testConnectionBtn.disabled = false;
            testConnectionBtn.textContent = 'Проверить подключение';
        }
    }

    // Отображение результата тестирования
    function showTestResult(type, message) {
        testResult.style.display = 'block';
        testResult.className = `test-result ${type}`;
        testResult.textContent = message;

        if (type === 'success') {
            setTimeout(() => {
                testResult.style.display = 'none';
            }, 3000);
        }
    }

    // Загрузка настроек из хранилища
    async function loadSettings() {
        try {
            const settings = await chrome.storage.local.get([
                'workMode',
                'aiProvider',
                'apiKey',
                'saveHistory',
                'autoCopy'
            ]);

            // Режим работы
            if (settings.workMode === 'ai') {
                modeAI.checked = true;
                handleModeChange();
            } else {
                modeLocal.checked = true;
            }

            // Провайдер AI
            if (settings.aiProvider) {
                aiProvider.value = settings.aiProvider;
            }

            // API ключ
            if (settings.apiKey) {
                apiKeyInput.value = settings.apiKey;
            }

            // Дополнительные настройки
            saveHistoryCheckbox.checked = settings.saveHistory !== false;
            autoCopyCheckbox.checked = settings.autoCopy !== false;

        } catch (error) {
            console.error('Ошибка загрузки настроек:', error);
        }
    }

    // Сохранение настроек
    async function saveSettings() {
        try {
            const settings = {
                workMode: modeAI.checked ? 'ai' : 'local',
                aiProvider: aiProvider.value,
                apiKey: apiKeyInput.value.trim(),
                saveHistory: saveHistoryCheckbox.checked,
                autoCopy: autoCopyCheckbox.checked,
                lastUpdated: Date.now()
            };

            await chrome.storage.local.set(settings);
            
            // Показать уведомление об успешном сохранении
            showSaveNotification('success', 'Настройки сохранены');
            
            // Отправить сообщение popup о изменении настроек
            try {
                await chrome.runtime.sendMessage({
                    action: 'settingsUpdated',
                    settings: settings
                });
            } catch (error) {
                // Popup может быть закрыт, это нормально
            }

        } catch (error) {
            console.error('Ошибка сохранения настроек:', error);
            showSaveNotification('error', 'Ошибка сохранения настроек');
        }
    }

    // Сброс настроек к значениям по умолчанию
    async function resetSettings() {
        if (!confirm('Вы уверены, что хотите сбросить все настройки?')) {
            return;
        }

        try {
            // Очистить все настройки
            await chrome.storage.local.clear();
            
            // Установить значения по умолчанию
            modeLocal.checked = true;
            modeAI.checked = false;
            handleModeChange();
            
            aiProvider.value = 'claude';
            apiKeyInput.value = '';
            saveHistoryCheckbox.checked = true;
            autoCopyCheckbox.checked = true;
            
            testResult.style.display = 'none';
            
            showSaveNotification('success', 'Настройки сброшены');
            
        } catch (error) {
            console.error('Ошибка сброса настроек:', error);
            showSaveNotification('error', 'Ошибка сброса настроек');
        }
    }

    // Показать уведомление о сохранении
    function showSaveNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `save-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-size: 14px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }

    // Валидация API ключа при вводе
    apiKeyInput.addEventListener('input', function() {
        const key = this.value.trim();
        const provider = aiProvider.value;
        
        // Простая валидация формата ключа
        let isValid = false;
        switch (provider) {
            case 'claude':
                isValid = key.startsWith('sk-ant-') && key.length > 20;
                break;
            case 'deepseek':
                isValid = key.startsWith('sk-') && key.length > 20;
                break;
            case 'openai':
                isValid = key.startsWith('sk-') && key.length > 20;
                break;
        }

        if (key && !isValid) {
            this.style.borderColor = '#dc3545';
        } else {
            this.style.borderColor = '#e1e5e9';
        }
    });

    // Добавить стили для анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});

// Обработка ошибок
window.addEventListener('error', function(e) {
    console.error('Ошибка в настройках:', e.error);
});