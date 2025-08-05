// Enhanced Popup script для DataLens Formula Assistant v2.0
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация компонентов
    const aiApiClient = new AIApiClient();
    const memoryManager = new MemoryBankManager();
    
    // Элементы интерфейса
    const questionInput = document.getElementById('question-input');
    const searchBtn = document.getElementById('search-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const modeBadge = document.getElementById('mode-badge');
    const responseTypeSelector = document.getElementById('response-type-selector');
    const responseShort = document.getElementById('response-short');
    const responseDetailed = document.getElementById('response-detailed');
    const resultsSection = document.getElementById('results-section');
    const resultsContainer = document.getElementById('results-container');
    const aiResponseSection = document.getElementById('ai-response');
    const aiResponseContent = document.getElementById('ai-response-content');
    const approveBtn = document.getElementById('approve-btn');
    const rejectBtn = document.getElementById('reject-btn');
    const loading = document.getElementById('loading');
    const loadingText = document.getElementById('loading-text');
    const noResults = document.getElementById('no-results');

    // Переменные для хранения текущего ответа
    let currentQuestion = '';
    let currentAnswer = '';
    let currentProvider = '';

    // Настройки по умолчанию
    let currentSettings = {
        workMode: 'local',
        aiProvider: 'claude',
        apiKey: '',
        saveHistory: true,
        autoCopy: true
    };

    // Загрузка настроек при инициализации
    loadSettings();

    // Обработчики событий
    searchBtn.addEventListener('click', handleSearch);
    settingsBtn.addEventListener('click', openSettings);
    approveBtn.addEventListener('click', handleApprove);
    rejectBtn.addEventListener('click', handleReject);
    
    questionInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSearch();
        }
    });

    // Слушатель сообщений от настроек
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'settingsUpdated') {
            currentSettings = request.settings;
            updateModeIndicator();
        }
    });

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

            currentSettings = {
                workMode: settings.workMode || 'local',
                aiProvider: settings.aiProvider || 'claude',
                apiKey: settings.apiKey || '',
                saveHistory: settings.saveHistory !== false,
                autoCopy: settings.autoCopy !== false
            };

            updateModeIndicator();
        } catch (error) {
            console.error('Ошибка загрузки настроек:', error);
        }
    }

    // Обновление индикатора режима
    function updateModeIndicator() {
        if (currentSettings.workMode === 'ai') {
            modeBadge.textContent = `AI: ${aiApiClient.providers[currentSettings.aiProvider]?.name || 'Unknown'}`;
            modeBadge.classList.add('ai-mode');
            responseTypeSelector.style.display = 'block';
        } else {
            modeBadge.textContent = 'Локальный поиск';
            modeBadge.classList.remove('ai-mode');
            responseTypeSelector.style.display = 'none';
        }
    }

    // Открытие страницы настроек
    function openSettings() {
        chrome.tabs.create({
            url: chrome.runtime.getURL('settings.html')
        });
    }

    // Основная функция обработки поиска
    async function handleSearch() {
        const query = questionInput.value.trim();
        
        if (!query) {
            alert('Пожалуйста, введите вопрос');
            return;
        }

        // Сохранить запрос в историю
        if (currentSettings.saveHistory) {
            saveSearchQuery(query);
        }

        if (currentSettings.workMode === 'ai') {
            await handleAISearch(query);
        } else {
            handleLocalSearch(query);
        }
    }

    // Обработка поиска через AI
    async function handleAISearch(query) {
        if (!currentSettings.apiKey) {
            showError('API ключ не настроен. Перейдите в настройки для конфигурации.');
            return;
        }

        // Определить тип ответа
        const responseType = responseDetailed.checked ? 'detailed' : 'short';
        
        showLoading('Обращение к нейросети...');

        try {
            const result = await aiApiClient.callAI(
                currentSettings.aiProvider,
                query,
                currentSettings.apiKey,
                responseType
            );

            if (result.success) {
                // Сохранить данные для approve/reject
                currentQuestion = query;
                currentAnswer = result.response;
                currentProvider = currentSettings.aiProvider;
                // Добавляем информацию о типе ответа для лучшего контекста
                currentQuestion += ` [Тип: ${responseType === 'short' ? 'краткий' : 'подробный'}]`;
                
                displayAIResponse(result.response);
            } else {
                showError(`Ошибка AI: ${result.error}`);
            }
        } catch (error) {
            showError(`Ошибка подключения: ${error.message}`);
        }
    }

    // Обработка локального поиска
    function handleLocalSearch(query) {
        showLoading('Поиск в базе знаний...');
        
        // Имитация задержки для лучшего UX
        setTimeout(() => {
            const results = searchFunctions(query);
            displayLocalResults(results);
        }, 500);
    }

    // Показать состояние загрузки
    function showLoading(text = 'Загрузка...') {
        hideAllSections();
        loading.style.display = 'block';
        loadingText.textContent = text;
        loadingText.classList.add('loading-dots');
        searchBtn.disabled = true;
        searchBtn.textContent = 'Поиск...';
    }

    // Скрыть все секции результатов
    function hideAllSections() {
        resultsSection.style.display = 'none';
        aiResponseSection.style.display = 'none';
        loading.style.display = 'none';
        noResults.style.display = 'none';
        
        // Удалить существующие сообщения об ошибках
        const existingErrors = document.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());
    }

    // Отобразить ответ от AI
    function displayAIResponse(response) {
        searchBtn.disabled = false;
        searchBtn.textContent = 'Найти решение';
        loadingText.classList.remove('loading-dots');
        hideAllSections();

        // Обработка markdown-подобного форматирования
        const formattedResponse = formatAIResponse(response);
        aiResponseContent.innerHTML = formattedResponse;
        aiResponseSection.style.display = 'block';

        // Добавить обработчики для копирования кода
        addCodeCopyHandlers();
    }

    // Отобразить результаты локального поиска
    function displayLocalResults(results) {
        searchBtn.disabled = false;
        searchBtn.textContent = 'Найти решение';
        loadingText.classList.remove('loading-dots');
        hideAllSections();

        if (results.length === 0) {
            noResults.style.display = 'block';
            return;
        }

        resultsContainer.innerHTML = '';
        
        results.forEach(func => {
            const card = createFunctionCard(func);
            resultsContainer.appendChild(card);
        });

        resultsSection.style.display = 'block';
    }

    // Показать ошибку
    function showError(message) {
        searchBtn.disabled = false;
        searchBtn.textContent = 'Найти решение';
        loadingText.classList.remove('loading-dots');
        hideAllSections();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        document.querySelector('.main').appendChild(errorDiv);
    }

    // Форматирование ответа AI
    function formatAIResponse(response) {
        return response
            // Заголовки
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h3>$1</h3>')
            .replace(/^# (.*$)/gm, '<h3>$1</h3>')
            // Код в строке
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Блоки кода
            .replace(/```[\s\S]*?```/g, (match) => {
                const code = match.replace(/```/g, '').trim();
                return `<pre><code>${code}</code></pre>`;
            })
            // Жирный текст
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Курсив
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Переносы строк
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            // Обернуть в параграфы
            .replace(/^(.+)/, '<p>$1')
            .replace(/(.+)$/, '$1</p>');
    }

    // Добавить обработчики для копирования кода
    function addCodeCopyHandlers() {
        const codeBlocks = aiResponseContent.querySelectorAll('pre code, code');
        codeBlocks.forEach(block => {
            block.style.cursor = 'pointer';
            block.title = 'Нажмите для копирования';
            block.addEventListener('click', () => {
                copyToClipboard(block.textContent);
                showCopyNotification(block);
            });
        });
    }

    // Создать карточку функции (для локального поиска)
    function createFunctionCard(func) {
        const card = document.createElement('div');
        card.className = 'function-card';
        
        card.innerHTML = `
            <div class="function-name">${func.name}</div>
            <div class="function-syntax">${func.syntax}</div>
            <div class="function-description">${func.description}</div>
            <div class="function-category">${func.category}</div>
        `;

        // Добавить обработчик клика для копирования синтаксиса
        if (currentSettings.autoCopy) {
            card.addEventListener('click', () => {
                copyToClipboard(func.syntax);
                showCopyNotification(card);
            });
        }

        return card;
    }

    // Копировать в буфер обмена
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Скопировано в буфер обмена:', text);
        }).catch(err => {
            console.error('Ошибка копирования:', err);
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        });
    }

    // Показать уведомление о копировании
    function showCopyNotification(element) {
        const originalBg = element.style.backgroundColor;
        element.style.backgroundColor = '#d4edda';
        element.style.transition = 'background-color 0.3s ease';
        
        setTimeout(() => {
            element.style.backgroundColor = originalBg;
        }, 1000);
    }

    // Сохранить запрос в историю
    async function saveSearchQuery(query) {
        try {
            const result = await chrome.storage.local.get(['searchHistory']);
            const history = result.searchHistory || [];
            
            // Добавить новый запрос в начало, избегая дублирования
            const filteredHistory = history.filter(item => item.query !== query);
            const newHistory = [
                { 
                    query, 
                    timestamp: Date.now(),
                    mode: currentSettings.workMode 
                },
                ...filteredHistory
            ].slice(0, 50); // Ограничить историю 50 записями
            
            await chrome.storage.local.set({ searchHistory: newHistory });
        } catch (error) {
            console.error('Ошибка сохранения истории:', error);
        }
    }

    // Функция локального поиска (улучшенная версия)
    function searchFunctions(query) {
        const results = [];
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
        
        // Поиск по всем категориям
        Object.values(DATALENS_MEMORY_BANK).forEach(category => {
            category.forEach(func => {
                let score = 0;
                
                // Поиск в названии функции (высокий приоритет)
                if (func.name.toLowerCase().includes(query.toLowerCase())) {
                    score += 10;
                }
                
                // Поиск по терминам
                searchTerms.forEach(term => {
                    // Поиск в описании
                    if (func.description.toLowerCase().includes(term)) {
                        score += 3;
                    }
                    
                    // Поиск в ключевых словах
                    func.keywords.forEach(keyword => {
                        if (keyword.includes(term)) {
                            score += 5;
                        }
                    });
                });
                
                // Дополнительные правила для улучшения поиска
                if (isDataLensRelated(query)) {
                    score += 2;
                }
                
                if (score > 0) {
                    results.push({ ...func, score });
                }
            });
        });
        
        // Сортировка по релевантности
        return results.sort((a, b) => b.score - a.score).slice(0, 8);
    }

    // Проверка, связан ли запрос с DataLens
    function isDataLensRelated(query) {
        const dataLensKeywords = [
            'формула', 'функция', 'вычисление', 'поле', 'показатель',
            'измерение', 'агрегация', 'группировка', 'фильтр'
        ];
        
        return dataLensKeywords.some(keyword => 
            query.toLowerCase().includes(keyword)
        );
    }

    // Обработка approve ответа
    async function handleApprove() {
        if (!currentQuestion || !currentAnswer) {
            showFeedbackNotification('info', 'Нет ответа для оценки');
            return;
        }

        try {
            const result = await memoryManager.saveApprovedCase(
                currentQuestion,
                currentAnswer,
                currentProvider
            );

            if (result.success) {
                showFeedbackNotification('success', result.message);
                approveBtn.classList.add('voted');
                approveBtn.disabled = true;
                rejectBtn.disabled = true;
                // Очищаем данные после успешного голосования
                clearCurrentResponse();
            } else {
                showFeedbackNotification('info', result.message);
            }
        } catch (error) {
            console.error('Ошибка сохранения одобренного случая:', error);
            showFeedbackNotification('error', 'Ошибка сохранения');
        }
    }

    // Обработка reject ответа
    async function handleReject() {
        if (!currentQuestion || !currentAnswer) {
            showFeedbackNotification('info', 'Нет ответа для оценки');
            return;
        }

        try {
            const result = await memoryManager.saveRejectedCase(
                currentQuestion,
                currentAnswer,
                currentProvider,
                'Пользователь отметил как неверный'
            );

            if (result.success) {
                showFeedbackNotification('success', result.message);
                rejectBtn.classList.add('voted');
                rejectBtn.disabled = true;
                approveBtn.disabled = true;
                // Очищаем данные после успешного голосования
                clearCurrentResponse();
            } else {
                showFeedbackNotification('info', result.message);
            }
        } catch (error) {
            console.error('Ошибка сохранения отклоненного случая:', error);
            showFeedbackNotification('error', 'Ошибка сохранения');
        }
    }

    // Показать уведомление о feedback
    function showFeedbackNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `feedback-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Сброс состояния кнопок при новом поиске
    function resetActionButtons() {
        approveBtn.classList.remove('voted');
        rejectBtn.classList.remove('voted');
        approveBtn.disabled = false;
        rejectBtn.disabled = false;
        // НЕ сбрасываем currentQuestion, currentAnswer, currentProvider здесь!
        // Они должны сохраняться до следующего AI-ответа
    }

    // Сброс данных ответа только после голосования
    function clearCurrentResponse() {
        currentQuestion = '';
        currentAnswer = '';
        currentProvider = '';
    }

    // Обновить функцию hideAllSections для сброса только UI кнопок
    const originalHideAllSections = hideAllSections;
    hideAllSections = function() {
        originalHideAllSections();
        resetActionButtons();
        // Сбрасываем данные ответа только если это не AI режим или если начинается новый поиск
        if (currentSettings.workMode !== 'ai') {
            clearCurrentResponse();
        }
    };

    // Автофокус на поле ввода
    questionInput.focus();

    // Динамические примеры вопросов
    const examples = [
        "как посчитать сумму по условию?",
        "как округлить число?",
        "как извлечь год из даты?",
        "как объединить строки?",
        "как найти максимальное значение?",
        "как создать условную формулу?",
        "как работать с массивами?",
        "как использовать оконные функции?"
    ];

    // Случайный пример в placeholder
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    questionInput.placeholder = `Например: ${randomExample}`;
});

// Обработка ошибок
window.addEventListener('error', function(e) {
    console.error('Ошибка в расширении:', e.error);
});