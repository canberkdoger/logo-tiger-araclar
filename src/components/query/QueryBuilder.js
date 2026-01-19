'use client';

import { useState, useMemo, useCallback } from 'react';
import { buildSelectQuery } from '@/lib/query-builder';
import { resolveTableName } from '@/lib/placeholder-resolver';
import WhereClauseBuilder from './WhereClauseBuilder';
import SQLPreview from './SQLPreview';
import styles from './QueryBuilder.module.css';

/**
 * Sorgu olusturucu ana component
 * @param {Object} props
 * @param {Object} props.table - Secili tablo
 * @param {Object} props.settings - Placeholder ayarlari
 */
export default function QueryBuilder({
  table,
  settings = { firmNo: '001', periodNo: '01' }
}) {
  const [selectedFields, setSelectedFields] = useState([]);
  const [whereConditions, setWhereConditions] = useState([]);
  const [orderBy, setOrderBy] = useState([]);
  const [distinct, setDistinct] = useState(false);
  const [limit, setLimit] = useState('');
  const [copied, setCopied] = useState(false);

  // Tablo adi coz
  const resolvedTableName = useMemo(() => {
    if (!table) return '';
    return resolveTableName(table.tableName, settings.firmNo, settings.periodNo);
  }, [table, settings]);

  // SQL sorgusu olustur
  const sql = useMemo(() => {
    if (!table) return '';

    const fields = selectedFields.length > 0 ? selectedFields : ['*'];

    return buildSelectQuery({
      tableName: resolvedTableName,
      fields,
      where: whereConditions.filter(c => c.field && c.operator),
      orderBy: orderBy.filter(o => o.field),
      limit: limit ? parseInt(limit) : null,
      distinct
    });
  }, [table, resolvedTableName, selectedFields, whereConditions, orderBy, limit, distinct]);

  // Alan secim toggle
  const handleFieldToggle = useCallback((fieldName) => {
    setSelectedFields(prev => {
      if (prev.includes(fieldName)) {
        return prev.filter(f => f !== fieldName);
      } else {
        return [...prev, fieldName];
      }
    });
  }, []);

  // Tum alanlari sec/kaldir
  const handleSelectAll = useCallback(() => {
    if (!table?.fields) return;

    if (selectedFields.length === table.fields.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields(table.fields.map(f => f.name));
    }
  }, [table, selectedFields]);

  // Order by ekle
  const handleAddOrderBy = useCallback(() => {
    setOrderBy(prev => [...prev, { id: Date.now(), field: '', direction: 'ASC' }]);
  }, []);

  // Order by kaldir
  const handleRemoveOrderBy = useCallback((id) => {
    setOrderBy(prev => prev.filter(o => o.id !== id));
  }, []);

  // Order by degistir
  const handleOrderByChange = useCallback((id, key, value) => {
    setOrderBy(prev => prev.map(o =>
      o.id === id ? { ...o, [key]: value } : o
    ));
  }, []);

  // Kopyalama
  const handleCopy = useCallback(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

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
      </div>

      <div className={styles.builderGrid}>
        {/* Sol Panel - Alan Secimi */}
        <div className={styles.fieldsSection}>
          <div className={styles.sectionHeader}>
            <h4>
              <i className="fas fa-list"></i>
              SELECT Alanlari
            </h4>
            <button
              className={styles.selectAllButton}
              onClick={handleSelectAll}
            >
              {selectedFields.length === table.fields?.length ? 'Hepsini Kaldir' : 'Tumunu Sec'}
            </button>
          </div>

          <div className={styles.fieldsList}>
            {table.fields?.map(field => (
              <label key={field.name} className={styles.fieldItem}>
                <input
                  type="checkbox"
                  checked={selectedFields.includes(field.name)}
                  onChange={() => handleFieldToggle(field.name)}
                />
                <span className={styles.fieldName}>{field.name}</span>
                <span className={styles.fieldType}>{field.type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sag Panel - Kosullar */}
        <div className={styles.conditionsSection}>
          {/* WHERE */}
          <WhereClauseBuilder
            conditions={whereConditions}
            onChange={setWhereConditions}
            fields={table.fields || []}
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
                {orderBy.map(order => (
                  <div key={order.id} className={styles.orderByRow}>
                    <select
                      value={order.field}
                      onChange={(e) => handleOrderByChange(order.id, 'field', e.target.value)}
                    >
                      <option value="">Alan sec...</option>
                      {table.fields?.map(f => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                    <select
                      value={order.direction}
                      onChange={(e) => handleOrderByChange(order.id, 'direction', e.target.value)}
                    >
                      <option value="ASC">Artan (ASC)</option>
                      <option value="DESC">Azalan (DESC)</option>
                    </select>
                    <button onClick={() => handleRemoveOrderBy(order.id)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
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
