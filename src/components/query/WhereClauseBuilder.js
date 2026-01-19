'use client';

import { useMemo } from 'react';
import { OPERATORS } from '@/lib/query-builder';
import styles from './WhereClauseBuilder.module.css';

/**
 * WHERE kosulu olusturucu component
 * @param {Object} props
 * @param {Array} props.conditions - Kosullar listesi
 * @param {Function} props.onChange - Degisiklik callback'i
 * @param {Array} props.fields - Mevcut alanlar (fullName, tableAlias, name iceren)
 * @param {boolean} props.useFullName - Alan seciminde fullName kullan (JOIN destegi icin)
 */
export default function WhereClauseBuilder({
  conditions = [],
  onChange,
  fields = [],
  useFullName = false
}) {
  // Tablolari grupla (benzersiz alias'lar)
  const tables = useMemo(() => {
    if (!useFullName) return [];

    const tableMap = new Map();
    for (const field of fields) {
      if (field.tableAlias && !tableMap.has(field.tableAlias)) {
        tableMap.set(field.tableAlias, {
          alias: field.tableAlias,
          tableName: field.tableName,
          isMainTable: field.isMainTable
        });
      }
    }
    return Array.from(tableMap.values());
  }, [fields, useFullName]);

  // Secili tabloya gore alanlari filtrele
  const getFieldsForTable = (tableAlias) => {
    if (!tableAlias) return [];
    return fields
      .filter(f => f.tableAlias === tableAlias)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleAddCondition = () => {
    const newCondition = {
      id: Date.now(),
      tableAlias: tables.length > 0 ? tables[0].alias : '',
      field: '',
      operator: 'eq',
      value: '',
      value2: ''
    };
    onChange([...conditions, newCondition]);
  };

  const handleRemoveCondition = (id) => {
    onChange(conditions.filter(c => c.id !== id));
  };

  const handleConditionChange = (id, key, value) => {
    onChange(conditions.map(c => {
      if (c.id !== id) return c;

      const updated = { ...c, [key]: value };

      // Tablo degistiginde field'i sifirla
      if (key === 'tableAlias') {
        updated.field = '';
      }

      return updated;
    }));
  };

  const getOperator = (operatorValue) => {
    return OPERATORS.find(op => op.value === operatorValue);
  };

  // Secili alani getir
  const getSelectedField = (condition) => {
    if (useFullName && condition.tableAlias && condition.field) {
      return fields.find(f => f.tableAlias === condition.tableAlias && f.name === condition.field);
    }
    return fields.find(f => f.name === condition.field);
  };

  // fullName formatinda field dondur
  const getFullFieldName = (condition) => {
    if (useFullName && condition.tableAlias && condition.field) {
      return `${condition.tableAlias}.${condition.field}`;
    }
    return condition.field;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>
          <i className="fas fa-filter"></i>
          WHERE Kosullari
        </h4>
        <button
          className={styles.addButton}
          onClick={handleAddCondition}
        >
          <i className="fas fa-plus"></i>
          Kosul Ekle
        </button>
      </div>

      {conditions.length === 0 ? (
        <div className={styles.empty}>
          <p>Henuz kosul eklenmedi</p>
          <button onClick={handleAddCondition}>
            <i className="fas fa-plus"></i>
            Ilk kosulu ekle
          </button>
        </div>
      ) : (
        <div className={styles.conditions}>
          {conditions.map((condition, index) => {
            const operator = getOperator(condition.operator);
            const tableFields = getFieldsForTable(condition.tableAlias);
            const selectedField = getSelectedField(condition);
            const hasEnumValues = selectedField?.values && selectedField.values.length > 0;

            return (
              <div key={condition.id} className={styles.conditionWrapper}>
                {index > 0 && (
                  <span className={styles.andLabel}>AND</span>
                )}

                {/* Tablo ve Alan Secimi */}
                {useFullName && tables.length > 0 ? (
                  <div className={styles.fieldSelectors}>
                    {/* Tablo Dropdown */}
                    <select
                      className={styles.tableSelect}
                      value={condition.tableAlias || ''}
                      onChange={(e) => handleConditionChange(condition.id, 'tableAlias', e.target.value)}
                    >
                      <option value="">Tablo...</option>
                      {tables.map(t => (
                        <option key={t.alias} value={t.alias}>
                          {t.alias} {t.isMainTable ? '(Ana)' : ''}
                        </option>
                      ))}
                    </select>

                    {/* Alan Dropdown */}
                    <select
                      className={styles.fieldSelect}
                      value={condition.field || ''}
                      onChange={(e) => handleConditionChange(condition.id, 'field', e.target.value)}
                      disabled={!condition.tableAlias}
                      title={tableFields.find(f => f.name === condition.field)?.description || ''}
                    >
                      <option value="">Alan sec...</option>
                      {tableFields.map(field => (
                        <option key={field.name} value={field.name} title={field.description || ''}>
                          {field.name}{field.description ? ` - ${field.description}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <select
                    className={styles.fieldSelect}
                    value={condition.field}
                    onChange={(e) => handleConditionChange(condition.id, 'field', e.target.value)}
                  >
                    <option value="">Alan sec...</option>
                    {fields.map(field => (
                      <option key={field.name} value={field.name} title={field.description || ''}>
                        {field.name}{field.description ? ` - ${field.description}` : ''}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  className={styles.operatorSelect}
                  value={condition.operator}
                  onChange={(e) => handleConditionChange(condition.id, 'operator', e.target.value)}
                >
                  {OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>

                {operator?.needsValue && (
                  hasEnumValues ? (
                    <select
                      className={styles.valueSelect}
                      value={condition.value}
                      onChange={(e) => handleConditionChange(condition.id, 'value', e.target.value)}
                    >
                      <option value="">Deger sec...</option>
                      {selectedField.values.map((v, i) => (
                        <option key={i} value={v.value}>
                          {v.value} - {v.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className={styles.valueInput}
                      placeholder="Deger..."
                      value={condition.value}
                      onChange={(e) => handleConditionChange(condition.id, 'value', e.target.value)}
                    />
                  )
                )}

                {operator?.needsValue2 && (
                  <>
                    <span className={styles.betweenLabel}>ve</span>
                    {hasEnumValues ? (
                      <select
                        className={styles.valueSelect}
                        value={condition.value2}
                        onChange={(e) => handleConditionChange(condition.id, 'value2', e.target.value)}
                      >
                        <option value="">Deger sec...</option>
                        {selectedField.values.map((v, i) => (
                          <option key={i} value={v.value}>
                            {v.value} - {v.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className={styles.valueInput}
                        placeholder="Deger 2..."
                        value={condition.value2}
                        onChange={(e) => handleConditionChange(condition.id, 'value2', e.target.value)}
                      />
                    )}
                  </>
                )}

                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveCondition(condition.id)}
                  title="Kosulu sil"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
