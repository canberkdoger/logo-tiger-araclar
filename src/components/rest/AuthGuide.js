'use client';

import { useState } from 'react';
import styles from './AuthGuide.module.css';

/**
 * REST API Authentication (Token) rehberi
 */
export default function AuthGuide() {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const tokenRequestBody = `grant_type=password&username={{kullanici_adi}}&firmno={{firma_no}}&password={{sifre}}`;

  const curlExample = `curl -X POST "https://{{sunucu}}/api/v1/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=password&username=ADMIN&firmno=1&password=1234"`;

  const responseExample = `{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}`;

  const authHeaderExample = `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;

  const fullExample = `// 1. Token Al
const tokenResponse = await fetch('https://sunucu/api/v1/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: 'grant_type=password&username=ADMIN&firmno=1&password=1234'
});

const { access_token } = await tokenResponse.json();

// 2. API İsteği Yap
const response = await fetch('https://sunucu/api/v1/items', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${access_token}\`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();`;

  return (
    <div className={styles.container}>
      {/* Giriş */}
      <div className={styles.intro}>
        <h2>Token Tabanlı Kimlik Doğrulama</h2>
        <p>
          Logo REST API, OAuth 2.0 Password Grant yöntemi ile kimlik doğrulama kullanır.
          API'ye erişmeden önce geçerli bir token almanız gerekmektedir.
        </p>
      </div>

      {/* Adım 1: Token Endpoint */}
      <div className={styles.step}>
        <div className={styles.stepHeader}>
          <span className={styles.stepNumber}>1</span>
          <h3>Token Endpoint</h3>
        </div>
        <div className={styles.stepContent}>
          <div className={styles.endpoint}>
            <span className={styles.methodBadge} style={{ background: '#f0c674' }}>POST</span>
            <code>/api/v1/token</code>
          </div>
          <p className={styles.description}>
            Token almak için bu endpoint'e POST isteği göndermeniz gerekir.
          </p>
        </div>
      </div>

      {/* Adım 2: İstek Parametreleri */}
      <div className={styles.step}>
        <div className={styles.stepHeader}>
          <span className={styles.stepNumber}>2</span>
          <h3>İstek Parametreleri</h3>
        </div>
        <div className={styles.stepContent}>
          <table className={styles.paramTable}>
            <thead>
              <tr>
                <th>Parametre</th>
                <th>Değer</th>
                <th>Açıklama</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>grant_type</code></td>
                <td><code>password</code></td>
                <td>OAuth2 grant tipi (sabit değer)</td>
              </tr>
              <tr>
                <td><code>username</code></td>
                <td><code>ADMIN</code></td>
                <td>Logo kullanıcı adı</td>
              </tr>
              <tr>
                <td><code>firmno</code></td>
                <td><code>1</code></td>
                <td>Firma numarası</td>
              </tr>
              <tr>
                <td><code>password</code></td>
                <td><code>****</code></td>
                <td>Kullanıcı şifresi</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
              <span>Request Body (x-www-form-urlencoded)</span>
              <button
                className={styles.copyBtn}
                onClick={() => copyToClipboard(tokenRequestBody, 'body')}
              >
                <i className={copied === 'body' ? 'fas fa-check' : 'fas fa-copy'}></i>
              </button>
            </div>
            <pre><code>{tokenRequestBody}</code></pre>
          </div>
        </div>
      </div>

      {/* Adım 3: cURL Örneği */}
      <div className={styles.step}>
        <div className={styles.stepHeader}>
          <span className={styles.stepNumber}>3</span>
          <h3>cURL Örneği</h3>
        </div>
        <div className={styles.stepContent}>
          <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
              <span>Terminal</span>
              <button
                className={styles.copyBtn}
                onClick={() => copyToClipboard(curlExample, 'curl')}
              >
                <i className={copied === 'curl' ? 'fas fa-check' : 'fas fa-copy'}></i>
              </button>
            </div>
            <pre><code>{curlExample}</code></pre>
          </div>
        </div>
      </div>

      {/* Adım 4: Token Yanıtı */}
      <div className={styles.step}>
        <div className={styles.stepHeader}>
          <span className={styles.stepNumber}>4</span>
          <h3>Token Yanıtı</h3>
        </div>
        <div className={styles.stepContent}>
          <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
              <span>Response (JSON)</span>
              <button
                className={styles.copyBtn}
                onClick={() => copyToClipboard(responseExample, 'response')}
              >
                <i className={copied === 'response' ? 'fas fa-check' : 'fas fa-copy'}></i>
              </button>
            </div>
            <pre><code>{responseExample}</code></pre>
          </div>

          <div className={styles.responseFields}>
            <div className={styles.field}>
              <code>access_token</code>
              <span>API isteklerinde kullanılacak JWT token</span>
            </div>
            <div className={styles.field}>
              <code>token_type</code>
              <span>Token tipi (bearer)</span>
            </div>
            <div className={styles.field}>
              <code>expires_in</code>
              <span>Token geçerlilik süresi (saniye)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Adım 5: Token Kullanımı */}
      <div className={styles.step}>
        <div className={styles.stepHeader}>
          <span className={styles.stepNumber}>5</span>
          <h3>Token Kullanımı</h3>
        </div>
        <div className={styles.stepContent}>
          <p className={styles.description}>
            Aldığınız token'ı her API isteğinde <code>Authorization</code> header'ında göndermeniz gerekir:
          </p>
          <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
              <span>HTTP Header</span>
              <button
                className={styles.copyBtn}
                onClick={() => copyToClipboard(authHeaderExample, 'header')}
              >
                <i className={copied === 'header' ? 'fas fa-check' : 'fas fa-copy'}></i>
              </button>
            </div>
            <pre><code>{authHeaderExample}</code></pre>
          </div>
        </div>
      </div>

      {/* Tam Örnek */}
      <div className={styles.fullExample}>
        <h3>
          <i className="fas fa-code"></i>
          Tam Örnek (JavaScript)
        </h3>
        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>
            <span>JavaScript</span>
            <button
              className={styles.copyBtn}
              onClick={() => copyToClipboard(fullExample, 'full')}
            >
              <i className={copied === 'full' ? 'fas fa-check' : 'fas fa-copy'}></i>
            </button>
          </div>
          <pre><code>{fullExample}</code></pre>
        </div>
      </div>

      {/* Önemli Notlar */}
      <div className={styles.notes}>
        <h3>
          <i className="fas fa-exclamation-circle"></i>
          Önemli Notlar
        </h3>
        <ul className={styles.notesList}>
          <li>
            <i className="fas fa-clock"></i>
            <div>
              <strong>Token Süresi:</strong> Token'lar belirli bir süre sonra geçersiz olur.
              <code>expires_in</code> değerini kontrol edin ve süre dolmadan yeni token alın.
            </div>
          </li>
          <li>
            <i className="fas fa-shield-alt"></i>
            <div>
              <strong>Güvenlik:</strong> Token'ları asla client-side kodda veya public repository'lerde saklamayın.
              Sunucu tarafında güvenli bir şekilde yönetin.
            </div>
          </li>
          <li>
            <i className="fas fa-sync"></i>
            <div>
              <strong>Token Yenileme:</strong> Token süresi dolduğunda 401 Unauthorized hatası alırsınız.
              Bu durumda yeni bir token almanız gerekir.
            </div>
          </li>
          <li>
            <i className="fas fa-server"></i>
            <div>
              <strong>HTTPS:</strong> Tüm API isteklerini HTTPS üzerinden yapın.
              HTTP kullanmak token'ınızın çalınmasına neden olabilir.
            </div>
          </li>
        </ul>
      </div>

      {/* HTTP Durum Kodları */}
      <div className={styles.statusCodes}>
        <h3>
          <i className="fas fa-list-ol"></i>
          HTTP Durum Kodları
        </h3>
        <div className={styles.codesList}>
          <div className={styles.statusCode}>
            <span className={`${styles.code} ${styles.success}`}>200</span>
            <span className={styles.meaning}>Token başarıyla alındı</span>
          </div>
          <div className={styles.statusCode}>
            <span className={`${styles.code} ${styles.error}`}>400</span>
            <span className={styles.meaning}>Geçersiz istek parametreleri</span>
          </div>
          <div className={styles.statusCode}>
            <span className={`${styles.code} ${styles.error}`}>401</span>
            <span className={styles.meaning}>Kimlik doğrulama hatası (yanlış kullanıcı/şifre)</span>
          </div>
          <div className={styles.statusCode}>
            <span className={`${styles.code} ${styles.error}`}>403</span>
            <span className={styles.meaning}>Yetkisiz erişim (firma yetkisi yok)</span>
          </div>
          <div className={styles.statusCode}>
            <span className={`${styles.code} ${styles.error}`}>500</span>
            <span className={styles.meaning}>Sunucu hatası</span>
          </div>
        </div>
      </div>
    </div>
  );
}
