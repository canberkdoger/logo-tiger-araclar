'use client';

import { useState, useMemo } from 'react';
import { resolveTableName } from '@/lib/placeholder-resolver';
import styles from './TableList.module.css';

/**
 * Tablo listesi componenti (sol panel)
 * @param {Object} props
 * @param {Array} props.tables - Tablo listesi
 * @param {Array} props.categories - Kategori listesi
 * @param {string} props.selectedTable - Secili tablo adi
 * @param {Function} props.onSelectTable - Tablo secim callback'i
 * @param {Object} props.settings - Placeholder ayarlari
 */
export default function TableList({
  tables = [],
  categories = [],
  selectedTable,
  onSelectTable,
  settings = { firmNo: '001', periodNo: '01' }
}) {
  const [expandedCategories, setExpandedCategories] = useState(() => {
    // Tum kategorileri acik baslat
    return categories.reduce((acc, cat) => {
      acc[cat.id] = true;
      return acc;
    }, {});
  });

  // Tablolari kategoriye gore grupla
  const groupedTables = useMemo(() => {
    const grouped = {};

    categories.forEach(cat => {
      grouped[cat.id] = {
        category: cat,
        tables: []
      };
    });

    tables.forEach(table => {
      const categoryId = table.category || 'diger';
      if (grouped[categoryId]) {
        grouped[categoryId].tables.push(table);
      } else {
        if (!grouped['diger']) {
          grouped['diger'] = {
            category: { id: 'diger', name: 'Diger', icon: 'fa-folder' },
            tables: []
          };
        }
        grouped['diger'].tables.push(table);
      }
    });

    return grouped;
  }, [tables, categories]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'cari-hesap': 'fa-users',
      'stok': 'fa-boxes-stacked',
      'fatura': 'fa-file-invoice',
      'siparis': 'fa-shopping-cart',
      'muhasebe': 'fa-calculator',
      'banka': 'fa-building-columns',
      'kasa': 'fa-cash-register',
      'cek-senet': 'fa-money-check',
      'uretim': 'fa-industry',
      'satis': 'fa-chart-line',
      'sistem': 'fa-cog'
    };
    return icons[category.id] || category.icon || 'fa-folder';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Tablolar</h3>
        <span className={styles.count}>{tables.length}</span>
      </div>

      <div className={styles.list}>
        {Object.entries(groupedTables).map(([categoryId, { category, tables: categoryTables }]) => {
          if (categoryTables.length === 0) return null;

          const isExpanded = expandedCategories[categoryId];

          return (
            <div key={categoryId} className={styles.categoryGroup}>
              <button
                className={styles.categoryHeader}
                onClick={() => toggleCategory(categoryId)}
              >
                <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} ${styles.chevron}`}></i>
                <i className={`fas ${getCategoryIcon(category)} ${styles.categoryIcon}`}></i>
                <span className={styles.categoryName}>{category.name}</span>
                <span className={styles.categoryCount}>{categoryTables.length}</span>
              </button>

              {isExpanded && (
                <div className={styles.tableItems}>
                  {categoryTables.map(table => {
                    const resolvedName = resolveTableName(
                      table.tableName,
                      settings.firmNo,
                      settings.periodNo
                    );
                    const isSelected = selectedTable === table.tableName;

                    return (
                      <button
                        key={table.tableName}
                        className={`${styles.tableItem} ${isSelected ? styles.selected : ''}`}
                        onClick={() => onSelectTable(table.tableName)}
                      >
                        <div className={styles.tableInfo}>
                          <span className={styles.tableName}>{resolvedName}</span>
                          <span className={styles.tableDisplayName}>{table.displayName}</span>
                        </div>
                        <span className={styles.tableType}>
                          {table.type === 'period-dependent' && (
                            <i className="fas fa-calendar" title="Donem Bagimli"></i>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
