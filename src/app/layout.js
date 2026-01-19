import './globals.css';
import Navbar from '@/components/layout/Navbar';
import ThemeProvider from '@/components/layout/ThemeProvider';

export const metadata = {
  title: 'Logo Tiger 3 Araçları',
  description: 'Logo Tiger 3 ERP için SQL yardımcısı, REST API rehberi ve geliştirici araçları. Açık kaynak.',
  keywords: ['Logo', 'Tiger 3', 'ERP', 'SQL', 'REST API', 'Veritabani', 'Query Builder'],
  authors: [{ name: 'Canberk Doger' }],
  openGraph: {
    title: 'Logo Tiger 3 Araçları',
    description: 'Logo Tiger 3 ERP için SQL yardımcısı, REST API rehberi ve geliştirici araçları',
    type: 'website',
    locale: 'tr_TR',
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
