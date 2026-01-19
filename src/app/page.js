'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getCategories, loadAllTables } from '@/lib/schema-loader';
import { searchTables, filterByCategory } from '@/lib/search-engine';
import { loadSettings, saveSettings } from '@/lib/placeholder-resolver';
import SearchBar from '@/components/ui/SearchBar';
import PlaceholderConfig from '@/components/config/PlaceholderConfig';
import TableList from '@/components/tables/TableList';
import TableDetail from '@/components/tables/TableDetail';
import styles from './page.module.css';

/**
 * Ana sayfa - Tablo Gezgini
 */
export default function HomePage() {
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedTableData, setSelectedTableData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [settings, setSettings] = useState({ firmNo: '001', periodNo: '01' });
  const [loading, setLoading] = useState(true);

  // Verileri yukle
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [loadedTables, loadedCategories, loadedSettings] = await Promise.all([
          loadAllTables(),
          Promise.resolve(getCategories()),
          Promise.resolve(loadSettings())
        ]);

        setTables(loadedTables);
        setCategories(loadedCategories);
        setSettings(loadedSettings);
      } catch (error) {
        console.error('Veri yuklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Tablo secildiginde detay yukle
  useEffect(() => {
    if (selectedTable) {
      const tableData = tables.find(t => t.tableName === selectedTable);
      setSelectedTableData(tableData || null);
    } else {
      setSelectedTableData(null);
    }
  }, [selectedTable, tables]);

  // Filtrelenmiş tablolar
  const filteredTables = useMemo(() => {
    let result = tables;

    // Kategori filtresi
    if (selectedCategory !== 'all') {
      result = filterByCategory(result, selectedCategory);
    }

    // Arama filtresi
    if (searchQuery) {
      result = searchTables(result, searchQuery);
    }

    return result;
  }, [tables, searchQuery, selectedCategory]);

  // Ayarlar degistiginde kaydet
  const handleSettingsChange = useCallback((newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  // Tablo sec
  const handleSelectTable = useCallback((tableName) => {
    setSelectedTable(tableName);
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <i className="fas fa-spinner fa-spin"></i>
        <span>Yukleniyor...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Ust Bar */}
      <div className={styles.topBar}>
        <div className={styles.searchSection}>
          <SearchBar
            placeholder="Tablo veya alan ara..."
            value={searchQuery}
            onChange={setSearchQuery}
          />

          <select
            className={styles.categorySelect}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Tum Kategoriler</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <PlaceholderConfig onChange={handleSettingsChange} />
      </div>

      {/* Ana Icerik */}
      <div className={styles.mainContent}>
        {/* Sol Panel - Tablo Listesi */}
        <aside className={styles.sidebar}>
          <TableList
            tables={filteredTables}
            categories={categories}
            selectedTable={selectedTable}
            onSelectTable={handleSelectTable}
            settings={settings}
          />
        </aside>

        {/* Sag Panel - Tablo Detayi */}
        <main className={styles.detail}>
          <TableDetail
            table={selectedTableData}
            onSelectTable={handleSelectTable}
            settings={settings}
          />
        </main>
      </div>

      {/* Alt Bilgi */}
      <footer className={styles.footer}>
        <div className={styles.footerInfo}>
          <span>{tables.length} tablo</span>
          <span className={styles.separator}>|</span>
          <span>Logo Tiger 3 ERP</span>
        </div>
        <div className={styles.footerLinks}>
          <a
            href="https://github.com/canberkdoger/logo-tiger-sql-helper"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-github"></i>
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
