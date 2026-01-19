import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/schema-loader';

/**
 * GET /api/schema
 * Schema API dokumantasyonu - AI'larin sistemi anlamasi icin
 */
export async function GET() {
  const categories = getCategories();

  const documentation = {
    name: "Logo Tiger 3 SQL Helper API",
    version: "1.0.0",
    description: "Logo Tiger 3 ERP veritabani sema bilgilerini sunan API. Bu API, AI sistemlerinin Logo Tiger veritabani yapisini anlamasi ve SQL sorgusu olusturmasi icin tasarlanmistir.",
    baseUrl: "/api/schema",
    endpoints: [
      {
        path: "/api/schema",
        method: "GET",
        description: "API dokumantasyonu ve genel bilgiler"
      },
      {
        path: "/api/schema/tables",
        method: "GET",
        description: "Tum tablolarin listesi (temel bilgilerle)",
        queryParams: [
          { name: "category", description: "Kategori filtresi (ornek: stok, cari, fatura)" }
        ]
      },
      {
        path: "/api/schema/tables/[tableName]",
        method: "GET",
        description: "Belirli bir tablonun detayli bilgileri (alanlar, indexler, iliskiler)",
        example: "/api/schema/tables/LG_XXX_ITEMS"
      },
      {
        path: "/api/schema/categories",
        method: "GET",
        description: "Mevcut tablo kategorileri"
      },
      {
        path: "/api/schema/search",
        method: "GET",
        description: "Tablo ve alan arama - tablo adlari, alan adlari ve aciklamalarda arama yapar",
        queryParams: [
          { name: "q", description: "Arama terimi (en az 2 karakter)", required: true },
          { name: "type", description: "Arama tipi: tables, fields, all (varsayilan: all)" },
          { name: "limit", description: "Maksimum sonuc sayisi (varsayilan: 50)" }
        ],
        example: "/api/schema/search?q=stok&type=all"
      },
      {
        path: "/api/schema/relationships",
        method: "GET",
        description: "Tablo iliskileri, JOIN onerileri ve ornek SQL sorgulari",
        queryParams: [
          { name: "table", description: "Ana tablo adi (opsiyonel - belirtilmezse tum iliskiler)" },
          { name: "depth", description: "Iliski derinligi 1-3 (varsayilan: 1)" }
        ],
        example: "/api/schema/relationships?table=LG_XXX_XX_STLINE&depth=2"
      }
    ],
    categories: categories,
    placeholderInfo: {
      description: "Logo Tiger tablolarinda placeholder'lar kullanilir",
      placeholders: [
        { code: "XXX", description: "Firma numarasi (ornek: 001, 125)", example: "LG_001_ITEMS" },
        { code: "XX", description: "Donem numarasi (ornek: 01, 02)", example: "LG_001_01_STFICHE" }
      ],
      usage: "Tablolari sorgularken XXX yerine firma numarasi, XX yerine donem numarasi yazilmalidir"
    },
    tips: [
      "Tum tablolar LOGICALREF alanini primary key olarak kullanir",
      "Iliskiler genellikle XXXREF (ornek: STOCKREF, CLIENTREF) seklinde adlandirilir",
      "Tarih alanlari DATE_ veya _DATE ile biter",
      "Tutar alanlari genellikle TOTAL, AMOUNT, PRICE icerir",
      "Aktiflik durumu ACTIVE alaniyla kontrol edilir (0: Aktif, 1: Pasif)"
    ],
    commonTables: {
      description: "En sik kullanilan tablolar",
      tables: [
        { name: "LG_XXX_ITEMS", description: "Malzeme (stok) kartlari", category: "stok" },
        { name: "LG_XXX_CLCARD", description: "Cari hesap kartlari", category: "cari" },
        { name: "LG_XXX_XX_STFICHE", description: "Stok fisleri", category: "stok" },
        { name: "LG_XXX_XX_STLINE", description: "Stok fis satirlari", category: "stok" },
        { name: "LG_XXX_XX_INVOICE", description: "Faturalar", category: "fatura" },
        { name: "LG_XXX_XX_ORFICHE", description: "Siparisler", category: "siparis" }
      ]
    },
    aiWorkflow: {
      description: "AI sistemleri icin onerilen is akisi",
      steps: [
        "1. /api/schema/categories ile mevcut kategorileri gor",
        "2. /api/schema/search?q=ARANACAK_TERIM ile ilgili tablolari/alanlari bul",
        "3. /api/schema/tables/TABLO_ADI ile tablo detaylarini al",
        "4. /api/schema/relationships?table=TABLO_ADI ile iliskileri ve JOIN onerilerini al",
        "5. Alan aciklamalari ve enum degerlerini kullanarak dogru WHERE kosullarini olustur",
        "6. Placeholder'lari (XXX, XX) firma ve donem numaralariyla degistir"
      ]
    },
    exampleScenarios: [
      {
        scenario: "Stok karti bilgilerini getir",
        steps: [
          "GET /api/schema/tables/LG_XXX_ITEMS",
          "SQL: SELECT CODE, NAME, STGRPCODE FROM LG_001_ITEMS WHERE ACTIVE = 0"
        ]
      },
      {
        scenario: "Stok hareketlerini malzeme adiyla birlikte getir",
        steps: [
          "GET /api/schema/relationships?table=LG_XXX_XX_STLINE",
          "SQL: SELECT sl.*, i.CODE, i.NAME FROM LG_001_01_STLINE sl LEFT JOIN LG_001_ITEMS i ON sl.STOCKREF = i.LOGICALREF"
        ]
      },
      {
        scenario: "Satis irsaliyelerini malzeme bazli getir",
        description: "STFICHE = Stok fisleri (irsaliyeler), STLINE = Stok fis satirlari, ITEMS = Malzeme kartlari",
        steps: [
          "1. GET /api/schema/tables/LG_XXX_XX_STFICHE - Fis tipleri icin TRCODE alaninin values degerlerine bak",
          "2. GET /api/schema/tables/LG_XXX_XX_STLINE - Satir detaylari icin",
          "3. GET /api/schema/relationships?table=LG_XXX_XX_STLINE - JOIN iliskileri icin"
        ],
        sql: "SELECT sf.FICHENO, sf.DATE_, sl.AMOUNT, i.CODE, i.NAME FROM LG_001_01_STFICHE sf INNER JOIN LG_001_01_STLINE sl ON sf.LOGICALREF = sl.STFICHEREF INNER JOIN LG_001_ITEMS i ON sl.STOCKREF = i.LOGICALREF WHERE sf.TRCODE = 8 -- 8 = Satis irsaliyesi"
      },
      {
        scenario: "Ozel kod aciklamalarini getir",
        description: "SPECODES tablosu ozel kod tanimlarina karsilik gelir. CODETYPE ve SPECODETYPE ile filtrelenir.",
        steps: [
          "1. GET /api/schema/tables/LG_XXX_SPECODES - Ozel kod tablosu",
          "2. CODETYPE: 1=Malzeme, 2=Cari, vs. SPECODETYPE: 1=Ozel kod 1, 2=Ozel kod 2, vs."
        ],
        sql: "SELECT sp.DEFINITION_ FROM LG_001_SPECODES sp WHERE sp.CODETYPE = 1 AND sp.SPECODETYPE = 3 AND sp.SPECODE = 'ARADIGINIZ_KOD'"
      }
    ],
    importantConcepts: {
      description: "Logo Tiger'da onemli kavramlar",
      concepts: [
        {
          name: "TRCODE (Fis Tipleri)",
          description: "Stok fislerinde (STFICHE) islem tipini belirler",
          commonValues: [
            { value: 1, meaning: "Mal alim irsaliyesi" },
            { value: 2, meaning: "Perakende satis iade irsaliyesi" },
            { value: 3, meaning: "Toptan satis iade irsaliyesi" },
            { value: 4, meaning: "Konsinye giris irsaliyesi" },
            { value: 5, meaning: "Konsinye cikis iade irsaliyesi" },
            { value: 6, meaning: "Konsinye cikis irsaliyesi" },
            { value: 7, meaning: "Konsinye giris iade irsaliyesi" },
            { value: 8, meaning: "Satis irsaliyesi" },
            { value: 9, meaning: "Iade irsaliyesi" },
            { value: 13, meaning: "Uretimden giris fisi" },
            { value: 14, meaning: "Uretime cikis (sarf) fisi" },
            { value: 25, meaning: "Ambar fisi" }
          ]
        },
        {
          name: "IOCODE (Giris/Cikis)",
          description: "Stok hareketinin giris mi cikis mi oldugunu belirler",
          values: [
            { value: 1, meaning: "Giris" },
            { value: 2, meaning: "Cikis" },
            { value: 3, meaning: "Giris (Iade)" },
            { value: 4, meaning: "Cikis (Iade)" }
          ]
        },
        {
          name: "Ozel Kodlar (SPECODE)",
          description: "Malzeme, cari ve diger kartlarda kullanici tanimli ozel kodlar",
          usage: "ITEMS.SPECODE = Ozel kod 1, ITEMS.SPECODE2 = Ozel kod 2, ..., ITEMS.SPECODE5 = Ozel kod 5",
          lookupTable: "LG_XXX_SPECODES tablosundan aciklama cekilir"
        },
        {
          name: "Referans Alanlari",
          description: "XXXREf ile biten alanlar baska tablolara referans verir",
          examples: [
            "STOCKREF -> LG_XXX_ITEMS.LOGICALREF (Malzeme karti)",
            "CLIENTREF -> LG_XXX_CLCARD.LOGICALREF (Cari hesap)",
            "STFICHEREF -> LG_XXX_XX_STFICHE.LOGICALREF (Stok fisi)",
            "ORDFICHEREF -> LG_XXX_XX_ORFICHE.LOGICALREF (Siparis)"
          ]
        }
      ]
    },
    aiInstructions: {
      description: "AI sistemleri icin onemli talimatlar",
      rules: [
        "Kullanici firma ve donem numarasi verirse, XXX ve XX placeholder'larini degistir",
        "Ornegin: Firma 126, Donem 01 -> LG_126_01_STFICHE",
        "Donem icermeyen tablolarda sadece XXX degisir -> LG_126_ITEMS",
        "Enum degerleri olan alanlar icin (TRCODE, IOCODE, vs.) mutlaka /api/schema/tables/TABLO_ADI endpoint'inden values dizisini kontrol et",
        "JOIN yaparken her zaman LOGICALREF uzerinden bagla",
        "Ozel kod aciklamalari icin SPECODES tablosunu kullan",
        "Tarih alanlari DATETIME formatindadir, karsilastirmalarda dikkatli ol"
      ]
    }
  };

  return NextResponse.json(documentation);
}
