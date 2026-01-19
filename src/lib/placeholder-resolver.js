/**
 * Logo Tiger SQL Helper - Placeholder Resolver
 * XXX ve XX placeholder'larini gercek degerlerle degistirir
 */

/**
 * Tablo adindaki placeholder'lari degistirir
 * @param {string} tableName - Tablo adi (ornek: LG_XXX_XX_INVOICE)
 * @param {string} firmNo - Firma numarasi (ornek: 001)
 * @param {string} periodNo - Donem numarasi (ornek: 01)
 * @returns {string} Cozulmus tablo adi
 */
export function resolveTableName(tableName, firmNo = '001', periodNo = '01') {
  // Null/undefined kontrolu
  if (!tableName) {
    return '';
  }

  let resolved = tableName;

  // Firma numarasini degistir
  resolved = resolved.replace(/XXX/g, firmNo);

  // Donem numarasini degistir
  resolved = resolved.replace(/XX/g, periodNo);

  return resolved;
}

/**
 * SQL sorgusundaki tum placeholder'lari degistirir
 * @param {string} sql - SQL sorgusu
 * @param {Object} values - Degistirme degerleri
 * @returns {string} Cozulmus SQL
 */
export function resolveSQL(sql, values = {}) {
  const {
    firmNo = '001',
    donemNo = '01',
    ...customValues
  } = values;

  let resolved = sql;

  // Standart placeholder'lar
  resolved = resolved.replace(/{firmNo}/g, firmNo);
  resolved = resolved.replace(/{donemNo}/g, donemNo);

  // Ozel placeholder'lar
  Object.entries(customValues).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, 'g');
    resolved = resolved.replace(regex, value);
  });

  return resolved;
}

/**
 * Firma numarasini dogrular
 * @param {string} firmNo - Firma numarasi
 * @returns {boolean} Gecerli mi
 */
export function validateFirmNo(firmNo) {
  return /^\d{3}$/.test(firmNo);
}

/**
 * Donem numarasini dogrular
 * @param {string} periodNo - Donem numarasi
 * @returns {boolean} Gecerli mi
 */
export function validatePeriodNo(periodNo) {
  return /^\d{2}$/.test(periodNo);
}

/**
 * Firma numarasini formatlar (sadece rakamlara izin verir)
 * @param {string|number} firmNo - Firma numarasi
 * @returns {string} Formatlanmis numara
 */
export function formatFirmNo(firmNo) {
  // Sadece rakamlari al, max 3 karakter
  return String(firmNo).replace(/\D/g, '').slice(0, 3);
}

/**
 * Donem numarasini formatlar (sadece rakamlara izin verir)
 * @param {string|number} periodNo - Donem numarasi
 * @returns {string} Formatlanmis numara
 */
export function formatPeriodNo(periodNo) {
  // Sadece rakamlari al, max 2 karakter
  return String(periodNo).replace(/\D/g, '').slice(0, 2);
}

/**
 * Firma numarasini tam formata cevirir (basta sifir ekler)
 * @param {string|number} firmNo - Firma numarasi
 * @returns {string} Formatlanmis numara (3 haneli)
 */
export function padFirmNo(firmNo) {
  const num = String(firmNo).replace(/\D/g, '');
  return num.padStart(3, '0').slice(0, 3);
}

/**
 * Donem numarasini tam formata cevirir (basta sifir ekler)
 * @param {string|number} periodNo - Donem numarasi
 * @returns {string} Formatlanmis numara (2 haneli)
 */
export function padPeriodNo(periodNo) {
  const num = String(periodNo).replace(/\D/g, '');
  return num.padStart(2, '0').slice(0, 2);
}

/**
 * localStorage'dan ayarlari yukler
 * @returns {Object} Ayarlar
 */
export function loadSettings() {
  if (typeof window === 'undefined') {
    return { firmNo: '001', periodNo: '01' };
  }

  try {
    const saved = localStorage.getItem('logoSqlSettings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Ayarlar yuklenemedi:', error);
  }

  return { firmNo: '001', periodNo: '01' };
}

/**
 * Ayarlari localStorage'a kaydeder
 * @param {Object} settings - Ayarlar
 */
export function saveSettings(settings) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem('logoSqlSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Ayarlar kaydedilemedi:', error);
  }
}

/**
 * Tablo tipine gore hangi placeholder'larin kullanildigini dondurur
 * @param {string} tableType - Tablo tipi
 * @returns {Array} Kullanilan placeholder'lar
 */
export function getPlaceholdersForType(tableType) {
  switch (tableType) {
    case 'period-dependent':
      return ['XXX', 'XX'];
    case 'period-independent':
      return ['XXX'];
    case 'program-independent':
      return [];
    default:
      return ['XXX'];
  }
}
