/**
 * Logo Tiger SQL Helper - Join Suggester
 * Tablolar arasi iliski onerisi
 */

/**
 * Iki tablo arasindaki olasi JOIN'leri onerir
 * @param {Object} sourceTable - Kaynak tablo (relatedTables iceren)
 * @param {Object} targetTable - Hedef tablo
 * @returns {Array} Onerilen JOIN'ler
 */
export function suggestJoins(sourceTable, targetTable) {
  const suggestions = [];

  if (!sourceTable?.relatedTables || !targetTable?.tableName) {
    return suggestions;
  }

  // Kaynak tablonun relatedTables'inda hedef tabloyu ara
  for (const rel of sourceTable.relatedTables) {
    if (rel.table === targetTable.tableName) {
      suggestions.push({
        sourceTable: sourceTable.tableName,
        sourceField: rel.field,
        targetTable: targetTable.tableName,
        targetField: 'LOGICALREF',
        description: rel.description,
        direction: 'forward'
      });
    }
  }

  // Hedef tablonun relatedTables'inda kaynak tabloyu ara (ters iliski)
  if (targetTable.relatedTables) {
    for (const rel of targetTable.relatedTables) {
      if (rel.table === sourceTable.tableName) {
        suggestions.push({
          sourceTable: sourceTable.tableName,
          sourceField: 'LOGICALREF',
          targetTable: targetTable.tableName,
          targetField: rel.field,
          description: rel.description,
          direction: 'reverse'
        });
      }
    }
  }

  return suggestions;
}

/**
 * Tum secili tablolar arasindaki olasi JOIN'leri bulur
 * @param {Object} mainTable - Ana tablo
 * @param {Array} joinedTables - Eklenen tablolar
 * @returns {Array} Tum onerilen JOIN'ler
 */
export function findAllJoinSuggestions(mainTable, joinedTables) {
  const allSuggestions = [];

  if (!mainTable || !joinedTables?.length) {
    return allSuggestions;
  }

  // Ana tablo ile her eklenen tablo arasindaki iliskileri bul
  for (const joinedTable of joinedTables) {
    const suggestions = suggestJoins(mainTable, joinedTable);
    allSuggestions.push({
      targetTable: joinedTable.tableName,
      suggestions
    });
  }

  // Eklenen tablolar arasindaki iliskileri de bul
  for (let i = 0; i < joinedTables.length; i++) {
    for (let j = i + 1; j < joinedTables.length; j++) {
      const suggestions = suggestJoins(joinedTables[i], joinedTables[j]);
      if (suggestions.length > 0) {
        allSuggestions.push({
          sourceTable: joinedTables[i].tableName,
          targetTable: joinedTables[j].tableName,
          suggestions
        });
      }
    }
  }

  return allSuggestions;
}

/**
 * En iyi JOIN onerisini dondurur (varsa)
 * @param {Object} sourceTable - Kaynak tablo
 * @param {Object} targetTable - Hedef tablo
 * @returns {Object|null} En iyi oneri veya null
 */
export function getBestJoinSuggestion(sourceTable, targetTable) {
  const suggestions = suggestJoins(sourceTable, targetTable);

  if (suggestions.length === 0) {
    return null;
  }

  // Forward (dogrudan) iliskileri tercih et
  const forwardSuggestion = suggestions.find(s => s.direction === 'forward');
  if (forwardSuggestion) {
    return forwardSuggestion;
  }

  // Yoksa ilk oneriyi don
  return suggestions[0];
}

/**
 * Tablonun iliskili oldugu tum tablolari listeler
 * @param {Object} table - Tablo objesi
 * @returns {Array} Iliskili tablo isimleri
 */
export function getRelatedTableNames(table) {
  if (!table?.relatedTables) {
    return [];
  }

  return [...new Set(table.relatedTables.map(rel => rel.table))];
}

/**
 * Iki tablo arasinda iliski var mi kontrol eder
 * @param {Object} table1 - Birinci tablo
 * @param {Object} table2 - Ikinci tablo
 * @returns {boolean} Iliski var mi
 */
export function hasRelation(table1, table2) {
  const suggestions = suggestJoins(table1, table2);
  return suggestions.length > 0;
}
