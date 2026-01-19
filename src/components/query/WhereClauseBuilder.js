'use client';

import { OPERATORS } from '@/lib/query-builder';
import styles from './WhereClauseBuilder.module.css';

/**
 * WHERE kosulu olusturucu component
 * @param {Object} props
 * @param {Array} props.conditions - Kosullar listesi
 * @param {Function} props.onChange - Degisiklik callback'i
 * @param {Array} props.fields - Mevcut alanlar
 */
export default function WhereClauseBuilder({
  conditions = [],
  onChange,
  fields = []
}) {
  const handleAddCondition = () => {
    const newCondition = {
      id: Date.now(),
      field: '',
      operator: 'eq',
      value: '',
      value2: ''
    };
    onChange([...conditions, newCondition]);
  };

  const handleRemoveCondition = (id) => {
    onChange(conditions.filter(c => c.id !== id));
  };

  const handleConditionChange = (id, key, value) => {
    onChange(conditions.map(c =>
      c.id === id ? { ...c, [key]: value } : c
    ));
  };

  const getOperator = (operatorValue) => {
    return OPERATORS.find(op => op.value === operatorValue);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>
          <i className="fas fa-filter"></i>
          WHERE Kosullari
        </h4>
        <button
          className={styles.addButton}
          onClick={handleAddCondition}
        >
          <i className="fas fa-plus"></i>
          Kosul Ekle
        </button>
      </div>

      {conditions.length === 0 ? (
        <div className={styles.empty}>
          <p>Henuz kosul eklenmedi</p>
          <button onClick={handleAddCondition}>
            <i className="fas fa-plus"></i>
            Ilk kosulu ekle
          </button>
        </div>
      ) : (
        <div className={styles.conditions}>
          {conditions.map((condition, index) => {
            const operator = getOperator(condition.operator);

            return (
              <div key={condition.id} className={styles.conditionRow}>
                {index > 0 && (
                  <span className={styles.andLabel}>AND</span>
                )}

                <select
                  className={styles.fieldSelect}
                  value={condition.field}
                  onChange={(e) => handleConditionChange(condition.id, 'field', e.target.value)}
                >
                  <option value="">Alan sec...</option>
                  {fields.map(field => (
                    <option key={field.name} value={field.name}>
                      {field.name}
                    </option>
                  ))}
                </select>

                <select
                  className={styles.operatorSelect}
                  value={condition.operator}
                  onChange={(e) => handleConditionChange(condition.id, 'operator', e.target.value)}
                >
                  {OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>

                {operator?.needsValue && (
                  <input
                    type="text"
                    className={styles.valueInput}
                    placeholder="Deger..."
                    value={condition.value}
                    onChange={(e) => handleConditionChange(condition.id, 'value', e.target.value)}
                  />
                )}

                {operator?.needsValue2 && (
                  <>
                    <span className={styles.betweenLabel}>ve</span>
                    <input
                      type="text"
                      className={styles.valueInput}
                      placeholder="Deger 2..."
                      value={condition.value2}
                      onChange={(e) => handleConditionChange(condition.id, 'value2', e.target.value)}
                    />
                  </>
                )}

                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveCondition(condition.id)}
                  title="Kosulu sil"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
