'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { buildSelectQuery } from '@/lib/query-builder';
import { resolveTableName } from '@/lib/placeholder-resolver';
import WhereClauseBuilder from './WhereClauseBuilder';
import JoinBuilder from './JoinBuilder';
import SQLPreview from './SQLPreview';
import styles from './QueryBuilder.module.css';

/**
 * Tablo isiminden alias olusturur
 * @param {string} tableName - Tablo adi
 * @param {Array} existingAliases - Mevcut alias'lar (benzersizlik icin)
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

/**
 * Sorgu olusturucu ana component
 * @param {Object} props
 * @param {Object} props.table - Secili tablo
 * @param {Array} props.allTables - Tum tablolar (JOIN icin)
 * @param {Object} props.settings - Placeholder ayarlari
 */
export default function QueryBuilder({
  table,
  allTables = [],
  settings = { firmNo: '001', periodNo: '01' }
}) {
  // Temel state'ler
  // selectedFields artik obje dizisi: [{id, fullName, alias}]
  const [selectedFields, setSelectedFields] = useState([]);
  const [whereConditions, setWhereConditions] = useState([]);
  const [orderBy, setOrderBy] = useState([]);
  const [distinct, setDistinct] = useState(false);
  const [limit, setLimit] = useState('');
  const [copied, setCopied] = useState(false);

  // Secili alan duzenlemesi icin
  const [editingFieldId, setEditingFieldId] = useState(null);

  // JOIN icin state'ler
  const [joinedTables, setJoinedTables] = useState([]);

  // Alan listesi icin secili tablo (dropdown)
  const [selectedFieldTable, setSelectedFieldTable] = useState('main');

  // Alan arama
  const [fieldSearchTerm, setFieldSearchTerm] = useState('');

  // Ana tablo degistiginde tum state'leri sifirla
  useEffect(() => {
    setSelectedFields([]);
    setWhereConditions([]);
    setOrderBy([]);
    setDistinct(false);
    setLimit('');
    setJoinedTables([]);
    setSelectedFieldTable('main');
    setFieldSearchTerm('');
    setEditingFieldId(null);
  }, [table?.tableName]);

  // Ana tablo alias'i
  const mainAlias = useMemo(() => {
    if (!table) return '';
    return generateAlias(table.tableName);
  }, [table]);

  // Tablo adi coz
  const resolvedTableName = useMemo(() => {
    if (!table) return '';
    return resolveTableName(table.tableName, settings.firmNo, settings.periodNo);
  }, [table, settings]);

  // Tum secili tablolardan alanlari birlestir
  const allFields = useMemo(() => {
    if (!table) return [];

    const fields = [];

    // Ana tablo alanlari
    if (table.fields) {
      for (const field of table.fields) {
        fields.push({
          ...field,
          tableName: table.tableName,
          tableAlias: mainAlias,
          fullName: `${mainAlias}.${field.name}`,
          isMainTable: true
        });
      }
    }

    // Eklenmis tablo alanlari
    for (const jt of joinedTables) {
      if (jt.table.fields) {
        for (const field of jt.table.fields) {
          fields.push({
            ...field,
            tableName: jt.table.tableName,
            tableAlias: jt.alias,
            fullName: `${jt.alias}.${field.name}`,
            isMainTable: false
          });
        }
      }
    }

    return fields;
  }, [table, mainAlias, joinedTables]);

  // JOIN config'lerini olustur
  const joins = useMemo(() => {
    return joinedTables.map(jt => ({
      type: jt.joinConfig.type,
      table: resolveTableName(jt.table.tableName, settings.firmNo, settings.periodNo),
      tableAlias: jt.alias,
      leftTable: resolveTableName(jt.joinConfig.leftTable, settings.firmNo, settings.periodNo),
      leftAlias: jt.joinConfig.leftAlias,
      leftField: jt.joinConfig.leftField,
      rightTable: resolveTableName(jt.joinConfig.rightTable, settings.firmNo, settings.periodNo),
      rightAlias: jt.alias,
      rightField: jt.joinConfig.rightField
    }));
  }, [joinedTables, settings]);

  // SQL sorgusu olustur
  const sql = useMemo(() => {
    if (!table) return '';

    // Secili alanlari formatlayarak SQL icin hazirla (alias varsa AS [...] ile)
    let fields = ['*'];
    if (selectedFields.length > 0) {
      fields = selectedFields.map(f => {
        if (f.alias && f.alias.trim()) {
          return `${f.fullName} AS [${f.alias.trim()}]`;
        }
        return f.fullName;
      });
    }

    // WHERE kosullarini donustur (tableAlias.field formatina)
    const processedWhere = whereConditions
      .filter(c => c.field && c.operator)
      .map(c => ({
        ...c,
        field: c.tableAlias ? `${c.tableAlias}.${c.field}` : c.field
      }));

    // ORDER BY kosullarini donustur (tableAlias.field formatina)
    const processedOrderBy = orderBy
      .filter(o => o.field)
      .map(o => ({
        ...o,
        field: o.tableAlias ? `${o.tableAlias}.${o.field}` : o.field
      }));

    return buildSelectQuery({
      tableName: resolvedTableName,
      tableAlias: mainAlias,
      fields,
      joins,
      where: processedWhere,
      orderBy: processedOrderBy,
      limit: limit ? parseInt(limit) : null,
      distinct
    });
  }, [table, resolvedTableName, mainAlias, selectedFields, joins, whereConditions, orderBy, limit, distinct]);

  // Alan secim toggle
  const handleFieldToggle = useCallback((fullName) => {
    setSelectedFields(prev => {
      const exists = prev.find(f => f.fullName === fullName);
      if (exists) {
        return prev.filter(f => f.fullName !== fullName);
      } else {
        return [...prev, { id: Date.now(), fullName, alias: '' }];
      }
    });
  }, []);

  // Tablo bazinda tumunu sec/kaldir
  const handleSelectAllForTable = useCallback((tableAlias, tableFields) => {
    const fieldNames = tableFields.map(f => `${tableAlias}.${f.name}`);
    const allSelected = fieldNames.every(fn => selectedFields.some(sf => sf.fullName === fn));

    if (allSelected) {
      // Tumunu kaldir
      setSelectedFields(prev => prev.filter(f => !fieldNames.includes(f.fullName)));
    } else {
      // Tumunu ekle (mevcut olmayanlari)
      setSelectedFields(prev => {
        const existingNames = prev.map(f => f.fullName);
        const newFields = fieldNames
          .filter(fn => !existingNames.includes(fn))
          .map((fn, i) => ({ id: Date.now() + i, fullName: fn, alias: '' }));
        return [...prev, ...newFields];
      });
    }
  }, [selectedFields]);

  // Secili alan sirasini degistir
  const handleMoveField = useCallback((index, direction) => {
    setSelectedFields(prev => {
      const newFields = [...prev];
      const newIndex = direction === 'up' ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= newFields.length) return prev;

      [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
      return newFields;
    });
  }, []);

  // Secili alan alias'ini degistir
  const handleFieldAliasChange = useCallback((id, alias) => {
    setSelectedFields(prev =>
      prev.map(f => f.id === id ? { ...f, alias } : f)
    );
  }, []);

  // Secili alani kaldir
  const handleRemoveSelectedField = useCallback((id) => {
    setSelectedFields(prev => prev.filter(f => f.id !== id));
    setEditingFieldId(null);
  }, []);

  // Order by ekle
  const handleAddOrderBy = useCallback(() => {
    setOrderBy(prev => [...prev, {
      id: Date.now(),
      tableAlias: mainAlias || '',
      field: '',
      direction: 'ASC'
    }]);
  }, [mainAlias]);

  // Order by kaldir
  const handleRemoveOrderBy = useCallback((id) => {
    setOrderBy(prev => prev.filter(o => o.id !== id));
  }, []);

  // Order by degistir
  const handleOrderByChange = useCallback((id, key, value) => {
    setOrderBy(prev => prev.map(o => {
      if (o.id !== id) return o;

      const updated = { ...o, [key]: value };

      // Tablo degistiginde field'i sifirla
      if (key === 'tableAlias') {
        updated.field = '';
      }

      return updated;
    }));
  }, []);

  // Kopyalama
  const handleCopy = useCallback(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  // Tablolari alias'a gore grupla (benzersiz key icin id ekle)
  const groupedFields = useMemo(() => {
    const groups = [];

    if (table?.fields) {
      groups.push({
        id: 'main',
        tableName: table.tableName,
        alias: mainAlias,
        displayName: table.displayName,
        fields: table.fields,
        isMainTable: true
      });
    }

    for (const jt of joinedTables) {
      groups.push({
        id: jt.id,
        tableName: jt.table.tableName,
        alias: jt.alias,
        displayName: jt.table.displayName,
        fields: jt.table.fields || [],
        isMainTable: false
      });
    }

    return groups;
  }, [table, mainAlias, joinedTables]);

  // Secili tablo grubu (dropdown'a gore)
  const currentFieldGroup = useMemo(() => {
    if (selectedFieldTable === 'main') {
      return groupedFields.find(g => g.isMainTable);
    }
    // Dropdown string dondurur, id number olabilir - her ikisini de kontrol et
    return groupedFields.find(g => String(g.id) === String(selectedFieldTable)) || groupedFields[0];
  }, [groupedFields, selectedFieldTable]);

  // Benzersiz tablo listesi (WHERE ve ORDER BY icin)
  const uniqueTables = useMemo(() => {
    const tableMap = new Map();
    for (const field of allFields) {
      if (field.tableAlias && !tableMap.has(field.tableAlias)) {
        tableMap.set(field.tableAlias, {
          alias: field.tableAlias,
          tableName: field.tableName,
          isMainTable: field.isMainTable
        });
      }
    }
    return Array.from(tableMap.values());
  }, [allFields]);

  // Belirli bir tablo icin alanlari getir (sirali)
  const getFieldsForTable = useCallback((tableAlias) => {
    if (!tableAlias) return [];
    return allFields
      .filter(f => f.tableAlias === tableAlias)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allFields]);

  // Filtrelenmis ve sirali alanlar
  const filteredAndSortedFields = useMemo(() => {
    if (!currentFieldGroup?.fields) return [];

    let fields = [...currentFieldGroup.fields];

    // Alfabetik siralama (A-Z)
    fields.sort((a, b) => a.name.localeCompare(b.name));

    // Arama filtresi (ad, tip, aciklama ve enum degerlerde ara)
    if (fieldSearchTerm.trim()) {
      const term = fieldSearchTerm.toLowerCase();
      fields = fields.filter(f => {
        // Alan adi
        if (f.name.toLowerCase().includes(term)) return true;
        // Tip
        if (f.type?.toLowerCase().includes(term)) return true;
        // Aciklama
        if (f.description?.toLowerCase().includes(term)) return true;
        // Enum degerler
        if (f.values?.some(v =>
          v.label?.toLowerCase().includes(term) ||
          String(v.value).includes(term)
        )) return true;
        return false;
      });
    }

    return fields;
  }, [currentFieldGroup, fieldSearchTerm]);

  if (!table) {
    return (
      <div className={styles.empty}>
        <i className="fas fa-database"></i>
        <h3>Tablo Secin</h3>
        <p>Sorgu olusturmak icin bir tablo secin</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Tablo Bilgisi */}
      <div className={styles.tableInfo}>
        <code className={styles.tableName}>{resolvedTableName}</code>
        <span className={styles.displayName}>{table.displayName}</span>
        {joinedTables.length > 0 && (
          <span className={styles.joinCount}>
            +{joinedTables.length} tablo
          </span>
        )}
      </div>

      {/* Iliskili Tablolar Bilgisi */}
      {table.relatedTables && table.relatedTables.length > 0 && (
        <div className={styles.relatedTablesInfo}>
          <div className={styles.relatedHeader}>
            <i className="fas fa-project-diagram"></i>
            <span>Iliskili Tablolar ({table.relatedTables.length})</span>
          </div>
          <div className={styles.relatedList}>
            {table.relatedTables.map((rel, index) => (
              <div key={index} className={styles.relatedItem}>
                <div className={styles.relatedConnection}>
                  <span className={styles.relatedField}>{rel.field}</span>
                  <i className="fas fa-arrow-right"></i>
                  <span className={styles.relatedTable}>{rel.table}</span>
                  <span className={styles.relatedTargetField}>.LOGICALREF</span>
                </div>
                {rel.description && (
                  <span className={styles.relatedDesc}>{rel.description}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* JOIN Builder */}
      <JoinBuilder
        mainTable={table}
        joinedTables={joinedTables}
        allTables={allTables}
        onJoinedTablesChange={setJoinedTables}
        settings={settings}
      />

      <div className={styles.builderGrid}>
        {/* Sol Panel - Alan Secimi */}
        <div className={styles.fieldsSection}>
          <div className={styles.sectionHeader}>
            <h4>
              <i className="fas fa-list"></i>
              SELECT Alanlari
            </h4>
            {/* Tablo dropdown */}
            <select
              className={styles.tableDropdown}
              value={selectedFieldTable}
              onChange={(e) => {
                setSelectedFieldTable(e.target.value);
                setFieldSearchTerm('');
              }}
            >
              {groupedFields.map(group => (
                <option key={group.id} value={group.id}>
                  {group.alias} {group.isMainTable ? '(Ana)' : ''} - {selectedFields.filter(f => f.fullName.startsWith(`${group.alias}.`)).length}/{group.fields.length}
                </option>
              ))}
            </select>
          </div>

          {/* Alan Arama */}
          <div className={styles.fieldSearch}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Alan ara..."
              value={fieldSearchTerm}
              onChange={(e) => setFieldSearchTerm(e.target.value)}
            />
            {fieldSearchTerm && (
              <button
                className={styles.clearSearch}
                onClick={() => setFieldSearchTerm('')}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          <div className={styles.fieldsList}>
            {currentFieldGroup && (
              <div className={styles.tableGroup}>
                <div className={styles.tableGroupHeader}>
                  <button
                    className={styles.tableGroupToggle}
                    onClick={() => handleSelectAllForTable(currentFieldGroup.alias, filteredAndSortedFields)}
                  >
                    <span className={styles.tableGroupName}>
                      {currentFieldGroup.isMainTable && <i className="fas fa-star"></i>}
                      {currentFieldGroup.alias}
                    </span>
                    <span className={styles.tableGroupCount}>
                      {filteredAndSortedFields.filter(f => selectedFields.some(sf => sf.fullName === `${currentFieldGroup.alias}.${f.name}`)).length}/{filteredAndSortedFields.length}
                      {fieldSearchTerm && ` (${currentFieldGroup.fields.length} toplam)`}
                    </span>
                  </button>
                </div>

                <div className={styles.tableGroupFields}>
                  {filteredAndSortedFields.length > 0 ? (
                    filteredAndSortedFields.map(field => {
                      const fullName = `${currentFieldGroup.alias}.${field.name}`;
                      return (
                        <label key={fullName} className={styles.fieldItem}>
                          <input
                            type="checkbox"
                            checked={selectedFields.some(sf => sf.fullName === fullName)}
                            onChange={() => handleFieldToggle(fullName)}
                          />
                          <div className={styles.fieldInfo}>
                            <div className={styles.fieldNameRow}>
                              <span className={styles.fieldName}>{field.name}</span>
                              <span className={styles.fieldType}>{field.type}</span>
                            </div>
                            {field.description && (
                              <span className={styles.fieldDescription}>{field.description}</span>
                            )}
                            {field.values && field.values.length > 0 && (
                              <div className={styles.fieldValues}>
                                {field.values.map((v, i) => (
                                  <span key={i} className={styles.fieldValueItem}>
                                    {v.value}: {v.label}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <div className={styles.noFieldsFound}>
                      Alan bulunamadi
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sag Panel - Kosullar */}
        <div className={styles.conditionsSection}>
          {/* Secili Sutunlar Yonetimi */}
          {selectedFields.length > 0 && (
            <div className={styles.selectedFieldsSection}>
              <div className={styles.sectionHeader}>
                <h4>
                  <i className="fas fa-columns"></i>
                  Secili Sutunlar ({selectedFields.length})
                </h4>
                <button
                  className={styles.clearAllButton}
                  onClick={() => setSelectedFields([])}
                  title="Tumunu temizle"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
              <div className={styles.selectedFieldsList}>
                {selectedFields.map((field, index) => {
                  const fieldInfo = allFields.find(f => f.fullName === field.fullName);
                  const isEditing = editingFieldId === field.id;

                  return (
                    <div key={field.id} className={styles.selectedFieldRow}>
                      <div className={styles.fieldOrderControls}>
                        <button
                          className={styles.orderButton}
                          onClick={() => handleMoveField(index, 'up')}
                          disabled={index === 0}
                          title="Yukari tasi"
                        >
                          <i className="fas fa-chevron-up"></i>
                        </button>
                        <span className={styles.fieldIndex}>{index + 1}</span>
                        <button
                          className={styles.orderButton}
                          onClick={() => handleMoveField(index, 'down')}
                          disabled={index === selectedFields.length - 1}
                          title="Asagi tasi"
                        >
                          <i className="fas fa-chevron-down"></i>
                        </button>
                      </div>

                      <div className={styles.selectedFieldInfo}>
                        <span className={styles.selectedFieldName}>
                          {field.fullName}
                        </span>
                        {fieldInfo?.description && (
                          <span className={styles.selectedFieldDesc}>
                            {fieldInfo.description}
                          </span>
                        )}
                      </div>

                      <div className={styles.fieldAliasSection}>
                        {isEditing ? (
                          <input
                            type="text"
                            className={styles.aliasInput}
                            placeholder="Ozel isim (alias)..."
                            value={field.alias}
                            onChange={(e) => handleFieldAliasChange(field.id, e.target.value)}
                            onBlur={() => setEditingFieldId(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setEditingFieldId(null);
                            }}
                            autoFocus
                          />
                        ) : (
                          <button
                            className={styles.aliasButton}
                            onClick={() => setEditingFieldId(field.id)}
                            title={field.alias ? 'Alias\'i duzenle' : 'Alias ekle'}
                          >
                            {field.alias ? (
                              <>
                                <i className="fas fa-tag"></i>
                                <span>{field.alias}</span>
                              </>
                            ) : (
                              <>
                                <i className="fas fa-plus"></i>
                                <span>AS</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <button
                        className={styles.removeFieldButton}
                        onClick={() => handleRemoveSelectedField(field.id)}
                        title="Kaldir"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* WHERE */}
          <WhereClauseBuilder
            conditions={whereConditions}
            onChange={setWhereConditions}
            fields={allFields}
            useFullName={true}
          />

          {/* ORDER BY */}
          <div className={styles.orderBySection}>
            <div className={styles.sectionHeader}>
              <h4>
                <i className="fas fa-sort"></i>
                ORDER BY
              </h4>
              <button
                className={styles.addButton}
                onClick={handleAddOrderBy}
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>

            {orderBy.length > 0 && (
              <div className={styles.orderByList}>
                {orderBy.map(order => {
                  const tableFields = getFieldsForTable(order.tableAlias);
                  return (
                    <div key={order.id} className={styles.orderByRow}>
                      {/* Tablo Dropdown */}
                      <select
                        className={styles.orderByTableSelect}
                        value={order.tableAlias || ''}
                        onChange={(e) => handleOrderByChange(order.id, 'tableAlias', e.target.value)}
                      >
                        <option value="">Tablo...</option>
                        {uniqueTables.map(t => (
                          <option key={t.alias} value={t.alias}>
                            {t.alias} {t.isMainTable ? '(Ana)' : ''}
                          </option>
                        ))}
                      </select>

                      {/* Alan Dropdown */}
                      <select
                        className={styles.orderByFieldSelect}
                        value={order.field || ''}
                        onChange={(e) => handleOrderByChange(order.id, 'field', e.target.value)}
                        disabled={!order.tableAlias}
                        title={tableFields.find(f => f.name === order.field)?.description || ''}
                      >
                        <option value="">Alan sec...</option>
                        {tableFields.map(f => (
                          <option key={f.name} value={f.name} title={f.description || ''}>
                            {f.name}{f.description ? ` - ${f.description}` : ''}
                          </option>
                        ))}
                      </select>

                      {/* Yön Dropdown */}
                      <select
                        value={order.direction}
                        onChange={(e) => handleOrderByChange(order.id, 'direction', e.target.value)}
                      >
                        <option value="ASC">ASC</option>
                        <option value="DESC">DESC</option>
                      </select>

                      <button onClick={() => handleRemoveOrderBy(order.id)}>
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ek Secenekler */}
          <div className={styles.optionsSection}>
            <label className={styles.option}>
              <input
                type="checkbox"
                checked={distinct}
                onChange={(e) => setDistinct(e.target.checked)}
              />
              <span>DISTINCT</span>
            </label>

            <div className={styles.limitOption}>
              <label>TOP</label>
              <input
                type="number"
                placeholder="100"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                min="1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SQL Onizleme */}
      <div className={styles.previewSection}>
        <SQLPreview
          sql={sql}
          onCopy={handleCopy}
        />
        {copied && (
          <div className={styles.copiedToast}>
            <i className="fas fa-check"></i>
            Kopyalandi!
          </div>
        )}
      </div>
    </div>
  );
}
