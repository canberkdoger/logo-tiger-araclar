'use client';

import styles from './IndexViewer.module.css';

/**
 * Index bilgilerini gosteren component
 * @param {Object} props
 * @param {Array} props.indexes - Index listesi
 */
export default function IndexViewer({ indexes = [] }) {
  if (!indexes || indexes.length === 0) {
    return (
      <div className={styles.empty}>
        <i className="fas fa-key"></i>
        <p>Index bilgisi bulunamadi</p>
      </div>
    );
  }

  const getIndexTypeClass = (type) => {
    switch (type?.toLowerCase()) {
      case 'primary':
        return styles.primary;
      case 'unique':
        return styles.unique;
      default:
        return styles.index;
    }
  };

  const getIndexIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'primary':
        return 'fa-key';
      case 'unique':
        return 'fa-fingerprint';
      default:
        return 'fa-list';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {indexes.map((index, i) => (
          <div key={index.no || i} className={styles.indexCard}>
            <div className={styles.header}>
              <span className={`${styles.badge} ${getIndexTypeClass(index.type)}`}>
                <i className={`fas ${getIndexIcon(index.type)}`}></i>
                {index.type}
              </span>
              <span className={styles.indexNo}>Index #{index.no}</span>
            </div>

            <div className={styles.fields}>
              {index.fields?.map((field, fi) => (
                <span key={fi} className={styles.field}>
                  <code>{field}</code>
                  {fi < index.fields.length - 1 && (
                    <span className={styles.separator}>+</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
