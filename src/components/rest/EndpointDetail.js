'use client';

import { useState } from 'react';
import styles from './EndpointDetail.module.css';

/**
 * REST API endpoint detay komponenti
 * @param {Object} props
 * @param {Object} props.endpoint - Endpoint verisi
 * @param {string} props.baseUrl - Base URL
 * @param {Array} props.methods - HTTP method tanimlari
 */
export default function EndpointDetail({ endpoint, baseUrl, methods = [] }) {
  const [copied, setCopied] = useState(false);

  if (!endpoint) {
    return (
      <div className={styles.empty}>
        <i className="fas fa-plug"></i>
        <h3>Endpoint Secin</h3>
        <p>Detaylari gormek icin sol listeden bir endpoint secin</p>
      </div>
    );
  }

  // Method bilgisini al
  const getMethodInfo = (methodName) => {
    return methods.find(m => m.name === methodName) || { name: methodName, color: '#8b949e' };
  };

  // URL'yi kopyala
  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kopyalama hatasi:', err);
    }
  };

  // Ornek URL'ler olustur
  const exampleUrls = {
    GET: `${baseUrl}/${endpoint.endpoint}`,
    GET_SINGLE: `${baseUrl}/${endpoint.endpoint}/{code}`,
    GET_FULL: `${baseUrl}/${endpoint.endpoint}/{code}?ExpandLevel=full`,
    POST: `${baseUrl}/${endpoint.endpoint}`,
    PUT: `${baseUrl}/${endpoint.endpoint}/{code}`,
    PATCH: `${baseUrl}/${endpoint.endpoint}`,
    DELETE: `${baseUrl}/${endpoint.endpoint}/{code}`
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <code className={styles.endpointName}>{endpoint.endpoint}</code>
          <div className={styles.methodBadges}>
            {endpoint.methods?.map((method) => {
              const methodInfo = getMethodInfo(method);
              return (
                <span
                  key={method}
                  className={styles.methodBadge}
                  style={{ backgroundColor: methodInfo.color }}
                >
                  {method}
                </span>
              );
            })}
          </div>
        </div>
        <h2 className={styles.name}>{endpoint.name}</h2>
        {endpoint.description && (
          <p className={styles.description}>{endpoint.description}</p>
        )}
      </div>

      {/* Base URL */}
      <section className={styles.section}>
        <h3>
          <i className="fas fa-link"></i>
          Base URL
        </h3>
        <div className={styles.urlBox}>
          <code>{baseUrl}/{endpoint.endpoint}</code>
          <button
            className={styles.copyButton}
            onClick={() => copyUrl(`${baseUrl}/${endpoint.endpoint}`)}
            title="Kopyala"
          >
            <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
          </button>
        </div>
      </section>

      {/* Kullanim Ornekleri */}
      <section className={styles.section}>
        <h3>
          <i className="fas fa-code"></i>
          Kullanim Ornekleri
        </h3>
        <div className={styles.examples}>
          {endpoint.methods?.includes('GET') && (
            <>
              <div className={styles.exampleItem}>
                <div className={styles.exampleHeader}>
                  <span className={styles.exampleBadge} style={{ backgroundColor: '#61affe' }}>GET</span>
                  <span>Tum kayitlari listele</span>
                </div>
                <code className={styles.exampleCode}>{exampleUrls.GET}</code>
              </div>
              <div className={styles.exampleItem}>
                <div className={styles.exampleHeader}>
                  <span className={styles.exampleBadge} style={{ backgroundColor: '#61affe' }}>GET</span>
                  <span>Tekil kayit getir</span>
                </div>
                <code className={styles.exampleCode}>{exampleUrls.GET_SINGLE}</code>
              </div>
              <div className={styles.exampleItem}>
                <div className={styles.exampleHeader}>
                  <span className={styles.exampleBadge} style={{ backgroundColor: '#61affe' }}>GET</span>
                  <span>Alt kayitlarla beraber getir</span>
                </div>
                <code className={styles.exampleCode}>{exampleUrls.GET_FULL}</code>
              </div>
            </>
          )}
          {endpoint.methods?.includes('POST') && (
            <div className={styles.exampleItem}>
              <div className={styles.exampleHeader}>
                <span className={styles.exampleBadge} style={{ backgroundColor: '#49cc90' }}>POST</span>
                <span>Yeni kayit olustur</span>
              </div>
              <code className={styles.exampleCode}>{exampleUrls.POST}</code>
              <div className={styles.exampleNote}>
                <i className="fas fa-info-circle"></i>
                JSON body ile kayit verileri gonderilir
              </div>
            </div>
          )}
          {endpoint.methods?.includes('PUT') && (
            <div className={styles.exampleItem}>
              <div className={styles.exampleHeader}>
                <span className={styles.exampleBadge} style={{ backgroundColor: '#fca130' }}>PUT</span>
                <span>Kaydi guncelle</span>
              </div>
              <code className={styles.exampleCode}>{exampleUrls.PUT}</code>
              <div className={styles.exampleNote}>
                <i className="fas fa-info-circle"></i>
                GET ile alinan veri degistirilip geri gonderilir
              </div>
            </div>
          )}
          {endpoint.methods?.includes('PATCH') && (
            <div className={styles.exampleItem}>
              <div className={styles.exampleHeader}>
                <span className={styles.exampleBadge} style={{ backgroundColor: '#50e3c2' }}>PATCH</span>
                <span>Belirli alanlari guncelle</span>
              </div>
              <code className={styles.exampleCode}>{exampleUrls.PATCH}</code>
              <div className={styles.exampleNote}>
                <i className="fas fa-info-circle"></i>
                INTERNAL_REFERENCE ile birlikte guncellenecek alanlar gonderilir
              </div>
            </div>
          )}
          {endpoint.methods?.includes('DELETE') && (
            <div className={styles.exampleItem}>
              <div className={styles.exampleHeader}>
                <span className={styles.exampleBadge} style={{ backgroundColor: '#f93e3e' }}>DELETE</span>
                <span>Kaydi sil</span>
              </div>
              <code className={styles.exampleCode}>{exampleUrls.DELETE}</code>
            </div>
          )}
        </div>
      </section>

      {/* Iliskili Tablo */}
      {endpoint.relatedTable && (
        <section className={styles.section}>
          <h3>
            <i className="fas fa-table"></i>
            Iliskili SQL Tablosu
          </h3>
          <div className={styles.relatedTable}>
            <code>{endpoint.relatedTable}</code>
            <a
              href={`/?search=${endpoint.relatedTable}`}
              className={styles.tableLink}
            >
              <i className="fas fa-external-link-alt"></i>
              Tablo Gezgininde Ac
            </a>
          </div>
        </section>
      )}

      {/* Notlar */}
      <section className={styles.section}>
        <h3>
          <i className="fas fa-lightbulb"></i>
          Notlar
        </h3>
        <ul className={styles.notes}>
          <li>Tum isteklerde <code>Authorization: Bearer {'{token}'}</code> header'i gereklidir</li>
          <li>Liste sorgularinda sayfalama icin <code>?$top=100&$skip=0</code> parametreleri kullanilabilir</li>
          <li>Filtreleme icin <code>?$filter=FIELD eq 'value'</code> kullanilabilir</li>
          <li>Siralama icin <code>?$orderby=FIELD desc</code> kullanilabilir</li>
        </ul>
      </section>
    </div>
  );
}
