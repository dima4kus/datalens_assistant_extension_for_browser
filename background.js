// Background script для DataLens Formula Assistant
if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onInstalled.addListener(() => {
        console.log('DataLens Formula Assistant установлен');
        
        // Инициализация настроек по умолчанию
        if (chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({
                extensionEnabled: true,
                searchHistory: [],
                favoritesFunctions: []
            });
        }
    });

    // Обработка сообщений от popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'searchFunctions':
            handleSearchFunctions(request.query, sendResponse);
            return true; // Асинхронный ответ
            
        case 'saveFavorite':
            handleSaveFavorite(request.function, sendResponse);
            return true;
            
        case 'getSearchHistory':
            handleGetSearchHistory(sendResponse);
            return true;
            
        default:
            sendResponse({ error: 'Неизвестное действие' });
    }
});

// Обработка поиска функций
function handleSearchFunctions(query, sendResponse) {
    try {
        // Сохранить запрос в историю
        saveSearchQuery(query);
        
        // Здесь можно добавить дополнительную логику обработки
        sendResponse({ 
            success: true, 
            message: 'Поиск выполнен',
            timestamp: Date.now()
        });
    } catch (error) {
        sendResponse({ 
            success: false, 
            error: error.message 
        });
    }
}

// Сохранение запроса в историю
function saveSearchQuery(query) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['searchHistory'], (result) => {
            const history = result.searchHistory || [];
            
            // Добавить новый запрос в начало, избегая дублирования
            const filteredHistory = history.filter(item => item.query !== query);
            const newHistory = [
                { query, timestamp: Date.now() },
                ...filteredHistory
            ].slice(0, 50); // Ограничить историю 50 записями
            
            chrome.storage.local.set({ searchHistory: newHistory });
        });
    }
}

// Сохранение избранной функции
function handleSaveFavorite(functionData, sendResponse) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['favoritesFunctions'], (result) => {
            const favorites = result.favoritesFunctions || [];
            
            // Проверить, не добавлена ли уже эта функция
            const exists = favorites.some(fav => fav.name === functionData.name);
            
            if (!exists) {
                favorites.push({
                    ...functionData,
                    addedAt: Date.now()
                });
                
                chrome.storage.local.set({ favoritesFunctions: favorites }, () => {
                    sendResponse({
                        success: true,
                        message: 'Функция добавлена в избранное'
                    });
                });
            } else {
                sendResponse({
                    success: false,
                    message: 'Функция уже в избранном'
                });
            }
        });
    } else {
        sendResponse({
            success: false,
            error: 'Chrome storage API недоступен'
        });
    }
}

// Получение истории поиска
function handleGetSearchHistory(sendResponse) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['searchHistory'], (result) => {
            sendResponse({
                success: true,
                history: result.searchHistory || []
            });
        });
    } else {
        sendResponse({
            success: false,
            error: 'Chrome storage API недоступен',
            history: []
        });
    }
}

// Очистка старых записей истории (запускается раз в день)
function cleanupHistory() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['searchHistory'], (result) => {
            const history = result.searchHistory || [];
            const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            
            const cleanHistory = history.filter(item => item.timestamp > oneWeekAgo);
            
            if (cleanHistory.length !== history.length) {
                chrome.storage.local.set({ searchHistory: cleanHistory });
                console.log('История поиска очищена от старых записей');
            }
        });
    } else {
        console.log('Chrome storage API недоступен для очистки истории');
    }
}

// Запуск очистки при установке и затем периодически
if (typeof chrome !== 'undefined' && chrome.alarms && chrome.alarms.create) {
    chrome.alarms.create('cleanupHistory', {
        delayInMinutes: 1,
        periodInMinutes: 24 * 60 // Раз в день
    });

    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === 'cleanupHistory') {
            cleanupHistory();
        }
    });
} else {
    // Fallback: запускаем очистку через setTimeout
    console.log('chrome.alarms API недоступен, используем fallback');
    
    // Запуск через минуту после загрузки
    setTimeout(() => {
        cleanupHistory();
        
        // Затем каждые 24 часа
        setInterval(cleanupHistory, 24 * 60 * 60 * 1000);
    }, 60 * 1000);
}

    // Обработка ошибок
    if (chrome.runtime && chrome.runtime.onSuspend) {
        chrome.runtime.onSuspend.addListener(() => {
            console.log('DataLens Formula Assistant приостановлен');
        });
    }
}

// Логирование для отладки
console.log('Background script DataLens Formula Assistant загружен');