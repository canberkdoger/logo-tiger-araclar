'use client';

import { useState, useMemo } from 'react';
import restSchema from '@/data/rest-schema.json';
import EndpointList from '@/components/rest/EndpointList';
import EndpointDetail from '@/components/rest/EndpointDetail';
import MethodGuide from '@/components/rest/MethodGuide';
import AuthGuide from '@/components/rest/AuthGuide';
import SearchBar from '@/components/ui/SearchBar';
import styles from './page.module.css';

/**
 * REST API Dokumantasyon Sayfasi
 */
export default function RestApiPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [activeTab, setActiveTab] = useState('endpoints'); // 'endpoints', 'methods', 'auth'

  // Filtrelenmis endpointler
  const filteredEndpoints = useMemo(() => {
    let result = restSchema.endpoints;

    // Kategori filtresi
    if (selectedCategory !== 'all') {
      result = result.filter(ep => ep.category === selectedCategory);
    }

    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(ep =>
        ep.endpoint.toLowerCase().includes(query) ||
        ep.name.toLowerCase().includes(query) ||
        (ep.description && ep.description.toLowerCase().includes(query))
      );
    }

    return result;
  }, [searchQuery, selectedCategory]);

  // Secili endpoint detayi
  const selectedEndpointData = useMemo(() => {
    if (!selectedEndpoint) return null;
    return restSchema.endpoints.find(ep => ep.endpoint === selectedEndpoint);
  }, [selectedEndpoint]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1>
              <i className="fas fa-plug"></i>
              Logo REST API
            </h1>
            <p className={styles.subtitle}>
              Logo Tiger 3 ERP REST API dokumantasyonu ve kullanim rehberi
            </p>
          </div>
          <a
            href={restSchema.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.docsLink}
          >
            <i className="fas fa-external-link-alt"></i>
            Resmi Dokumanlar
          </a>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'endpoints' ? styles.active : ''}`}
            onClick={() => setActiveTab('endpoints')}
          >
            <i className="fas fa-list"></i>
            Endpointler
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'methods' ? styles.active : ''}`}
            onClick={() => setActiveTab('methods')}
          >
            <i className="fas fa-exchange-alt"></i>
            HTTP Methodlari
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'auth' ? styles.active : ''}`}
            onClick={() => setActiveTab('auth')}
          >
            <i className="fas fa-key"></i>
            Kimlik Dogrulama
          </button>
        </div>
      </header>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === 'endpoints' && (
          <>
            {/* Filter Bar */}
            <div className={styles.filterBar}>
              <SearchBar
                placeholder="Endpoint veya islem ara..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
              <select
                className={styles.categorySelect}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Tum Kategoriler</option>
                {restSchema.categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
              {/* Endpoint List */}
              <aside className={styles.sidebar}>
                <div className={styles.listHeader}>
                  <span>{filteredEndpoints.length} endpoint</span>
                </div>
                <EndpointList
                  endpoints={filteredEndpoints}
                  categories={restSchema.categories}
                  selectedEndpoint={selectedEndpoint}
                  onSelectEndpoint={setSelectedEndpoint}
                  methods={restSchema.methods}
                />
              </aside>

              {/* Endpoint Detail */}
              <main className={styles.detail}>
                <EndpointDetail
                  endpoint={selectedEndpointData}
                  baseUrl={restSchema.baseUrl}
                  methods={restSchema.methods}
                />
              </main>
            </div>
          </>
        )}

        {activeTab === 'methods' && (
          <MethodGuide methods={restSchema.methods} baseUrl={restSchema.baseUrl} />
        )}

        {activeTab === 'auth' && (
          <AuthGuide authentication={restSchema.authentication} baseUrl={restSchema.baseUrl} />
        )}
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInfo}>
          <span>{restSchema.endpoints.length} endpoint</span>
          <span className={styles.separator}>|</span>
          <span>v{restSchema.version}</span>
          <span className={styles.separator}>|</span>
          <span>Logo Objects REST Service</span>
        </div>
      </footer>
    </div>
  );
}
