# Logo Tiger 3 Araçları

Logo Tiger 3 ERP sistemi için geliştirilmiş açık kaynaklı geliştirici araçları. SQL sorgu oluşturma, veritabanı şema gezgini ve REST API dokümantasyonu içerir.

🔗 **Canlı Demo:** [logo.canberkdoger.com](https://logo.canberkdoger.com)

![Logo Tiger 3 Araçları](https://img.shields.io/badge/Logo-Tiger%203-c53030)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-61dafb)
![License](https://img.shields.io/badge/License-MIT-green)

## Özellikler

### Tablo Gezgini
- 557 Logo Tiger 3 veritabanı tablosu
- Tablo alanları, indexler ve ilişkiler
- Kategori bazlı filtreleme
- Anlık arama
- Firma/dönem placeholder desteği (XXX → 001, XX → 01)

### Sorgu Oluşturucu
- Görsel SQL sorgu oluşturma arayüzü
- SELECT, WHERE, ORDER BY, JOIN desteği
- Otomatik placeholder dönüşümü
- Sorguyu kopyalama ve indirme

### Hazır Sorgular
- Cari hesap raporları
- Stok ve envanter sorguları
- Fatura ve sipariş analizleri
- Muhasebe raporları
- Banka ve kasa işlemleri

### REST API Rehberi
- 142 Logo REST API endpoint'i
- HTTP metodları rehberi (GET, POST, PUT, PATCH, DELETE)
- Token tabanlı kimlik doğrulama dokümantasyonu
- Endpoint-tablo eşleştirmeleri
- Örnek kullanımlar ve cURL komutları

### Tema Desteği
- Aydınlık / Karanlık mod
- Sistem tercihini otomatik algılama
- Logo kurumsal renk şeması

## Kurulum

```bash
# Repository'yi klonlayın
git clone https://github.com/canberkdoger/logo-tiger-araclar.git

# Proje dizinine gidin
cd logo-tiger-araclar

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3010` adresinde çalışır.

## Production Build

```bash
# Production build oluşturun
npm run build

# Production sunucusunu başlatın
npm start
```

## Proje Yapısı

```
src/
├── app/                    # Next.js App Router sayfaları
│   ├── page.js            # Ana sayfa (Tablo Gezgini)
│   ├── sorgu-olusturucu/  # Sorgu Oluşturucu sayfası
│   ├── hazir-sorgular/    # Hazır Sorgular sayfası
│   ├── rest-api/          # REST API Rehberi sayfası
│   └── hakkinda/          # Hakkında sayfası
├── components/
│   ├── layout/            # Navbar, ThemeProvider
│   ├── tables/            # Tablo bileşenleri
│   ├── query/             # Sorgu oluşturucu bileşenleri
│   ├── rest/              # REST API bileşenleri
│   └── ui/                # Genel UI bileşenleri
├── data/
│   ├── schema.json        # Veritabanı şema tanımları
│   └── rest-schema.json   # REST API endpoint tanımları
└── lib/
    ├── schema-loader.js   # Şema yükleme fonksiyonları
    └── placeholder-resolver.js  # Placeholder dönüştürücü
```

## Placeholder Sistemi

Logo Tiger 3 veritabanında tablolar firma ve dönem numaralarına göre isimlendirilir:

| Placeholder | Açıklama | Örnek |
|-------------|----------|-------|
| `XXX` | Firma numarası (3 haneli) | 001, 002, ... |
| `XX` | Dönem numarası (2 haneli) | 01, 02, ... |

**Örnek:**
- `LG_XXX_CLCARD` → `LG_001_CLCARD` (Cari hesap kartları)
- `LG_XXX_XX_INVOICE` → `LG_001_01_INVOICE` (Faturalar)

## Teknolojiler

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19
- **Styling:** CSS Modules
- **Icons:** Font Awesome 6

## Katkıda Bulunma

1. Bu repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request açın

### Katkı Önerileri
- Yeni tablo tanımları eklemek
- Hazır sorgu şablonları eklemek
- REST API endpoint dokümantasyonu genişletmek
- Hata düzeltmeleri
- Arayüz iyileştirmeleri

## Veri Kaynakları

- Logo Unity Data Dictionary Files Ver. 1.0
- SQL Server metadata sorguları
- Logo REST API dokümantasyonu

## Lisans

Bu proje MIT lisansı ile lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

**Canberk Döğer**
- Website: [canberkdoger.com](https://canberkdoger.com)
- GitHub: [@canberkdoger](https://github.com/canberkdoger)
- LinkedIn: [/in/canberkdoger](https://linkedin.com/in/canberkdoger)

---

⭐ Bu projeyi faydalı bulduysanız yıldız vermeyi unutmayın!
