'use client';

import { useState, useCallback, useMemo } from 'react';
import { getBestJoinSuggestion, getRelatedTableNames } from '@/lib/join-suggester';
import { resolveTableName } from '@/lib/placeholder-resolver';
import styles from './JoinBuilder.module.css';

/**
 * JOIN yonetim komponenti
 * @param {Object} props
 * @param {Object} props.mainTable - Ana tablo objesi
 * @param {Array} props.joinedTables - Eklenmis tablolar [{table, alias, joinConfig}]
 * @param {Array} props.allTables - Tum tablolar (secim icin)
 * @param {Function} props.onJoinedTablesChange - Eklenen tablolar degistiginde
 * @param {Object} props.settings - Placeholder ayarlari
 */
export default function JoinBuilder({
  mainTable,
  joinedTables = [],
  allTables = [],
  onJoinedTablesChange,
  settings = { firmNo: '001', periodNo: '01' }
}) {
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Onerilen tablolar (iliskili olanlar) - alan baglanti bilgisiyle
  const suggestedTablesInfo = useMemo(() => {
    if (!mainTable || !mainTable.relatedTables) return [];
    return mainTable.relatedTables.map(rel => ({
      tableName: rel.table,
      sourceField: rel.field,
      targetField: 'LOGICALREF',
      description: rel.description
    }));
  }, [mainTable]);

  // Sadece tablo isimleri (geri uyumluluk icin)
  const suggestedTableNames = useMemo(() => {
    return suggestedTablesInfo.map(info => info.tableName);
  }, [suggestedTablesInfo]);

  // Filtrelenmis tablolar (arama icin)
  const filteredTables = useMemo(() => {
    if (!allTables.length) return [];

    // Zaten eklenmis tablolari cikar
    const joinedTableNames = joinedTables.map(jt => jt.table.tableName);
    const available = allTables.filter(t =>
      t.tableName !== mainTable?.tableName &&
      !joinedTableNames.includes(t.tableName)
    );

    if (!searchTerm) {
      // Arama yoksa onerilen tablolari one koy
      const suggested = available.filter(t => suggestedTableNames.includes(t.tableName));
      const others = available.filter(t => !suggestedTableNames.includes(t.tableName));
      return [...suggested, ...others].slice(0, 50);
    }

    const term = searchTerm.toLowerCase();
    return available.filter(t =>
      t.tableName.toLowerCase().includes(term) ||
      t.displayName?.toLowerCase().includes(term)
    ).slice(0, 50);
  }, [allTables, mainTable, joinedTables, searchTerm, suggestedTableNames]);

  // Tablo ekle
  const handleAddTable = useCallback((table) => {
    // Mevcut alias'lari topla
    const existingAliases = [
      generateAlias(mainTable.tableName, []),
      ...joinedTables.map(jt => jt.alias)
    ];

    // Yeni tablo icin benzersiz alias olustur
    const newAlias = generateAlias(table.tableName, existingAliases);
    const mainAlias = generateAlias(mainTable.tableName, []);

    // Otomatik JOIN onerisi bul
    const suggestion = getBestJoinSuggestion(mainTable, table);

    const newJoinedTable = {
      id: Date.now(),
      table,
      alias: newAlias,
      joinConfig: suggestion ? {
        type: 'INNER',
        leftTable: mainTable.tableName,
        leftAlias: mainAlias,
        leftField: suggestion.sourceField,
        rightTable: table.tableName,
        rightAlias: newAlias,
        rightField: suggestion.targetField,
        autoSuggested: true,
        description: suggestion.description
      } : {
        type: 'INNER',
        leftTable: mainTable.tableName,
        leftAlias: mainAlias,
        leftField: 'LOGICALREF',
        rightTable: table.tableName,
        rightAlias: newAlias,
        rightField: 'LOGICALREF',
        autoSuggested: false
      }
    };

    onJoinedTablesChange([...joinedTables, newJoinedTable]);
    setShowTablePicker(false);
    setSearchTerm('');
  }, [mainTable, joinedTables, onJoinedTablesChange]);

  // Tablo kaldir
  const handleRemoveTable = useCallback((id) => {
    onJoinedTablesChange(joinedTables.filter(jt => jt.id !== id));
  }, [joinedTables, onJoinedTablesChange]);

  // JOIN tipini degistir
  const handleJoinTypeChange = useCallback((id, type) => {
    onJoinedTablesChange(joinedTables.map(jt =>
      jt.id === id ? { ...jt, joinConfig: { ...jt.joinConfig, type } } : jt
    ));
  }, [joinedTables, onJoinedTablesChange]);

  // JOIN alanlarini degistir
  const handleJoinFieldChange = useCallback((id, side, field) => {
    onJoinedTablesChange(joinedTables.map(jt => {
      if (jt.id !== id) return jt;

      const newConfig = { ...jt.joinConfig, autoSuggested: false };
      if (side === 'left') {
        newConfig.leftField = field;
      } else {
        newConfig.rightField = field;
      }
      return { ...jt, joinConfig: newConfig };
    }));
  }, [joinedTables, onJoinedTablesChange]);

  if (!mainTable) {
    return null;
  }

  const mainAlias = generateAlias(mainTable.tableName);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4>
          <i className="fas fa-link"></i>
          JOIN Tablolari
        </h4>
        <button
          className={styles.addButton}
          onClick={() => setShowTablePicker(true)}
          title="Tablo ekle"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      {/* Ana Tablo Gosterimi */}
      <div className={styles.mainTableInfo}>
        <span className={styles.mainLabel}>FROM</span>
        <code className={styles.tableCode}>
          {resolveTableName(mainTable.tableName, settings.firmNo, settings.periodNo)}
        </code>
        <span className={styles.alias}>{mainAlias}</span>
      </div>

      {/* Eklenmis Tablolar ve JOIN'ler */}
      {joinedTables.length > 0 && (
        <div className={styles.joinList}>
          {joinedTables.map((jt) => (
            <div key={jt.id} className={styles.joinItem}>
              <div className={styles.joinRow}>
                <select
                  className={styles.joinTypeSelect}
                  value={jt.joinConfig.type}
                  onChange={(e) => handleJoinTypeChange(jt.id, e.target.value)}
                >
                  <option value="INNER">INNER JOIN</option>
                  <option value="LEFT">LEFT JOIN</option>
                  <option value="RIGHT">RIGHT JOIN</option>
                </select>

                <code className={styles.tableCode}>
                  {resolveTableName(jt.table.tableName, settings.firmNo, settings.periodNo)}
                </code>
                <span className={styles.alias}>{jt.alias}</span>

                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveTable(jt.id)}
                  title="Kaldir"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className={styles.joinCondition}>
                <span className={styles.onLabel}>ON</span>

                {/* Sol tablo - alan secimi */}
                <select
                  className={styles.fieldSelect}
                  value={jt.joinConfig.leftField}
                  onChange={(e) => handleJoinFieldChange(jt.id, 'left', e.target.value)}
                >
                  {mainTable.fields?.map(f => (
                    <option key={f.name} value={f.name}>
                      {mainAlias}.{f.name}
                    </option>
                  ))}
                </select>

                <span className={styles.equals}>=</span>

                {/* Sag tablo - alan secimi */}
                <select
                  className={styles.fieldSelect}
                  value={jt.joinConfig.rightField}
                  onChange={(e) => handleJoinFieldChange(jt.id, 'right', e.target.value)}
                >
                  {jt.table.fields?.map(f => (
                    <option key={f.name} value={f.name}>
                      {jt.alias}.{f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Otomatik oneri bilgisi */}
              {jt.joinConfig.autoSuggested && jt.joinConfig.description && (
                <div className={styles.suggestion}>
                  <i className="fas fa-lightbulb"></i>
                  {jt.joinConfig.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tablo Secici Modal */}
      {showTablePicker && (
        <div className={styles.pickerOverlay} onClick={() => setShowTablePicker(false)}>
          <div className={styles.pickerModal} onClick={e => e.stopPropagation()}>
            <div className={styles.pickerHeader}>
              <h4>Tablo Sec</h4>
              <button onClick={() => setShowTablePicker(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className={styles.pickerSearch}>
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Tablo ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.pickerList}>
              {suggestedTableNames.length > 0 && !searchTerm && (
                <div className={styles.suggestedSection}>
                  <span className={styles.sectionLabel}>
                    <i className="fas fa-star"></i>
                    Onerilen Tablolar
                  </span>
                </div>
              )}

              {filteredTables.map(table => {
                const suggestionInfo = suggestedTablesInfo.find(s => s.tableName === table.tableName);
                const isSuggested = !!suggestionInfo;
                return (
                  <button
                    key={table.tableName}
                    className={`${styles.tableOption} ${isSuggested ? styles.suggested : ''}`}
                    onClick={() => handleAddTable(table)}
                  >
                    <div className={styles.tableOptionInfo}>
                      <code>{table.tableName}</code>
                      <span>{table.displayName}</span>
                      {suggestionInfo && (
                        <div className={styles.relationInfo}>
                          <i className="fas fa-link"></i>
                          <span className={styles.relationFields}>
                            {suggestionInfo.sourceField} → {suggestionInfo.targetField}
                          </span>
                          {suggestionInfo.description && (
                            <span className={styles.relationDesc}>({suggestionInfo.description})</span>
                          )}
                        </div>
                      )}
                    </div>
                    {isSuggested && (
                      <span className={styles.suggestedBadge}>
                        <i className="fas fa-star"></i>
                      </span>
                    )}
                  </button>
                );
              })}

              {filteredTables.length === 0 && (
                <div className={styles.noResults}>
                  Tablo bulunamadi
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Tablo isiminden benzersiz alias olusturur
 * @param {string} tableName - Tablo adi
 * @param {Array} existingAliases - Mevcut alias'lar
 * @returns {string} Benzersiz alias
 */
function generateAlias(tableName, existingAliases = []) {
  const parts = tableName.split('_');
  let baseAlias = parts[parts.length - 1];

  if (baseAlias === 'XX' || baseAlias === 'XXX') {
    baseAlias = parts[parts.length - 2] || baseAlias;
  }

  // Benzersiz alias olustur
  let alias = baseAlias;
  let counter = 2;
  while (existingAliases.includes(alias)) {
    alias = `${baseAlias}${counter}`;
    counter++;
  }

  return alias;
}
