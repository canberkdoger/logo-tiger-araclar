import { NextResponse } from 'next/server';
import { loadAllTables } from '@/lib/schema-loader';

/**
 * GET /api/schema/search
 * Tablolar ve alanlar icerisinde arama yapar
 *
 * Query Parameters:
 * - q: Arama terimi (zorunlu)
 * - type: Arama tipi - 'tables', 'fields', 'all' (varsayilan: 'all')
 * - limit: Maksimum sonuc sayisi (varsayilan: 50)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Arama terimi en az 2 karakter olmali. Kullanim: ?q=arama_terimi'
      }, { status: 400 });
    }

    const tables = await loadAllTables();
    const searchLower = query.toLowerCase().trim();
    const results = {
      tables: [],
      fields: []
    };

    // Tablolarda ara
    if (type === 'all' || type === 'tables') {
      for (const table of tables) {
        const matchScore = calculateTableMatchScore(table, searchLower);
        if (matchScore > 0) {
          results.tables.push({
            tableName: table.tableName,
            displayName: table.displayName,
            category: table.category,
            description: table.description,
            matchScore,
            detailUrl: `/api/schema/tables/${table.tableName}`
          });
        }
      }

      // Skora gore sirala
      results.tables.sort((a, b) => b.matchScore - a.matchScore);
      results.tables = results.tables.slice(0, limit);
    }

    // Alanlarda ara
    if (type === 'all' || type === 'fields') {
      for (const table of tables) {
        for (const field of table.fields || []) {
          const matchScore = calculateFieldMatchScore(field, searchLower);
          if (matchScore > 0) {
            results.fields.push({
              tableName: table.tableName,
              tableDisplayName: table.displayName,
              fieldName: field.name,
              displayName: field.displayName,
              description: field.description,
              dataType: field.dataType,
              matchScore,
              hasEnumValues: !!(field.values && field.values.length > 0),
              enumValues: field.values || null,
              isReferenceField: !!(table.relatedTables?.find(r => r.field === field.name))
            });
          }
        }
      }

      // Skora gore sirala
      results.fields.sort((a, b) => b.matchScore - a.matchScore);
      results.fields = results.fields.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      query,
      type,
      results: {
        tables: type === 'fields' ? [] : results.tables,
        fields: type === 'tables' ? [] : results.fields,
        totalTableMatches: results.tables.length,
        totalFieldMatches: results.fields.length
      },
      tips: [
        'Tablo adlarinda XXX firma numarasini, XX donem numarasini temsil eder',
        'Alan aciklamalarinda Turkce terimler kullanilmistir',
        'Detayli bilgi icin detailUrl adresini kullanin'
      ]
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * Tablo icin esleme skoru hesapla
 */
function calculateTableMatchScore(table, searchLower) {
  let score = 0;

  // Tablo adi tam esleme
  if (table.tableName.toLowerCase() === searchLower) {
    score += 100;
  }
  // Tablo adi icerme
  else if (table.tableName.toLowerCase().includes(searchLower)) {
    score += 50;
  }

  // Goruntuleme adi
  if (table.displayName?.toLowerCase().includes(searchLower)) {
    score += 40;
  }

  // Aciklama
  if (table.description?.toLowerCase().includes(searchLower)) {
    score += 20;
  }

  // Kategori
  if (table.category?.toLowerCase().includes(searchLower)) {
    score += 10;
  }

  return score;
}

/**
 * Alan icin esleme skoru hesapla
 */
function calculateFieldMatchScore(field, searchLower) {
  let score = 0;

  // Alan adi tam esleme
  if (field.name.toLowerCase() === searchLower) {
    score += 100;
  }
  // Alan adi icerme
  else if (field.name.toLowerCase().includes(searchLower)) {
    score += 50;
  }

  // Goruntuleme adi
  if (field.displayName?.toLowerCase().includes(searchLower)) {
    score += 40;
  }

  // Aciklama
  if (field.description?.toLowerCase().includes(searchLower)) {
    score += 30;
  }

  // Enum degerlerinde ara
  if (field.values && field.values.length > 0) {
    for (const val of field.values) {
      if (val.label?.toLowerCase().includes(searchLower)) {
        score += 15;
        break;
      }
    }
  }

  return score;
}
