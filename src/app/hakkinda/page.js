import styles from './page.module.css';

/**
 * Hakkinda Sayfasi
 */
export default function HakkindaPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Hero */}
        <section className={styles.hero}>
          <h1>Logo Tiger 3 Araçları</h1>
          <p className={styles.subtitle}>
            Logo Tiger 3 ERP için SQL yardımcısı, REST API rehberi ve geliştirici araçları
          </p>
          <div className={styles.badges}>
            <span className={styles.badge}>
              <i className="fas fa-code-branch"></i>
              Acik Kaynak
            </span>
            <span className={styles.badge}>
              <i className="fab fa-react"></i>
              Next.js 16
            </span>
          </div>
        </section>

        {/* Ozellikler */}
        <section className={styles.features}>
          <h2>Ozellikler</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <i className="fas fa-database"></i>
              <h3>Tablo Gezgini</h3>
              <p>
                Logo Tiger 3 veritabanindaki tum tablolari, alanlarini,
                indexlerini ve iliskilerini inceleyin.
              </p>
            </div>

            <div className={styles.featureCard}>
              <i className="fas fa-code"></i>
              <h3>Sorgu Olusturucu</h3>
              <p>
                Gorsel arayuz ile SQL sorgulari olusturun. SELECT, WHERE,
                ORDER BY ifadelerini kolayca ekleyin.
              </p>
            </div>

            <div className={styles.featureCard}>
              <i className="fas fa-list"></i>
              <h3>Hazir Sorgular</h3>
              <p>
                Cari hesap, stok, fatura ve muhasebe islemleri icin
                hazir sorgu sablonlarini kullanin.
              </p>
            </div>

            <div className={styles.featureCard}>
              <i className="fas fa-copy"></i>
              <h3>Kolay Aktarim</h3>
              <p>
                Olusturdugumuz SQL sorgularini panoya kopyalayin veya
                .sql dosyasi olarak indirin.
              </p>
            </div>

            <div className={styles.featureCard}>
              <i className="fas fa-cloud"></i>
              <h3>REST API Rehberi</h3>
              <p>
                Logo REST API endpoint'lerini keşfedin, HTTP metodlarını
                öğrenin ve token tabanlı kimlik doğrulamayı uygulayın.
              </p>
            </div>
          </div>
        </section>

        {/* Placeholder */}
        <section className={styles.placeholder}>
          <h2>Placeholder Sistemi</h2>
          <p>
            Logo Tiger 3 veritabaninda tablolar firma ve donem numaralarina
            gore isimlendirilir. Bu uygulama otomatik olarak placeholder
            degistirmesi yapar:
          </p>
          <div className={styles.placeholderExamples}>
            <div className={styles.placeholderItem}>
              <code>LG_<span className={styles.highlight}>XXX</span>_CLCARD</code>
              <span className={styles.arrow}>→</span>
              <code>LG_<span className={styles.highlight}>001</span>_CLCARD</code>
              <span className={styles.label}>Firma Numarasi</span>
            </div>
            <div className={styles.placeholderItem}>
              <code>LG_XXX_<span className={styles.highlight}>XX</span>_INVOICE</code>
              <span className={styles.arrow}>→</span>
              <code>LG_001_<span className={styles.highlight}>01</span>_INVOICE</code>
              <span className={styles.label}>Donem Numarasi</span>
            </div>
          </div>
        </section>

        {/* Katki */}
        <section className={styles.contribute}>
          <h2>Katki Saglayin</h2>
          <p>
            Bu proje acik kaynaklidir. Yeni tablolar ekleyebilir, hatalari
            duzeltebilir veya yeni ozellikler onerebilirsiniz.
          </p>
          <div className={styles.links}>
            <a
              href="https://github.com/canberkdoger/logo-tiger-araclar"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              <i className="fab fa-github"></i>
              GitHub
            </a>
            <a
              href="https://github.com/canberkdoger/logo-tiger-araclar/issues"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.issueLink}
            >
              <i className="fas fa-bug"></i>
              Hata Bildir
            </a>
          </div>
        </section>

        {/* Gelistirici */}
        <section className={styles.developer}>
          <h2>Gelistirici</h2>
          <div className={styles.developerCard}>
            <div className={styles.developerInfo}>
              <h3>Canberk Döğer</h3>
            </div>
            <div className={styles.developerLinks}>
              <a
                href="https://canberkdoger.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fas fa-globe"></i>
              </a>
              <a
                href="https://github.com/canberkdoger"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-github"></i>
              </a>
              <a
                href="https://linkedin.com/in/canberkdoger"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </section>

        {/* Lisans */}
        <section className={styles.license}>
          <p>
            <i className="fas fa-balance-scale"></i>
            MIT Lisansi ile yayinlanmistir. © 2025 Canberk Doger
          </p>
        </section>
      </div>
    </div>
  );
}
