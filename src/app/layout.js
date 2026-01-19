import './globals.css';
import Navbar from '@/components/layout/Navbar';
import ThemeProvider from '@/components/layout/ThemeProvider';

export const metadata = {
  title: 'Logo Tiger 3 Araçları',
  description: 'Logo Tiger 3 ERP veritabani sema dokumantasyonu. 557 tablo, alan aciklamalari, iliskiler ve JOIN onerileri. API: /api/schema',
  keywords: ['Logo', 'Tiger 3', 'ERP', 'SQL', 'REST API', 'Veritabani', 'Query Builder', 'Schema', 'Database'],
  authors: [{ name: 'Canberk Doger' }],
  openGraph: {
    title: 'Logo Tiger 3 Araçları - Veritabani Sema Dokumantasyonu',
    description: 'Logo Tiger 3 ERP veritabani sema dokumantasyonu. API endpoint: /api/schema',
    type: 'website',
    locale: 'tr_TR',
  },
  other: {
    'api-endpoint': '/api/schema',
    'api-docs': 'https://logo.canberkdoger.com/api/schema',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebAPI",
              "name": "Logo Tiger 3 SQL Helper API",
              "description": "Logo Tiger 3 ERP veritabani sema bilgilerini sunan REST API. 557 tablo, alan aciklamalari, iliskiler ve JOIN onerileri.",
              "url": "https://logo.canberkdoger.com/api/schema",
              "documentation": "https://logo.canberkdoger.com/api/schema",
              "provider": {
                "@type": "Person",
                "name": "Canberk Doger"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://logo.canberkdoger.com/api/schema/search?q={search_term}",
                "query-input": "required name=search_term"
              }
            })
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
