'use client';

import { resolveTableName } from '@/lib/placeholder-resolver';
import styles from './RelationshipViewer.module.css';

/**
 * Tablo iliskilerini gosteren component
 * @param {Object} props
 * @param {Array} props.relatedTables - Iliskili tablo listesi
 * @param {Function} props.onSelectTable - Tablo secim callback'i
 * @param {Object} props.settings - Placeholder ayarlari
 */
export default function RelationshipViewer({
  relatedTables = [],
  onSelectTable,
  settings = { firmNo: '001', periodNo: '01' }
}) {
  if (!relatedTables || relatedTables.length === 0) {
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
        {relatedTables.map((relation, index) => {
          // String veya object formatini destekle
          const tableName = typeof relation === 'string' ? relation : relation.table;
          const description = typeof relation === 'string' ? '' : (relation.description || '');

          const resolvedName = resolveTableName(
            tableName,
            settings.firmNo,
            settings.periodNo
          );

          return (
            <div
              key={tableName || index}
              className={styles.relationCard}
              onClick={() => onSelectTable && onSelectTable(tableName)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.tableInfo}>
                <i className="fas fa-table"></i>
                <div className={styles.names}>
                  <code className={styles.tableName}>{resolvedName}</code>
                  {description && <span className={styles.description}>{description}</span>}
                </div>
              </div>
              <i className="fas fa-arrow-right"></i>
            </div>
          );
        })}
      </div>
    </div>
  );
}
