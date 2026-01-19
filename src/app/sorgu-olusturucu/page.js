'use client';

import { useState, useEffect, useMemo } from 'react';
import { getCategories, loadAllTables } from '@/lib/schema-loader';
import { searchTables, filterByCategory } from '@/lib/search-engine';
import { loadSettings, saveSettings } from '@/lib/placeholder-resolver';
import SearchBar from '@/components/ui/SearchBar';
import PlaceholderConfig from '@/components/config/PlaceholderConfig';
import QueryBuilder from '@/components/query/QueryBuilder';
import styles from './page.module.css';

/**
 * Sorgu Olusturucu Sayfasi
 */
export default function SorguOlusturucuPage() {
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
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

  // Filtrelenmis tablolar
  const filteredTables = useMemo(() => {
    let result = tables;

    if (selectedCategory !== 'all') {
      result = filterByCategory(result, selectedCategory);
    }

    if (searchQuery) {
      result = searchTables(result, searchQuery);
    }

    return result;
  }, [tables, searchQuery, selectedCategory]);

  // Ayarlar degistiginde
  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

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
            placeholder="Tablo ara..."
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

          <select
            className={styles.tableSelect}
            value={selectedTable?.tableName || ''}
            onChange={(e) => {
              const table = tables.find(t => t.tableName === e.target.value);
              setSelectedTable(table || null);
            }}
          >
            <option value="">Tablo sec...</option>
            {filteredTables.map(table => (
              <option key={table.tableName} value={table.tableName}>
                {table.tableName} - {table.displayName}
              </option>
            ))}
          </select>
        </div>

        <PlaceholderConfig onChange={handleSettingsChange} />
      </div>

      {/* Query Builder */}
      <div className={styles.builderContainer}>
        <QueryBuilder
          table={selectedTable}
          settings={settings}
        />
      </div>
    </div>
  );
}
