/**
 * Logo Tiger SQL Helper - Query Builder Library
 * SQL sorgusu olusturma fonksiyonlari
 */

/**
 * SELECT sorgusunu olusturur
 * @param {Object} options - Sorgu secenekleri
 * @returns {string} SQL sorgusu
 */
export function buildSelectQuery(options) {
  const {
    tableName,
    fields = ['*'],
    where = [],
    orderBy = [],
    limit = null,
    distinct = false
  } = options;

  const parts = [];

  // SELECT
  const selectFields = fields.length > 0 ? fields.join(', ') : '*';
  parts.push(`SELECT ${distinct ? 'DISTINCT ' : ''}${selectFields}`);

  // FROM
  parts.push(`FROM ${tableName}`);

  // WHERE
  if (where.length > 0) {
    const whereClauses = where.map(buildWhereClause).filter(Boolean);
    if (whereClauses.length > 0) {
      parts.push(`WHERE ${whereClauses.join(' AND ')}`);
    }
  }

  // ORDER BY
  if (orderBy.length > 0) {
    const orderClauses = orderBy.map(o => `${o.field} ${o.direction || 'ASC'}`);
    parts.push(`ORDER BY ${orderClauses.join(', ')}`);
  }

  // LIMIT (TOP for SQL Server)
  if (limit) {
    // SQL Server'da TOP kullanilir
    parts[0] = parts[0].replace('SELECT', `SELECT TOP ${limit}`);
  }

  return parts.join('\n');
}

/**
 * Tek bir WHERE kosulunu olusturur
 * @param {Object} condition - Kosul objesi
 * @returns {string} WHERE kosulu
 */
export function buildWhereClause(condition) {
  const { field, operator, value, value2 } = condition;

  if (!field || !operator) return null;

  switch (operator) {
    case 'eq':
      return `${field} = ${formatValue(value)}`;

    case 'neq':
      return `${field} <> ${formatValue(value)}`;

    case 'gt':
      return `${field} > ${formatValue(value)}`;

    case 'gte':
      return `${field} >= ${formatValue(value)}`;

    case 'lt':
      return `${field} < ${formatValue(value)}`;

    case 'lte':
      return `${field} <= ${formatValue(value)}`;

    case 'like':
      return `${field} LIKE ${formatValue(`%${value}%`)}`;

    case 'startsWith':
      return `${field} LIKE ${formatValue(`${value}%`)}`;

    case 'endsWith':
      return `${field} LIKE ${formatValue(`%${value}`)}`;

    case 'in':
      const values = value.split(',').map(v => formatValue(v.trim()));
      return `${field} IN (${values.join(', ')})`;

    case 'notIn':
      const notValues = value.split(',').map(v => formatValue(v.trim()));
      return `${field} NOT IN (${notValues.join(', ')})`;

    case 'between':
      return `${field} BETWEEN ${formatValue(value)} AND ${formatValue(value2)}`;

    case 'isNull':
      return `${field} IS NULL`;

    case 'isNotNull':
      return `${field} IS NOT NULL`;

    default:
      return `${field} = ${formatValue(value)}`;
  }
}

/**
 * Degeri SQL formatina cevirir
 * @param {any} value - Deger
 * @returns {string} Formatlanmis deger
 */
export function formatValue(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }

  // String - tek tirnak ile sar ve escape et
  const escaped = String(value).replace(/'/g, "''");
  return `'${escaped}'`;
}

/**
 * JOIN sorgusunu olusturur
 * @param {Object} options - JOIN secenekleri
 * @returns {string} JOIN ifadesi
 */
export function buildJoin(options) {
  const { type = 'INNER', table, on } = options;

  if (!table || !on) return '';

  const joinTypes = {
    inner: 'INNER JOIN',
    left: 'LEFT JOIN',
    right: 'RIGHT JOIN',
    full: 'FULL OUTER JOIN',
    cross: 'CROSS JOIN'
  };

  const joinType = joinTypes[type.toLowerCase()] || 'INNER JOIN';

  return `${joinType} ${table} ON ${on}`;
}

/**
 * Operator listesi
 */
export const OPERATORS = [
  { value: 'eq', label: 'Esit (=)', needsValue: true },
  { value: 'neq', label: 'Esit Degil (<>)', needsValue: true },
  { value: 'gt', label: 'Buyuk (>)', needsValue: true },
  { value: 'gte', label: 'Buyuk Esit (>=)', needsValue: true },
  { value: 'lt', label: 'Kucuk (<)', needsValue: true },
  { value: 'lte', label: 'Kucuk Esit (<=)', needsValue: true },
  { value: 'like', label: 'Icerir (LIKE)', needsValue: true },
  { value: 'startsWith', label: 'Ile Baslar', needsValue: true },
  { value: 'endsWith', label: 'Ile Biter', needsValue: true },
  { value: 'in', label: 'Listede (IN)', needsValue: true },
  { value: 'notIn', label: 'Listede Degil (NOT IN)', needsValue: true },
  { value: 'between', label: 'Arasinda (BETWEEN)', needsValue: true, needsValue2: true },
  { value: 'isNull', label: 'Bos (IS NULL)', needsValue: false },
  { value: 'isNotNull', label: 'Dolu (IS NOT NULL)', needsValue: false }
];

/**
 * SQL sorgusunu formatlar (guzel gorunum icin)
 * @param {string} sql - SQL sorgusu
 * @returns {string} Formatlanmis SQL
 */
export function formatSQL(sql) {
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY',
    'GROUP BY', 'HAVING', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN',
    'INNER JOIN', 'FULL OUTER JOIN', 'ON', 'AS', 'DISTINCT',
    'TOP', 'LIMIT', 'OFFSET', 'UNION', 'INSERT', 'UPDATE',
    'DELETE', 'SET', 'VALUES', 'INTO', 'CREATE', 'ALTER',
    'DROP', 'TABLE', 'INDEX', 'VIEW', 'BETWEEN', 'IN',
    'NOT', 'NULL', 'IS', 'LIKE', 'ASC', 'DESC'
  ];

  let formatted = sql;

  // Her anahtar kelimeden once yeni satir ekle (bazi durumlar haric)
  const lineBreakKeywords = ['FROM', 'WHERE', 'AND', 'ORDER BY', 'GROUP BY', 'HAVING', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN'];

  lineBreakKeywords.forEach(keyword => {
    const regex = new RegExp(`\\s+${keyword}\\b`, 'gi');
    formatted = formatted.replace(regex, `\n${keyword}`);
  });

  return formatted.trim();
}

/**
 * SQL sorgusundaki syntax'i analiz eder
 * @param {string} sql - SQL sorgusu
 * @returns {Array} Syntax parcalari
 */
export function tokenizeSQL(sql) {
  const tokens = [];
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER', 'BY',
    'GROUP', 'HAVING', 'JOIN', 'LEFT', 'RIGHT', 'INNER',
    'FULL', 'OUTER', 'ON', 'AS', 'DISTINCT', 'TOP', 'LIMIT',
    'OFFSET', 'UNION', 'INSERT', 'UPDATE', 'DELETE', 'SET',
    'VALUES', 'INTO', 'CREATE', 'ALTER', 'DROP', 'TABLE',
    'INDEX', 'VIEW', 'BETWEEN', 'IN', 'NOT', 'NULL', 'IS',
    'LIKE', 'ASC', 'DESC', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'
  ];

  const functions = [
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'ISNULL',
    'CONVERT', 'CAST', 'DATEPART', 'DATEADD', 'DATEDIFF',
    'GETDATE', 'YEAR', 'MONTH', 'DAY', 'LEN', 'UPPER', 'LOWER',
    'TRIM', 'LTRIM', 'RTRIM', 'SUBSTRING', 'REPLACE', 'CHARINDEX'
  ];

  // Basit tokenizer
  const regex = /('[^']*'|"[^"]*"|\d+\.?\d*|\w+|[^\s])/g;
  let match;

  while ((match = regex.exec(sql)) !== null) {
    const word = match[0];
    const upperWord = word.toUpperCase();

    if (word.startsWith("'") || word.startsWith('"')) {
      tokens.push({ type: 'string', value: word });
    } else if (/^\d+\.?\d*$/.test(word)) {
      tokens.push({ type: 'number', value: word });
    } else if (keywords.includes(upperWord)) {
      tokens.push({ type: 'keyword', value: word });
    } else if (functions.includes(upperWord)) {
      tokens.push({ type: 'function', value: word });
    } else if (/^[(),;*=<>!]+$/.test(word)) {
      tokens.push({ type: 'operator', value: word });
    } else {
      tokens.push({ type: 'identifier', value: word });
    }
  }

  return tokens;
}
