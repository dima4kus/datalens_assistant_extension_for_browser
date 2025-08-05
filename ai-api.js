// AI API Integration для DataLens Formula Assistant
// Поддержка Claude, DeepSeek и OpenAI

class AIApiClient {
    constructor() {
        this.providers = {
            claude: {
                name: 'Claude (Anthropic)',
                baseUrl: 'https://api.anthropic.com/v1/messages',
                model: 'claude-3-haiku-20240307',
                headers: (apiKey) => ({
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                })
            },
            deepseek: {
                name: 'DeepSeek',
                baseUrl: 'https://api.deepseek.com/v1/chat/completions',
                model: 'deepseek-chat',
                headers: (apiKey) => ({
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                })
            },
            openai: {
                name: 'OpenAI',
                baseUrl: 'https://api.openai.com/v1/chat/completions',
                model: 'gpt-3.5-turbo',
                headers: (apiKey) => ({
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                })
            }
        };
    }

    // Получить системный промпт для DataLens
    getSystemPrompt(responseType = 'detailed') {
        const basePrompt = `Ты - эксперт по формулам DataLens. Твоя задача - помочь пользователю с написанием формул для DataLens.

КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА:
1. Отвечай ТОЛЬКО на вопросы о формулах DataLens
2. Если вопрос не связан с DataLens - вежливо откажись отвечать
3. Используй только функции из официальной документации DataLens
4. ВСЕГДА показывай точный синтаксис функции
5. Будь последовательным - одинаковые вопросы должны получать одинаковые ответы
6. Не изобретай функции - используй только существующие

ДОСТУПНЫЕ КАТЕГОРИИ ФУНКЦИЙ DataLens:
- Математические: ABS, ROUND, CEILING, FLOOR, POWER, SQRT, MOD, SIGN
- Строковые: CONCAT, LEN, SUBSTR, UPPER, LOWER, TRIM, REPLACE, SPLIT, LEFT, RIGHT
- Даты и время: DATE, DATEADD, DATETRUNC, YEAR, MONTH, DAY, NOW, TODAY, DATEDIFF
- Агрегатные: SUM, AVG, COUNT, MAX, MIN, SUM_IF, AVG_IF, COUNT_IF, COUNT_DISTINCT
- Логические: IF, CASE, IFNULL, ISNULL, BETWEEN, IN, AND, OR, NOT
- Оконные: RANK, DENSE_RANK, ROW_NUMBER, LAG, LEAD, FIRST_VALUE, LAST_VALUE, MAVG, RSUM
- Массивы: ARRAY, GET_ITEM, SLICE, CONTAINS, UNNEST, ARRAY_AGG

ПРИНЦИПЫ СТАБИЛЬНОСТИ ОТВЕТОВ:
- Для одного и того же вопроса всегда давай одинаковый ответ
- Используй стандартные формулировки и примеры
- Не меняй структуру ответа в зависимости от настроения
- Проверяй синтаксис дважды перед ответом`;

        if (responseType === 'short') {
            return basePrompt + `

ФОРМАТ КРАТКОГО ОТВЕТА:
Отвечай СТРОГО в формате: "Функция: НАЗВАНИЕ_ФУНКЦИИ( параметры )"
Пример: "Функция: SUM_IF( expression, condition )"
НИКАКИХ дополнительных объяснений, комментариев или текста!
Только название функции и её точный синтаксис!

ПРИМЕРЫ ПРАВИЛЬНЫХ КРАТКИХ ОТВЕТОВ:
- "Функция: ROUND( number, precision )"
- "Функция: CONCAT( string1, string2, ... )"
- "Функция: IF( condition, then_value, else_value )"`;
        } else {
            return basePrompt + `

ФОРМАТ ПОДРОБНОГО ОТВЕТА:
Используй СТРОГО следующую структуру:

**Функция:** НАЗВАНИЕ_ФУНКЦИИ

**Синтаксис:** НАЗВАНИЕ_ФУНКЦИИ( параметры )

**Описание:** Подробное объяснение что делает функция

**Пример:** Конкретный пример использования с реальными данными

**Примечания:** Дополнительные советы (если есть)

ПРИМЕР ПРАВИЛЬНОГО ПОДРОБНОГО ОТВЕТА:
**Функция:** SUM_IF

**Синтаксис:** SUM_IF( expression, condition )

**Описание:** Вычисляет сумму значений expression для строк, которые удовлетворяют условию condition.

**Пример:** SUM_IF( [Продажи], [Регион] = "Москва" ) - суммирует продажи только для Москвы

**Примечания:** Условие должно возвращать булево значение (true/false)`;
        }
    }

    // Отправить запрос к Claude API
    async callClaude(message, apiKey, responseType = 'detailed') {
        const provider = this.providers.claude;
        
        const maxTokens = responseType === 'short' ? 200 : 1000;
        
        const requestBody = {
            model: provider.model,
            max_tokens: maxTokens,
            temperature: 0.1,
            messages: [
                {
                    role: 'user',
                    content: `${this.getSystemPrompt(responseType)}\n\nВопрос пользователя: ${message}`
                }
            ]
        };

        try {
            const response = await fetch(provider.baseUrl, {
                method: 'POST',
                headers: provider.headers(apiKey),
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                response: data.content[0].text,
                provider: 'claude'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                provider: 'claude'
            };
        }
    }

    // Отправить запрос к DeepSeek API
    async callDeepSeek(message, apiKey, responseType = 'detailed') {
        const provider = this.providers.deepseek;
        
        const maxTokens = responseType === 'short' ? 200 : 1000;
        
        const requestBody = {
            model: provider.model,
            messages: [
                {
                    role: 'system',
                    content: this.getSystemPrompt(responseType)
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            max_tokens: maxTokens,
            temperature: 0.1
        };

        try {
            const response = await fetch(provider.baseUrl, {
                method: 'POST',
                headers: provider.headers(apiKey),
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                response: data.choices[0].message.content,
                provider: 'deepseek'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                provider: 'deepseek'
            };
        }
    }

    // Отправить запрос к OpenAI API
    async callOpenAI(message, apiKey, responseType = 'detailed') {
        const provider = this.providers.openai;
        
        const maxTokens = responseType === 'short' ? 200 : 1000;
        
        const requestBody = {
            model: provider.model,
            messages: [
                {
                    role: 'system',
                    content: this.getSystemPrompt(responseType)
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            max_tokens: maxTokens,
            temperature: 0.1
        };

        try {
            const response = await fetch(provider.baseUrl, {
                method: 'POST',
                headers: provider.headers(apiKey),
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                response: data.choices[0].message.content,
                provider: 'openai'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                provider: 'openai'
            };
        }
    }

    // Универсальный метод для вызова любого провайдера
    async callAI(provider, message, apiKey, responseType = 'detailed') {
        if (!apiKey || !apiKey.trim()) {
            return {
                success: false,
                error: 'API ключ не указан',
                provider
            };
        }

        switch (provider) {
            case 'claude':
                return await this.callClaude(message, apiKey, responseType);
            case 'deepseek':
                return await this.callDeepSeek(message, apiKey, responseType);
            case 'openai':
                return await this.callOpenAI(message, apiKey, responseType);
            default:
                return {
                    success: false,
                    error: 'Неподдерживаемый провайдер',
                    provider
                };
        }
    }

    // Проверить доступность API
    async testApiKey(provider, apiKey) {
        try {
            const result = await this.callAI(provider, 'Тест подключения', apiKey);
            return result.success;
        } catch (error) {
            return false;
        }
    }

    // Получить список доступных провайдеров
    getProviders() {
        return Object.keys(this.providers).map(key => ({
            id: key,
            name: this.providers[key].name,
            model: this.providers[key].model
        }));
    }
}

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIApiClient;
}