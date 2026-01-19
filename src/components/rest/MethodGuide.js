'use client';

import styles from './MethodGuide.module.css';

/**
 * HTTP Method Rehberi
 * @param {Object} props
 * @param {Array} props.methods - HTTP method tanimlari
 * @param {string} props.baseUrl - Base URL
 */
export default function MethodGuide({ methods = [], baseUrl }) {
  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <h2>HTTP Methodlari</h2>
        <p>
          Logo REST API, standart HTTP methodlarini kullanir. Her method belirli bir
          islem turune karsilik gelir.
        </p>
      </div>

      <div className={styles.methodGrid}>
        {methods.map((method) => (
          <div key={method.name} className={styles.methodCard}>
            <div className={styles.methodHeader}>
              <span
                className={styles.methodBadge}
                style={{ backgroundColor: method.color }}
              >
                {method.name}
              </span>
            </div>
            <p className={styles.methodDescription}>{method.description}</p>

            <h4>Kullanim</h4>
            <ul className={styles.usageList}>
              {method.usage?.map((usage, idx) => (
                <li key={idx}>
                  <code>{usage}</code>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Ornek Akis */}
      <section className={styles.flowSection}>
        <h3>
          <i className="fas fa-sitemap"></i>
          Ornek Islem Akisi
        </h3>

        <div className={styles.flowDiagram}>
          <div className={styles.flowStep}>
            <div className={styles.flowNumber}>1</div>
            <div className={styles.flowContent}>
              <span className={styles.flowBadge} style={{ backgroundColor: '#49cc90' }}>POST</span>
              <code>{baseUrl}/token</code>
              <p>Token al</p>
            </div>
          </div>
          <div className={styles.flowArrow}>
            <i className="fas fa-arrow-down"></i>
          </div>
          <div className={styles.flowStep}>
            <div className={styles.flowNumber}>2</div>
            <div className={styles.flowContent}>
              <span className={styles.flowBadge} style={{ backgroundColor: '#61affe' }}>GET</span>
              <code>{baseUrl}/Items/MALZEME001?ExpandLevel=full</code>
              <p>Malzeme bilgilerini al</p>
            </div>
          </div>
          <div className={styles.flowArrow}>
            <i className="fas fa-arrow-down"></i>
          </div>
          <div className={styles.flowStep}>
            <div className={styles.flowNumber}>3</div>
            <div className={styles.flowContent}>
              <span className={styles.flowBadge} style={{ backgroundColor: '#fca130' }}>PUT</span>
              <code>{baseUrl}/Items/MALZEME001</code>
              <p>Degisiklikleri kaydet</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className={styles.tipsSection}>
        <h3>
          <i className="fas fa-lightbulb"></i>
          Ipuclari
        </h3>
        <div className={styles.tipsList}>
          <div className={styles.tip}>
            <div className={styles.tipIcon}>
              <i className="fas fa-search"></i>
            </div>
            <div className={styles.tipContent}>
              <h4>ExpandLevel Parametresi</h4>
              <p>
                <code>?ExpandLevel=full</code> parametresi ile iliskili tum alt kayitlari
                tek seferde alabilirsiniz.
              </p>
            </div>
          </div>
          <div className={styles.tip}>
            <div className={styles.tipIcon}>
              <i className="fas fa-filter"></i>
            </div>
            <div className={styles.tipContent}>
              <h4>OData Filtreleme</h4>
              <p>
                <code>?$filter=CODE eq 'ABC'</code> seklinde OData sorgu parametreleri
                kullanarak filtreleme yapabilirsiniz.
              </p>
            </div>
          </div>
          <div className={styles.tip}>
            <div className={styles.tipIcon}>
              <i className="fas fa-sort"></i>
            </div>
            <div className={styles.tipContent}>
              <h4>Siralama</h4>
              <p>
                <code>?$orderby=DATE_ desc</code> ile sonuclari belirli bir alana gore
                siralayabilirsiniz.
              </p>
            </div>
          </div>
          <div className={styles.tip}>
            <div className={styles.tipIcon}>
              <i className="fas fa-list-ol"></i>
            </div>
            <div className={styles.tipContent}>
              <h4>Sayfalama</h4>
              <p>
                <code>?$top=100&$skip=0</code> parametreleri ile buyuk veri setlerinde
                sayfalama yapabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
