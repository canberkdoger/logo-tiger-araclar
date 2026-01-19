'use client';

import { useState, useCallback } from 'react';
import styles from './SearchBar.module.css';

/**
 * Arama cubugu componenti
 * @param {Object} props
 * @param {string} props.placeholder - Placeholder metni
 * @param {Function} props.onSearch - Arama callback'i
 * @param {string} props.value - Kontrollü değer
 * @param {Function} props.onChange - Değer değişim callback'i
 */
export default function SearchBar({
  placeholder = 'Tablo veya alan ara...',
  onSearch,
  value,
  onChange,
  className = ''
}) {
  const [internalValue, setInternalValue] = useState('');

  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;

    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }

    if (onSearch) {
      onSearch(newValue);
    }
  }, [onChange, onSearch]);

  const handleClear = useCallback(() => {
    if (onChange) {
      onChange('');
    } else {
      setInternalValue('');
    }

    if (onSearch) {
      onSearch('');
    }
  }, [onChange, onSearch]);

  return (
    <div className={`${styles.searchContainer} ${className}`}>
      <i className={`fas fa-search ${styles.searchIcon}`}></i>
      <input
        type="text"
        className={styles.searchInput}
        placeholder={placeholder}
        value={currentValue}
        onChange={handleChange}
      />
      {currentValue && (
        <button
          className={styles.clearButton}
          onClick={handleClear}
          aria-label="Temizle"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
}
