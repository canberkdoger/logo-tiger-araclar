'use client';

import { useState, useEffect, useMemo } from 'react';
import { loadSettings, saveSettings, resolveSQL } from '@/lib/placeholder-resolver';
import hazirSorgular from '@/data/queries/hazir-sorgular.json';
import PlaceholderConfig from '@/components/config/PlaceholderConfig';
import SQLPreview from '@/components/query/SQLPreview';
import styles from './page.module.css';

/**
 * Hazir Sorgular Sayfasi
 */
export default function HazirSorgularPage() {
  const [settings, setSettings] = useState({ firmNo: '001', periodNo: '01' });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [copied, setCopied] = useState(false);

  // Ayarlari yukle
  useEffect(() => {
    const loadedSettings = loadSettings();
    setSettings(loadedSettings);

    // Ilk kategoriyi sec
    if (hazirSorgular.categories.length > 0) {
      setSelectedCategory(hazirSorgular.categories[0]);
    }
  }, []);

  // SQL'i placeholder'larla coz
  const resolvedSQL = useMemo(() => {
    if (!selectedQuery) return '';

    return resolveSQL(selectedQuery.sql, {
      firmNo: settings.firmNo,
      donemNo: settings.periodNo
    });
  }, [selectedQuery, settings]);

  // Ayarlar degistiginde
  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Kopyalama
  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      {/* Ust Bar */}
      <div className={styles.topBar}>
        <h1 className={styles.pageTitle}>
          <i className="fas fa-list"></i>
          Hazir Sorgular
        </h1>
        <PlaceholderConfig onChange={handleSettingsChange} />
      </div>

      <div className={styles.mainContent}>
        {/* Sol Panel - Kategori ve Sorgular */}
        <aside className={styles.sidebar}>
          {hazirSorgular.categories.map(category => (
            <div key={category.id} className={styles.categoryGroup}>
              <button
                className={`${styles.categoryHeader} ${selectedCategory?.id === category.id ? styles.active : ''}`}
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedQuery(null);
                }}
              >
                <i className={`fas ${category.icon}`}></i>
                <span>{category.name}</span>
                <span className={styles.queryCount}>{category.queries.length}</span>
              </button>

              {selectedCategory?.id === category.id && (
                <div className={styles.queryList}>
                  {category.queries.map(query => (
                    <button
                      key={query.id}
                      className={`${styles.queryItem} ${selectedQuery?.id === query.id ? styles.selected : ''}`}
                      onClick={() => setSelectedQuery(query)}
                    >
                      <span className={styles.queryName}>{query.name}</span>
                      <span className={styles.queryDesc}>{query.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </aside>

        {/* Sag Panel - Sorgu Detayi */}
        <main className={styles.detail}>
          {selectedQuery ? (
            <div className={styles.queryDetail}>
              <div className={styles.queryHeader}>
                <h2>{selectedQuery.name}</h2>
                <p>{selectedQuery.description}</p>
              </div>

              <div className={styles.previewContainer}>
                <SQLPreview
                  sql={resolvedSQL}
                  onCopy={handleCopy}
                />
                {copied && (
                  <div className={styles.copiedToast}>
                    <i className="fas fa-check"></i>
                    Kopyalandi!
                  </div>
                )}
              </div>

              {/* Placeholder bilgisi */}
              {selectedQuery.sql.includes('{') && (
                <div className={styles.placeholderInfo}>
                  <h4>
                    <i className="fas fa-info-circle"></i>
                    Parametreler
                  </h4>
                  <p>
                    Bu sorgu parametre icermektedir. Sorguda yer alan
                    <code>{'{parametre}'}</code> ifadelerini kendi degerlerinizle degistirin.
                  </p>
                  <div className={styles.parameterList}>
                    {selectedQuery.sql.includes('{cariKod}') && (
                      <span className={styles.parameter}>{'{cariKod}'} → Cari hesap kodu</span>
                    )}
                    {selectedQuery.sql.includes('{stokKod}') && (
                      <span className={styles.parameter}>{'{stokKod}'} → Stok kodu</span>
                    )}
                    {selectedQuery.sql.includes('{faturaNo}') && (
                      <span className={styles.parameter}>{'{faturaNo}'} → Fatura numarasi</span>
                    )}
                    {selectedQuery.sql.includes('{kasaKod}') && (
                      <span className={styles.parameter}>{'{kasaKod}'} → Kasa kodu</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.empty}>
              <i className="fas fa-hand-pointer"></i>
              <h3>Sorgu Secin</h3>
              <p>Detaylarini gormek icin sol panelden bir sorgu secin</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
