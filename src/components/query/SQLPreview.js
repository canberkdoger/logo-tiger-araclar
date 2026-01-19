'use client';

import { useMemo } from 'react';
import { tokenizeSQL } from '@/lib/query-builder';
import styles from './SQLPreview.module.css';

/**
 * SQL onizleme componenti (syntax highlighting ile)
 * @param {Object} props
 * @param {string} props.sql - SQL sorgusu
 * @param {Function} props.onCopy - Kopyalama callback'i
 * @param {Function} props.onDownload - Indirme callback'i
 */
export default function SQLPreview({ sql = '', onCopy, onDownload }) {
  // Syntax highlighting
  const highlightedSQL = useMemo(() => {
    if (!sql) return null;

    const tokens = tokenizeSQL(sql);

    return tokens.map((token, index) => {
      const className = styles[token.type] || '';
      return (
        <span key={index} className={className}>
          {token.value}
          {' '}
        </span>
      );
    });
  }, [sql]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      if (onCopy) onCopy();
    } catch (err) {
      console.error('Kopyalama hatasi:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (onDownload) onDownload();
  };

  if (!sql) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <i className="fas fa-code"></i>
          <p>SQL sorgusu olusturmak icin alan secin</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>
          <i className="fas fa-code"></i>
          SQL Onizleme
        </h4>
        <div className={styles.actions}>
          <button className={styles.actionButton} onClick={handleCopy} title="Kopyala">
            <i className="fas fa-copy"></i>
            <span>Kopyala</span>
          </button>
          <button className={styles.actionButton} onClick={handleDownload} title="Indir">
            <i className="fas fa-download"></i>
            <span>Indir</span>
          </button>
        </div>
      </div>

      <div className={styles.codeBlock}>
        <pre className={styles.code}>
          <code>{highlightedSQL}</code>
        </pre>
      </div>
    </div>
  );
}
