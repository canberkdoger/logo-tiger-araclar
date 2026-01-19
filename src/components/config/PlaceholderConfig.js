'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadSettings, saveSettings, formatFirmNo, formatPeriodNo, padFirmNo, padPeriodNo } from '@/lib/placeholder-resolver';
import styles from './PlaceholderConfig.module.css';

/**
 * Firma ve Donem numarasi ayarlari componenti
 * @param {Object} props
 * @param {Function} props.onChange - Ayarlar degistiginde callback
 */
export default function PlaceholderConfig({ onChange }) {
  const [firmNo, setFirmNo] = useState('001');
  const [periodNo, setPeriodNo] = useState('01');

  // Ayarlari yukle
  useEffect(() => {
    const settings = loadSettings();
    setFirmNo(settings.firmNo || '001');
    setPeriodNo(settings.periodNo || '01');
  }, []);

  // Firma numarasi degisikliklerini isle
  const handleFirmNoChange = useCallback((e) => {
    const value = e.target.value;
    const formatted = formatFirmNo(value);
    setFirmNo(formatted);
  }, []);

  // Firma numarasi blur oldugunda kaydet
  const handleFirmNoBlur = useCallback(() => {
    const padded = padFirmNo(firmNo);
    setFirmNo(padded);
    const newSettings = { firmNo: padded, periodNo };
    saveSettings(newSettings);
    if (onChange) onChange(newSettings);
  }, [firmNo, periodNo, onChange]);

  // Donem numarasi degisikliklerini isle
  const handlePeriodNoChange = useCallback((e) => {
    const value = e.target.value;
    const formatted = formatPeriodNo(value);
    setPeriodNo(formatted);
  }, []);

  // Donem numarasi blur oldugunda kaydet
  const handlePeriodNoBlur = useCallback(() => {
    const padded = padPeriodNo(periodNo);
    setPeriodNo(padded);
    const newSettings = { firmNo, periodNo: padded };
    saveSettings(newSettings);
    if (onChange) onChange(newSettings);
  }, [firmNo, periodNo, onChange]);

  return (
    <div className={styles.container}>
      <div className={styles.field}>
        <label className={styles.label}>
          <span className={styles.labelText}>Firma No</span>
          <span className={styles.placeholder}>XXX</span>
        </label>
        <input
          type="text"
          className={styles.input}
          value={firmNo}
          onChange={handleFirmNoChange}
          onBlur={handleFirmNoBlur}
          maxLength={3}
          placeholder="001"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          <span className={styles.labelText}>Donem No</span>
          <span className={styles.placeholder}>XX</span>
        </label>
        <input
          type="text"
          className={styles.input}
          value={periodNo}
          onChange={handlePeriodNoChange}
          onBlur={handlePeriodNoBlur}
          maxLength={2}
          placeholder="01"
        />
      </div>
    </div>
  );
}
