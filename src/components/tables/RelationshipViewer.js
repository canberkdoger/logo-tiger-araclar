'use client';

import { useMemo } from 'react';
import { resolveTableName } from '@/lib/placeholder-resolver';
import styles from './RelationshipViewer.module.css';

/**
 * Tablo iliskilerini gosteren component
 * @param {Object} props
 * @param {Object} props.currentTable - Mevcut tablo objesi
 * @param {Array} props.relatedTables - Iliskili tablo listesi
 * @param {Array} props.allTables - Tum tablolar (ters iliski bulmak icin)
 * @param {Function} props.onSelectTable - Tablo secim callback'i
 * @param {Object} props.settings - Placeholder ayarlari
 */
export default function RelationshipViewer({
  currentTable,
  relatedTables = [],
  allTables = [],
  onSelectTable,
  settings = { firmNo: '001', periodNo: '01' }
}) {
  // Iliskili tablolari zenginlestir - ters yonden de field bilgisi bul
  const enrichedRelations = useMemo(() => {
    if (!relatedTables || relatedTables.length === 0) return [];

    return relatedTables.map(relation => {
      const tableName = typeof relation === 'string' ? relation : relation.table;
      let sourceField = typeof relation === 'string' ? '' : (relation.field || '');
      const description = typeof relation === 'string' ? '' : (relation.description || '');

      // Eger field bilgisi yoksa, ters yonden bulmaya calis
      if (!sourceField && allTables.length > 0 && currentTable?.tableName) {
        const relatedTableData = allTables.find(t => t.tableName === tableName);
        if (relatedTableData?.relatedTables) {
          // Iliskili tablonun relatedTables'inda mevcut tabloyu ara
          const reverseRelation = relatedTableData.relatedTables.find(
            r => r.table === currentTable.tableName
          );
          if (reverseRelation?.field) {
            sourceField = reverseRelation.field;
          }
        }
      }

      return {
        tableName,
        sourceField,
        description
      };
    });
  }, [relatedTables, allTables, currentTable]);

  if (!enrichedRelations || enrichedRelations.length === 0) {
    return (
      <div className={styles.empty}>
        <i className="fas fa-project-diagram"></i>
        <p>Iliski bilgisi bulunamadi</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {enrichedRelations.map((relation, index) => {
          const resolvedName = resolveTableName(
            relation.tableName,
            settings.firmNo,
            settings.periodNo
          );

          return (
            <div
              key={relation.tableName || index}
              className={styles.relationCard}
              onClick={() => onSelectTable && onSelectTable(relation.tableName)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.tableInfo}>
                <i className="fas fa-table"></i>
                <div className={styles.names}>
                  <code className={styles.tableName}>{resolvedName}</code>
                  {relation.description && <span className={styles.description}>{relation.description}</span>}
                </div>
              </div>

              {/* Alan baglanti bilgisi */}
              {relation.sourceField && (
                <div className={styles.fieldConnection}>
                  <span className={styles.sourceField}>{relation.sourceField}</span>
                  <i className="fas fa-link"></i>
                  <span className={styles.targetField}>LOGICALREF</span>
                </div>
              )}

              <i className="fas fa-arrow-right"></i>
            </div>
          );
        })}
      </div>
    </div>
  );
}
