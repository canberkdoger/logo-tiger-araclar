'use client';

import { useState } from 'react';
import { resolveTableName } from '@/lib/placeholder-resolver';
import FieldTable from './FieldTable';
import IndexViewer from './IndexViewer';
import RelationshipViewer from './RelationshipViewer';
import styles from './TableDetail.module.css';

/**
 * Tablo detay componenti (sag panel)
 * @param {Object} props
 * @param {Object} props.table - Tablo verisi
 * @param {Function} props.onSelectTable - Baska tabloya gecis callback'i
 * @param {Object} props.settings - Placeholder ayarlari
 */
export default function TableDetail({
  table,
  onSelectTable,
  settings = { firmNo: '001', periodNo: '01' }
}) {
  const [activeTab, setActiveTab] = useState('fields');
  const [fieldSearch, setFieldSearch] = useState('');

  if (!table) {
    return (
      <div className={styles.empty}>
        <i className="fas fa-hand-pointer"></i>
        <h3>Tablo Secin</h3>
        <p>Detaylarini gormek icin sol panelden bir tablo secin</p>
      </div>
    );
  }

  const resolvedName = resolveTableName(
    table.tableName,
    settings.firmNo,
    settings.periodNo
  );

  const tabs = [
    { id: 'fields', label: 'Alanlar', icon: 'fa-list', count: table.fields?.length || 0 },
    { id: 'indexes', label: 'Indexler', icon: 'fa-key', count: table.indexes?.length || 0 },
    { id: 'relations', label: 'Iliskiler', icon: 'fa-project-diagram', count: table.relatedTables?.length || 0 },
    { id: 'queries', label: 'Ornek Sorgular', icon: 'fa-code', count: table.commonQueries?.length || 0 }
  ];

  const getTypeLabel = (type) => {
    switch (type) {
      case 'period-dependent':
        return 'Donem Bagimli';
      case 'period-independent':
        return 'Donem Bagimsiz';
      case 'program-independent':
        return 'Program Bagimsiz';
      default:
        return type;
    }
  };

  const copyTableName = () => {
    navigator.clipboard.writeText(resolvedName);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.titleRow}>
            <h2 className={styles.tableName}>
              <code>{resolvedName}</code>
            </h2>
            <button
              className={styles.copyButton}
              onClick={copyTableName}
              title="Kopyala"
            >
              <i className="fas fa-copy"></i>
            </button>
          </div>
          <p className={styles.displayName}>{table.displayName}</p>
        </div>

        <div className={styles.badges}>
          <span className={styles.badge}>
            <i className="fas fa-folder"></i>
            {table.category}
          </span>
          <span className={styles.badge}>
            <i className="fas fa-calendar"></i>
            {getTypeLabel(table.type)}
          </span>
          {table.placeholders?.length > 0 && (
            <span className={styles.badge}>
              <i className="fas fa-code"></i>
              {table.placeholders.join(', ')}
            </span>
          )}
        </div>

        {table.description && (
          <p className={styles.description}>{table.description}</p>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`fas ${tab.icon}`}></i>
            <span>{tab.label}</span>
            <span className={styles.tabCount}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.content}>
        {activeTab === 'fields' && (
          <div className={styles.fieldsTab}>
            <div className={styles.fieldSearch}>
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Alan ara..."
                value={fieldSearch}
                onChange={(e) => setFieldSearch(e.target.value)}
              />
            </div>
            <FieldTable
              fields={table.fields || []}
              searchQuery={fieldSearch}
            />
          </div>
        )}

        {activeTab === 'indexes' && (
          <IndexViewer indexes={table.indexes || []} />
        )}

        {activeTab === 'relations' && (
          <RelationshipViewer
            relatedTables={table.relatedTables || []}
            onSelectTable={onSelectTable}
            settings={settings}
          />
        )}

        {activeTab === 'queries' && (
          <div className={styles.queriesTab}>
            {table.commonQueries && table.commonQueries.length > 0 ? (
              <div className={styles.queryList}>
                {table.commonQueries.map((query, index) => (
                  <div key={index} className={styles.queryCard}>
                    <div className={styles.queryHeader}>
                      <span className={styles.queryName}>{query.name}</span>
                      <button
                        className={styles.copyButton}
                        onClick={() => navigator.clipboard.writeText(query.sql)}
                        title="Kopyala"
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                    <p className={styles.queryDesc}>{query.description}</p>
                    <pre className={styles.queryCode}>
                      <code>{query.sql}</code>
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyQueries}>
                <i className="fas fa-code"></i>
                <p>Bu tablo icin ornek sorgu bulunmuyor</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
