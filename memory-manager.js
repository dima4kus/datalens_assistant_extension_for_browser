// Memory Bank Manager для DataLens Formula Assistant
// Управление динамическим обновлением базы знаний

class MemoryBankManager {
    constructor() {
        this.storageKeys = {
            approvedCases: 'approvedCases',
            rejectedCases: 'rejectedCases',
            userFeedback: 'userFeedback'
        };
    }

    // Сохранить одобренный случай
    async saveApprovedCase(question, answer, provider) {
        try {
            const caseData = {
                id: this.generateId(),
                question: question.trim(),
                answer: answer.trim(),
                provider: provider,
                timestamp: Date.now(),
                type: 'approved',
                votes: 1
            };

            const existingCases = await this.getApprovedCases();
            
            // Проверить на дублирование
            const isDuplicate = existingCases.some(existing => 
                this.calculateSimilarity(existing.question, question) > 0.8
            );

            if (isDuplicate) {
                return { success: false, message: 'Похожий случай уже существует' };
            }

            existingCases.push(caseData);
            
            // Ограничить количество сохраненных случаев
            const limitedCases = existingCases
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 100);

            await chrome.storage.local.set({ 
                [this.storageKeys.approvedCases]: limitedCases 
            });

            return { success: true, message: 'Случай добавлен в базу знаний' };
        } catch (error) {
            console.error('Ошибка сохранения одобренного случая:', error);
            return { success: false, message: 'Ошибка сохранения' };
        }
    }

    // Сохранить отклоненный случай
    async saveRejectedCase(question, answer, provider, reason = '') {
        try {
            const caseData = {
                id: this.generateId(),
                question: question.trim(),
                answer: answer.trim(),
                provider: provider,
                reason: reason,
                timestamp: Date.now(),
                type: 'rejected',
                votes: 1
            };

            const existingCases = await this.getRejectedCases();
            existingCases.push(caseData);
            
            // Ограничить количество
            const limitedCases = existingCases
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 50);

            await chrome.storage.local.set({ 
                [this.storageKeys.rejectedCases]: limitedCases 
            });

            return { success: true, message: 'Неверный ответ отмечен' };
        } catch (error) {
            console.error('Ошибка сохранения отклоненного случая:', error);
            return { success: false, message: 'Ошибка сохранения' };
        }
    }

    // Получить одобренные случаи
    async getApprovedCases() {
        try {
            const result = await chrome.storage.local.get([this.storageKeys.approvedCases]);
            return result[this.storageKeys.approvedCases] || [];
        } catch (error) {
            console.error('Ошибка получения одобренных случаев:', error);
            return [];
        }
    }

    // Получить отклоненные случаи
    async getRejectedCases() {
        try {
            const result = await chrome.storage.local.get([this.storageKeys.rejectedCases]);
            return result[this.storageKeys.rejectedCases] || [];
        } catch (error) {
            console.error('Ошибка получения отклоненных случаев:', error);
            return [];
        }
    }

    // Поиск в одобренных случаях
    async searchApprovedCases(query) {
        const approvedCases = await this.getApprovedCases();
        const results = [];

        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);

        approvedCases.forEach(caseData => {
            let score = 0;

            // Точное совпадение вопроса
            if (caseData.question.toLowerCase().includes(query.toLowerCase())) {
                score += 15;
            }

            // Поиск по терминам
            searchTerms.forEach(term => {
                if (caseData.question.toLowerCase().includes(term)) {
                    score += 5;
                }
                if (caseData.answer.toLowerCase().includes(term)) {
                    score += 3;
                }
            });

            // Семантическая схожесть
            const similarity = this.calculateSimilarity(caseData.question, query);
            if (similarity > 0.5) {
                score += Math.floor(similarity * 10);
            }

            if (score > 0) {
                results.push({ ...caseData, score, similarity });
            }
        });

        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, 3); // Топ-3 результата
    }

    // Расширенный поиск с учетом пользовательских случаев
    async enhancedSearch(query) {
        // Сначала ищем в пользовательских одобренных случаях
        const userCases = await this.searchApprovedCases(query);
        
        // Затем в базовом memory bank
        const baseCases = this.searchInBaseMemoryBank(query);
        
        // Объединяем результаты, приоритет пользовательским случаям
        const combinedResults = [
            ...userCases.map(caseItem => ({ ...caseItem, source: 'user', priority: 1 })),
            ...baseCases.map(caseItem => ({ ...caseItem, source: 'base', priority: 2 }))
        ];

        return combinedResults
            .sort((a, b) => {
                if (a.priority !== b.priority) {
                    return a.priority - b.priority;
                }
                return (b.score || 0) - (a.score || 0);
            })
            .slice(0, 8);
    }

    // Поиск в базовом memory bank
    searchInBaseMemoryBank(query) {
        if (typeof searchFunctions === 'function') {
            return searchFunctions(query);
        }
        return [];
    }

    // Вычисление схожести строк (простой алгоритм)
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) {
            return 1.0;
        }
        
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    // Расстояние Левенштейна
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    // Генерация уникального ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Получить статистику
    async getStatistics() {
        const approved = await this.getApprovedCases();
        const rejected = await this.getRejectedCases();

        return {
            approvedCount: approved.length,
            rejectedCount: rejected.length,
            totalFeedback: approved.length + rejected.length,
            lastActivity: Math.max(
                ...approved.map(c => c.timestamp),
                ...rejected.map(c => c.timestamp),
                0
            )
        };
    }

    // Экспорт данных для резервного копирования
    async exportData() {
        const approved = await this.getApprovedCases();
        const rejected = await this.getRejectedCases();

        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: {
                approved,
                rejected
            }
        };
    }

    // Импорт данных
    async importData(exportedData) {
        try {
            if (!exportedData.data) {
                throw new Error('Неверный формат данных');
            }

            const { approved = [], rejected = [] } = exportedData.data;

            await chrome.storage.local.set({
                [this.storageKeys.approvedCases]: approved,
                [this.storageKeys.rejectedCases]: rejected
            });

            return { success: true, message: 'Данные импортированы успешно' };
        } catch (error) {
            console.error('Ошибка импорта данных:', error);
            return { success: false, message: 'Ошибка импорта данных' };
        }
    }

    // Очистка старых данных
    async cleanup(daysOld = 30) {
        const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
        
        const approved = await this.getApprovedCases();
        const rejected = await this.getRejectedCases();

        const filteredApproved = approved.filter(caseItem => caseItem.timestamp > cutoffTime);
        const filteredRejected = rejected.filter(caseItem => caseItem.timestamp > cutoffTime);

        await chrome.storage.local.set({
            [this.storageKeys.approvedCases]: filteredApproved,
            [this.storageKeys.rejectedCases]: filteredRejected
        });

        return {
            removedApproved: approved.length - filteredApproved.length,
            removedRejected: rejected.length - filteredRejected.length
        };
    }
}

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MemoryBankManager;
} else {
    // Для браузерного окружения - делаем класс глобально доступным
    window.MemoryBankManager = MemoryBankManager;
}