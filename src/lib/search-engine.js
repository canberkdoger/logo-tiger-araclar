/**
 * Logo Tiger SQL Helper - Search Engine
 * Tablo ve alanlarda arama yapma fonksiyonlari
 */

/**
 * Tablolarda arama yapar
 * @param {Array} tables - Tablo listesi
 * @param {string} query - Arama sorgusu
 * @param {Object} options - Arama secenekleri
 * @returns {Array} Eslesen tablolar
 */
export function searchTables(tables, query, options = {}) {
  const {
    searchInFields = true,
    searchInDescription = true,
    caseSensitive = false,
  } = options;

  if (!query || query.trim() === '') {
    return tables;
  }

  const searchQuery = caseSensitive ? query.trim() : query.trim().toLowerCase();

  return tables.filter(table => {
    // Tablo adinda ara
    const tableName = caseSensitive
      ? table.tableName
      : table.tableName.toLowerCase();

    if (tableName.includes(searchQuery)) {
      return true;
    }

    // Display name'de ara
    const displayName = caseSensitive
      ? table.displayName
      : table.displayName.toLowerCase();

    if (displayName.includes(searchQuery)) {
      return true;
    }

    // Aciklamada ara
    if (searchInDescription && table.description) {
      const description = caseSensitive
        ? table.description
        : table.description.toLowerCase();

      if (description.includes(searchQuery)) {
        return true;
      }
    }

    // Alanlarda ara
    if (searchInFields && table.fields) {
      const fieldMatch = table.fields.some(field => {
        const fieldName = caseSensitive
          ? field.name
          : field.name.toLowerCase();

        if (fieldName.includes(searchQuery)) {
          return true;
        }

        if (field.description) {
          const fieldDesc = caseSensitive
            ? field.description
            : field.description.toLowerCase();

          if (fieldDesc.includes(searchQuery)) {
            return true;
          }
        }

        return false;
      });

      if (fieldMatch) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Belirli bir tablonun alanlarinda arama yapar
 * @param {Object} table - Tablo objesi
 * @param {string} query - Arama sorgusu
 * @returns {Array} Eslesen alanlar
 */
export function searchFields(table, query) {
  if (!query || query.trim() === '' || !table.fields) {
    return table.fields || [];
  }

  const searchQuery = query.trim().toLowerCase();

  return table.fields.filter(field => {
    const fieldName = field.name.toLowerCase();
    const fieldDesc = (field.description || '').toLowerCase();
    const fieldType = (field.type || '').toLowerCase();

    return (
      fieldName.includes(searchQuery) ||
      fieldDesc.includes(searchQuery) ||
      fieldType.includes(searchQuery)
    );
  });
}

/**
 * Tablolari kategoriye gore filtreler
 * @param {Array} tables - Tablo listesi
 * @param {string} categoryId - Kategori ID
 * @returns {Array} Filtrelenmis tablolar
 */
export function filterByCategory(tables, categoryId) {
  if (!categoryId || categoryId === 'all') {
    return tables;
  }

  return tables.filter(table => table.category === categoryId);
}

/**
 * Tablolari tipe gore filtreler (period-dependent, period-independent)
 * @param {Array} tables - Tablo listesi
 * @param {string} type - Tablo tipi
 * @returns {Array} Filtrelenmis tablolar
 */
export function filterByType(tables, type) {
  if (!type || type === 'all') {
    return tables;
  }

  return tables.filter(table => table.type === type);
}

/**
 * Tablolari alfabetik siralar
 * @param {Array} tables - Tablo listesi
 * @param {string} sortBy - Siralama alani (tableName, displayName)
 * @param {string} order - Siralama yonu (asc, desc)
 * @returns {Array} Siralanmis tablolar
 */
export function sortTables(tables, sortBy = 'tableName', order = 'asc') {
  return [...tables].sort((a, b) => {
    const valueA = a[sortBy] || '';
    const valueB = b[sortBy] || '';

    const comparison = valueA.localeCompare(valueB, 'tr');
    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * Arama sonuclarini vurgular (highlight)
 * @param {string} text - Metin
 * @param {string} query - Arama sorgusu
 * @returns {Array} Parcalanmis metin (highlight icin)
 */
export function highlightMatches(text, query) {
  if (!query || !text) {
    return [{ text, highlight: false }];
  }

  const parts = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let lastIndex = 0;

  let index = lowerText.indexOf(lowerQuery);
  while (index !== -1) {
    // Onceki normal metin
    if (index > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, index),
        highlight: false,
      });
    }

    // Vurgulanan kisim
    parts.push({
      text: text.slice(index, index + query.length),
      highlight: true,
    });

    lastIndex = index + query.length;
    index = lowerText.indexOf(lowerQuery, lastIndex);
  }

  // Kalan metin
  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      highlight: false,
    });
  }

  return parts.length > 0 ? parts : [{ text, highlight: false }];
}
