'use client';

import styles from './EndpointList.module.css';

/**
 * REST API endpoint listesi
 * @param {Object} props
 * @param {Array} props.endpoints - Endpoint listesi
 * @param {Array} props.categories - Kategori listesi
 * @param {string} props.selectedEndpoint - Secili endpoint
 * @param {Function} props.onSelectEndpoint - Endpoint secim callback'i
 * @param {Array} props.methods - HTTP method tanimlari
 */
export default function EndpointList({
  endpoints = [],
  categories = [],
  selectedEndpoint,
  onSelectEndpoint,
  methods = []
}) {
  // Method rengini al
  const getMethodColor = (methodName) => {
    const method = methods.find(m => m.name === methodName);
    return method?.color || '#8b949e';
  };

  // Kategori bilgisini al
  const getCategoryInfo = (categoryId) => {
    return categories.find(c => c.id === categoryId) || { name: 'Diger', icon: 'fa-folder' };
  };

  // Kategoriye gore grupla
  const groupedEndpoints = endpoints.reduce((acc, ep) => {
    const catId = ep.category || 'diger';
    if (!acc[catId]) {
      acc[catId] = [];
    }
    acc[catId].push(ep);
    return acc;
  }, {});

  return (
    <div className={styles.container}>
      {Object.entries(groupedEndpoints).map(([categoryId, categoryEndpoints]) => {
        const catInfo = getCategoryInfo(categoryId);
        return (
          <div key={categoryId} className={styles.categoryGroup}>
            <div
              className={styles.categoryHeader}
              style={{ borderLeftColor: catInfo.color }}
            >
              <i className={`fas ${catInfo.icon}`} style={{ color: catInfo.color }}></i>
              <span>{catInfo.name}</span>
              <span className={styles.count}>{categoryEndpoints.length}</span>
            </div>
            <div className={styles.endpointList}>
              {categoryEndpoints.map((endpoint) => (
                <button
                  key={endpoint.endpoint}
                  className={`${styles.endpointItem} ${
                    selectedEndpoint === endpoint.endpoint ? styles.selected : ''
                  }`}
                  onClick={() => onSelectEndpoint(endpoint.endpoint)}
                >
                  <div className={styles.endpointInfo}>
                    <code className={styles.endpointName}>{endpoint.endpoint}</code>
                    <span className={styles.endpointDesc}>{endpoint.name}</span>
                  </div>
                  <div className={styles.methodBadges}>
                    {endpoint.methods?.slice(0, 2).map((method) => (
                      <span
                        key={method}
                        className={styles.methodBadge}
                        style={{ backgroundColor: getMethodColor(method) }}
                      >
                        {method}
                      </span>
                    ))}
                    {endpoint.methods?.length > 2 && (
                      <span className={styles.moreBadge}>+{endpoint.methods.length - 2}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {endpoints.length === 0 && (
        <div className={styles.empty}>
          <i className="fas fa-search"></i>
          <p>Endpoint bulunamadi</p>
        </div>
      )}
    </div>
  );
}
