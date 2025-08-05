// DataLens Memory Bank - База знаний функций DataLens
const DATALENS_MEMORY_BANK = {
  // Математические функции
  math: [
    {
      name: "ABS",
      syntax: "ABS( number )",
      description: "Возвращает абсолютное значение заданного числа number.",
      category: "Математические",
      keywords: ["абсолютное", "значение", "модуль", "число"]
    },
    {
      name: "ROUND",
      syntax: "ROUND( number [ , precision ] )",
      description: "Округляет число number до указанного числа знаков precision после запятой.",
      category: "Математические",
      keywords: ["округление", "точность", "знаки", "запятая"]
    },
    {
      name: "CEILING",
      syntax: "CEILING( number )",
      description: "Округляет значение до ближайшего целого числа в большую сторону.",
      category: "Математические",
      keywords: ["округление", "вверх", "больший", "целое"]
    },
    {
      name: "FLOOR",
      syntax: "FLOOR( number )",
      description: "Округляет значение до ближайшего целого числа в меньшую сторону.",
      category: "Математические",
      keywords: ["округление", "вниз", "меньший", "целое"]
    },
    {
      name: "POWER",
      syntax: "POWER( base, power )",
      description: "Возводит число base в степень power.",
      category: "Математические",
      keywords: ["степень", "возведение", "основание"]
    },
    {
      name: "SQRT",
      syntax: "SQRT( number )",
      description: "Возвращает квадратный корень заданного числа.",
      category: "Математические",
      keywords: ["корень", "квадратный", "извлечение"]
    }
  ],

  // Строковые функции
  string: [
    {
      name: "CONCAT",
      syntax: "CONCAT( arg_1, arg_2, arg_3 [ , ... ] )",
      description: "Объединяет произвольное количество строк.",
      category: "Строковые",
      keywords: ["объединение", "конкатенация", "склеивание", "строки"]
    },
    {
      name: "LEN",
      syntax: "LEN( value )",
      description: "Возвращает количество символов в строке или элементов в массиве value.",
      category: "Строковые",
      keywords: ["длина", "количество", "символы", "размер"]
    },
    {
      name: "SUBSTR",
      syntax: "SUBSTR( string, from_index [ , length ] )",
      description: "Возвращает подстроку string, начиная с индекса from_index.",
      category: "Строковые",
      keywords: ["подстрока", "извлечение", "часть", "индекс"]
    },
    {
      name: "UPPER",
      syntax: "UPPER( string )",
      description: "Возвращает строку string в верхнем регистре.",
      category: "Строковые",
      keywords: ["верхний", "регистр", "заглавные", "буквы"]
    },
    {
      name: "LOWER",
      syntax: "LOWER( string )",
      description: "Возвращает строку string в нижнем регистре.",
      category: "Строковые",
      keywords: ["нижний", "регистр", "строчные", "буквы"]
    },
    {
      name: "TRIM",
      syntax: "TRIM( string )",
      description: "Возвращает строку string без знаков пробела в начале и конце строки.",
      category: "Строковые",
      keywords: ["обрезка", "пробелы", "очистка", "начало", "конец"]
    },
    {
      name: "REPLACE",
      syntax: "REPLACE( string, substring, replace_with )",
      description: "Ищет подстроку substring в строке string и заменяет ее строкой replace_with.",
      category: "Строковые",
      keywords: ["замена", "поиск", "подстрока", "заменить"]
    },
    {
      name: "SPLIT",
      syntax: "SPLIT( orig_string [ , delimiter [ , part_index ] ] )",
      description: "Разделяет orig_string на последовательность подстрок, используя символ разделителя delimiter.",
      category: "Строковые",
      keywords: ["разделение", "разбивка", "делитель", "массив"]
    }
  ],

  // Функции дат
  date: [
    {
      name: "DATE",
      syntax: "DATE( expression [ , timezone ] )",
      description: "Переводит выражение expression в формат даты.",
      category: "Даты и время",
      keywords: ["дата", "преобразование", "формат", "время"]
    },
    {
      name: "DATEADD",
      syntax: "DATEADD( datetime [ , unit [ , number ] ] )",
      description: "Возвращает дату, полученную в результате добавления unit в количестве number к указанной дате datetime.",
      category: "Даты и время",
      keywords: ["добавление", "дата", "прибавить", "единица", "время"]
    },
    {
      name: "DATETRUNC",
      syntax: "DATETRUNC( datetime, unit [ , number ] )",
      description: "Возвращает дату, округленную по аргументу unit.",
      category: "Даты и время",
      keywords: ["округление", "дата", "единица", "обрезка"]
    },
    {
      name: "YEAR",
      syntax: "YEAR( datetime )",
      description: "Возвращает номер года в указанной дате datetime.",
      category: "Даты и время",
      keywords: ["год", "извлечение", "дата", "номер"]
    },
    {
      name: "MONTH",
      syntax: "MONTH( datetime )",
      description: "Возвращает номер месяца в году в указанной дате datetime.",
      category: "Даты и время",
      keywords: ["месяц", "извлечение", "дата", "номер"]
    },
    {
      name: "DAY",
      syntax: "DAY( datetime )",
      description: "Возвращает номер дня в месяце в указанной дате datetime.",
      category: "Даты и время",
      keywords: ["день", "извлечение", "дата", "номер"]
    },
    {
      name: "NOW",
      syntax: "NOW()",
      description: "Возвращает текущую дату и время в зависимости от источника данных и типа соединения.",
      category: "Даты и время",
      keywords: ["текущая", "дата", "время", "сейчас"]
    },
    {
      name: "TODAY",
      syntax: "TODAY()",
      description: "Возвращает текущую дату в зависимости от источника данных и типа соединения.",
      category: "Даты и время",
      keywords: ["сегодня", "текущая", "дата"]
    }
  ],

  // Агрегатные функции
  aggregate: [
    {
      name: "SUM",
      syntax: "SUM( value )",
      description: "Возвращает сумму всех значений выражения. Работает только с числовыми типами данных.",
      category: "Агрегатные",
      keywords: ["сумма", "сложение", "итого", "общая"]
    },
    {
      name: "SUM_IF",
      syntax: "SUM_IF( expression, condition )",
      description: "Возвращает сумму всех значений выражения, которые удовлетворяют условию condition.",
      category: "Агрегатные",
      keywords: ["сумма", "условие", "если", "фильтр"]
    },
    {
      name: "AVG",
      syntax: "AVG( value )",
      description: "Возвращает среднее для всех значений. Работает с числовыми типами данных и с типами Дата.",
      category: "Агрегатные",
      keywords: ["среднее", "средний", "арифметическое"]
    },
    {
      name: "AVG_IF",
      syntax: "AVG_IF( expression, condition )",
      description: "Возвращает среднее для всех значений, которые удовлетворяют условию condition.",
      category: "Агрегатные",
      keywords: ["среднее", "условие", "если", "фильтр"]
    },
    {
      name: "COUNT",
      syntax: "COUNT( [ value ] )",
      description: "Возвращает количество элементов в группе.",
      category: "Агрегатные",
      keywords: ["количество", "счет", "подсчет", "число"]
    },
    {
      name: "COUNT_IF",
      syntax: "COUNT_IF( condition )",
      description: "Возвращает количество элементов в группе, которые удовлетворяют условию condition.",
      category: "Агрегатные",
      keywords: ["количество", "условие", "если", "фильтр", "счет"]
    },
    {
      name: "MAX",
      syntax: "MAX( value )",
      description: "Возвращает максимальное значение.",
      category: "Агрегатные",
      keywords: ["максимум", "наибольший", "самый", "большой"]
    },
    {
      name: "MIN",
      syntax: "MIN( value )",
      description: "Возвращает минимальное значение.",
      category: "Агрегатные",
      keywords: ["минимум", "наименьший", "самый", "маленький"]
    },
    {
      name: "COUNTD",
      syntax: "COUNTD( value )",
      description: "Возвращает количество уникальных значений в группе.",
      category: "Агрегатные",
      keywords: ["уникальные", "различные", "количество", "счет"]
    }
  ],

  // Логические функции
  logical: [
    {
      name: "IF",
      syntax: "IF condition_1 THEN result_1 [ ELSEIF condition_2 THEN result_2 ... ] ELSE default_result END",
      description: "Проверяет последовательно логические выражения и возвращает соответствующий результат для первого выполнения.",
      category: "Логические",
      keywords: ["если", "условие", "то", "иначе", "проверка"]
    },
    {
      name: "CASE",
      syntax: "CASE expression WHEN value_1 THEN result_1 [ WHEN value_2 THEN result_2 ... ] ELSE default_result END",
      description: "Сравнивает выражение expression с последовательностью значений и возвращает результат для первого совпадения.",
      category: "Логические",
      keywords: ["случай", "когда", "то", "сравнение", "выбор"]
    },
    {
      name: "IFNULL",
      syntax: "IFNULL( check_value, alt_value )",
      description: "Возвращает check_value, если оно не NULL. В противном случае возвращает alt_value.",
      category: "Логические",
      keywords: ["null", "пустой", "альтернатива", "замена"]
    },
    {
      name: "ISNULL",
      syntax: "ISNULL( expression )",
      description: "Возвращает TRUE, если expression является NULL. В противном случае возвращает FALSE.",
      category: "Логические",
      keywords: ["проверка", "null", "пустой", "является"]
    },
    {
      name: "BETWEEN",
      syntax: "value [ NOT ] BETWEEN low AND high",
      description: "Возвращает TRUE, если value принадлежит диапазону значений с low по high включительно.",
      category: "Логические",
      keywords: ["между", "диапазон", "от", "до", "включительно"]
    },
    {
      name: "IN",
      syntax: "item [ NOT ] IN (<list>)",
      description: "Проверяет условие соответствия значения хотя бы одному из значений, перечисленных в IN(...).",
      category: "Логические",
      keywords: ["в", "список", "содержится", "один", "из"]
    }
  ],

  // Оконные функции
  window: [
    {
      name: "RANK",
      syntax: "RANK( value [ , direction ] )",
      description: "Выполняет ранжирование значений с пропусками: возвращает порядковый номер строки при сортировке по value.",
      category: "Оконные",
      keywords: ["ранг", "ранжирование", "порядок", "сортировка"]
    },
    {
      name: "RANK_DENSE",
      syntax: "RANK_DENSE( value [ , direction ] )",
      description: "Выполняет ранжирование значений без пропусков.",
      category: "Оконные",
      keywords: ["плотный", "ранг", "без", "пропусков"]
    },
    {
      name: "LAG",
      syntax: "LAG( value [ , offset [ , default ] ] )",
      description: "Возвращает значение value из строки со смещением offset относительно текущей в рамках заданного окна.",
      category: "Оконные",
      keywords: ["смещение", "предыдущий", "назад", "окно"]
    },
    {
      name: "FIRST",
      syntax: "FIRST( value )",
      description: "Возвращает значение value из первой строки заданного окна.",
      category: "Оконные",
      keywords: ["первый", "начало", "окно", "строка"]
    },
    {
      name: "LAST",
      syntax: "LAST( value )",
      description: "Возвращает значение value из последней строки заданного окна.",
      category: "Оконные",
      keywords: ["последний", "конец", "окно", "строка"]
    }
  ],

  // Функции массивов
  array: [
    {
      name: "ARRAY",
      syntax: "ARRAY( value_1, value_2, value_3 [ , ... ] )",
      description: "Возвращает массив, содержащий переданные элементы.",
      category: "Массивы",
      keywords: ["массив", "создание", "элементы", "список"]
    },
    {
      name: "GET_ITEM",
      syntax: "GET_ITEM( array, index )",
      description: "Возвращает элемент с индексом index из массива array.",
      category: "Массивы",
      keywords: ["элемент", "индекс", "получить", "массив"]
    },
    {
      name: "SLICE",
      syntax: "SLICE( array, offset, length )",
      description: "Возвращает часть массива array длины length, начиная с индекса offset.",
      category: "Массивы",
      keywords: ["срез", "часть", "массив", "длина"]
    },
    {
      name: "CONTAINS",
      syntax: "CONTAINS( array, value )",
      description: "Возвращает TRUE, если array содержит value.",
      category: "Массивы",
      keywords: ["содержит", "проверка", "массив", "значение"]
    },
    {
      name: "UNNEST",
      syntax: "UNNEST( array )",
      description: "Дублирует исходную строку для каждого элемента массива array.",
      category: "Массивы",
      keywords: ["развертывание", "строки", "элементы", "дублирование"]
    }
  ]
};

// Функция поиска по ключевым словам
function searchFunctions(query) {
  const results = [];
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
  
  // Поиск по всем категориям
  Object.values(DATALENS_MEMORY_BANK).forEach(category => {
    category.forEach(func => {
      let score = 0;
      
      // Поиск в названии функции
      if (func.name.toLowerCase().includes(query.toLowerCase())) {
        score += 10;
      }
      
      // Поиск в описании
      searchTerms.forEach(term => {
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
      
      if (score > 0) {
        results.push({ ...func, score });
      }
    });
  });
  
  // Сортировка по релевантности
  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}

// Экспорт для использования в popup.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DATALENS_MEMORY_BANK, searchFunctions };
}