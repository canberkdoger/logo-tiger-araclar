'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { getCategories, loadAllTables } from '@/lib/schema-loader';
import { filterByCategory } from '@/lib/search-engine';
import { loadSettings, saveSettings } from '@/lib/placeholder-resolver';
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [settings, setSettings] = useState({ firmNo: '001', periodNo: '01' });
  const [loading, setLoading] = useState(true);

  // Autocomplete state'leri
  const [tableSearchText, setTableSearchText] = useState('');
  const [showTableDropdown, setShowTableDropdown] = useState(false);
  const tableAutocompleteRef = useRef(null);

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

  // Autocomplete disina tiklandiginda kapat
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tableAutocompleteRef.current && !tableAutocompleteRef.current.contains(e.target)) {
        setShowTableDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrelenmis tablolar (kategori icin)
  const filteredTables = useMemo(() => {
    let result = tables;

    if (selectedCategory !== 'all') {
      result = filterByCategory(result, selectedCategory);
    }

    return result;
  }, [tables, selectedCategory]);

  // Autocomplete icin filtrelenmis tablolar
  const autocompleteFilteredTables = useMemo(() => {
    let result = filteredTables;

    if (tableSearchText.trim()) {
      const searchLower = tableSearchText.toLowerCase();
      result = result.filter(t =>
        t.tableName.toLowerCase().includes(searchLower) ||
        t.displayName.toLowerCase().includes(searchLower)
      );
    }

    return result.slice(0, 20); // Max 20 sonuc goster
  }, [filteredTables, tableSearchText]);

  // Tablo secildiginde
  const handleTableSelect = (table) => {
    setSelectedTable(table);
    setTableSearchText(table ? `${table.tableName} - ${table.displayName}` : '');
    setShowTableDropdown(false);
  };

  // Autocomplete input degistiginde
  const handleTableSearchChange = (e) => {
    setTableSearchText(e.target.value);
    setShowTableDropdown(true);
    // Eger input temizlendiyse secili tabloyu da temizle
    if (!e.target.value.trim()) {
      setSelectedTable(null);
    }
  };

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

          {/* Tablo Autocomplete */}
          <div className={styles.tableAutocomplete} ref={tableAutocompleteRef}>
            <input
              type="text"
              className={styles.tableSearchInput}
              placeholder="Tablo ara ve sec..."
              value={tableSearchText}
              onChange={handleTableSearchChange}
              onFocus={() => setShowTableDropdown(true)}
            />
            {selectedTable && (
              <button
                className={styles.clearTableButton}
                onClick={() => {
                  setSelectedTable(null);
                  setTableSearchText('');
                }}
                title="Temizle"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
            {showTableDropdown && (
              <div className={styles.tableDropdown}>
                {autocompleteFilteredTables.length === 0 ? (
                  <div className={styles.noResults}>Sonuc bulunamadi</div>
                ) : (
                  autocompleteFilteredTables.map(table => (
                    <div
                      key={table.tableName}
                      className={`${styles.tableOption} ${selectedTable?.tableName === table.tableName ? styles.selected : ''}`}
                      onClick={() => handleTableSelect(table)}
                    >
                      <span className={styles.tableName}>{table.tableName}</span>
                      <span className={styles.tableDisplayName}>{table.displayName}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <PlaceholderConfig onChange={handleSettingsChange} />
      </div>

      {/* Query Builder */}
      <div className={styles.builderContainer}>
        <QueryBuilder
          table={selectedTable}
          allTables={tables}
          settings={settings}
        />
      </div>
    </div>
  );
}
