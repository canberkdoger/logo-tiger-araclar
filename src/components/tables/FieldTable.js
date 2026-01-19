'use client';

import { useState, useMemo } from 'react';
import styles from './FieldTable.module.css';

/**
 * Tablo alanlarini gosteren component
 * @param {Object} props
 * @param {Array} props.fields - Alan listesi
 * @param {string} props.searchQuery - Arama sorgusu
 */
export default function FieldTable({ fields = [], searchQuery = '' }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Alanlari filtrele ve sirala
  const displayedFields = useMemo(() => {
    let result = [...fields];

    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(field =>
        field.name?.toLowerCase().includes(query) ||
        field.description?.toLowerCase().includes(query) ||
        field.type?.toLowerCase().includes(query)
      );
    }

    // Siralama
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [fields, searchQuery, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return 'fa-sort';
    return sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  };

  const getTypeColor = (type) => {
    const colors = {
      'Int': 'var(--sql-number)',
      'SmallInt': 'var(--sql-number)',
      'TinyInt': 'var(--sql-number)',
      'Float': 'var(--sql-number)',
      'Numeric': 'var(--sql-number)',
      'Money': 'var(--sql-number)',
      'VarChar': 'var(--sql-string)',
      'NVarChar': 'var(--sql-string)',
      'Char': 'var(--sql-string)',
      'Text': 'var(--sql-string)',
      'DateTime': 'var(--sql-function)',
      'Date': 'var(--sql-function)',
      'Time': 'var(--sql-function)',
      'Bit': 'var(--sql-keyword)'
    };
    return colors[type] || 'var(--text-secondary)';
  };

  if (fields.length === 0) {
    return (
      <div className={styles.empty}>
        <i className="fas fa-table"></i>
        <p>Alan bilgisi bulunamadi</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className={styles.sortable}>
                Alan Adi
                <i className={`fas ${getSortIcon('name')} ${styles.sortIcon}`}></i>
              </th>
              <th onClick={() => handleSort('type')} className={styles.sortable}>
                Tip
                <i className={`fas ${getSortIcon('type')} ${styles.sortIcon}`}></i>
              </th>
              <th>Uzunluk</th>
              <th onClick={() => handleSort('description')} className={styles.sortable}>
                Aciklama
                <i className={`fas ${getSortIcon('description')} ${styles.sortIcon}`}></i>
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedFields.map((field, index) => (
              <tr key={field.name || index}>
                <td>
                  <div className={styles.fieldName}>
                    {field.isPrimaryKey && (
                      <i className="fas fa-key" title="Primary Key"></i>
                    )}
                    <code>{field.name}</code>
                  </div>
                </td>
                <td>
                  <span
                    className={styles.fieldType}
                    style={{ color: getTypeColor(field.type) }}
                  >
                    {field.type}
                  </span>
                </td>
                <td className={styles.length}>
                  {field.length || '-'}
                </td>
                <td className={styles.description}>
                  {field.description}
                  {field.values && field.values.length > 0 && (
                    <div className={styles.values}>
                      {field.values.map((v, i) => (
                        <span key={i} className={styles.value}>
                          <strong>{v.value}:</strong> {v.label}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <span>{displayedFields.length} / {fields.length} alan</span>
      </div>
    </div>
  );
}
