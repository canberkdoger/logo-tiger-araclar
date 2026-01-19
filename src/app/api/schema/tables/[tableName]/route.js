import { NextResponse } from 'next/server';
import { loadAllTables } from '@/lib/schema-loader';

/**
 * GET /api/schema/tables/[tableName]
 * Belirli bir tablonun detayli bilgileri
 */
export async function GET(request, { params }) {
  try {
    const { tableName } = await params;
    const tables = await loadAllTables();

    // Tablo bul (buyuk/kucuk harf duyarsiz)
    const table = tables.find(t =>
      t.tableName.toLowerCase() === tableName.toLowerCase()
    );

    if (!table) {
      return NextResponse.json({
        success: false,
        error: `Tablo bulunamadi: ${tableName}`,
        suggestion: "Mevcut tablolar icin /api/schema/tables endpoint'ini kullanin"
      }, { status: 404 });
    }

    // Iliskili tablolari zenginlestir
    const enrichedRelations = (table.relatedTables || []).map(rel => {
      const relatedTable = tables.find(t => {
        // XXX ve XX placeholder'larini kontrol et
        const normalizedRelTable = rel.table.replace(/XXX/g, '').replace(/XX/g, '');
        const normalizedTableName = t.tableName.replace(/XXX/g, '').replace(/XX/g, '');
        return normalizedRelTable === normalizedTableName;
      });

      // Field bilgisi: once dogrudan bak, yoksa ters yonden bul
      let sourceField = rel.field;
      if (!sourceField && relatedTable?.relatedTables) {
        const reverseRelation = relatedTable.relatedTables.find(
          r => r.table === table.tableName
        );
        if (reverseRelation?.field) {
          sourceField = reverseRelation.field;
        }
      }

      return {
        ...rel,
        field: sourceField || rel.field,
        exists: !!relatedTable,
        category: relatedTable?.category,
        displayName: relatedTable?.displayName,
        joinClause: sourceField
          ? `${table.tableName}.LOGICALREF = ${rel.table}.${sourceField}`
          : null
      };
    });

    // Referans alanlari tespit et
    const referenceFields = (table.fields || [])
      .filter(f => f.name.endsWith('REF') || f.description?.includes('referans'))
      .map(f => ({
        name: f.name,
        type: f.type,
        description: f.description,
        possibleTarget: guessForeignKeyTarget(f.name)
      }));

    // Enum alanlari (values dizisi olanlar)
    const enumFields = (table.fields || [])
      .filter(f => f.values && f.values.length > 0)
      .map(f => ({
        name: f.name,
        description: f.description,
        values: f.values
      }));

    const response = {
      success: true,
      table: {
        tableName: table.tableName,
        displayName: table.displayName,
        description: table.description,
        category: table.category,
        type: table.type,
        placeholders: table.placeholders,
        placeholderUsage: generatePlaceholderUsage(table),
        fields: table.fields,
        fieldCount: table.fields?.length || 0,
        indexes: table.indexes,
        indexCount: table.indexes?.length || 0,
        relatedTables: enrichedRelations,
        commonQueries: table.commonQueries,
        analysis: {
          primaryKey: table.fields?.find(f => f.isPrimaryKey)?.name || 'LOGICALREF',
          referenceFields,
          enumFields,
          dateFields: (table.fields || []).filter(f =>
            f.name.includes('DATE') || f.type?.toLowerCase().includes('datetime')
          ).map(f => f.name),
          amountFields: (table.fields || []).filter(f =>
            f.name.includes('AMOUNT') || f.name.includes('TOTAL') || f.name.includes('PRICE')
          ).map(f => f.name)
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * Referans alan adindan hedef tabloyu tahmin et
 */
function guessForeignKeyTarget(fieldName) {
  const mappings = {
    'STOCKREF': 'LG_XXX_ITEMS',
    'CLIENTREF': 'LG_XXX_CLCARD',
    'ACCOUNTREF': 'LG_XXX_EMUHACC',
    'CENTERREF': 'LG_XXX_EMCENTER',
    'PROJECTREF': 'LG_XXX_PROJECT',
    'PAYMENTREF': 'LG_XXX_PAYPLANS',
    'UNITSETREF': 'LG_XXX_UNITSETF',
    'QCCSETREF': 'LG_XXX_QCSET',
    'STFICHEREF': 'LG_XXX_XX_STFICHE',
    'INVREF': 'LG_XXX_XX_INVOICE',
    'MARKREF': 'LG_XXX_MARK',
    'SLSMANREF': 'LG_XXX_SLSMAN'
  };

  return mappings[fieldName] || null;
}

/**
 * Placeholder kullanim ornegi olustur
 */
function generatePlaceholderUsage(table) {
  let example = table.tableName;
  const replacements = [];

  if (table.placeholders?.includes('XXX')) {
    example = example.replace('XXX', '001');
    replacements.push({ placeholder: 'XXX', value: '001', description: 'Firma numarasi' });
  }

  if (table.placeholders?.includes('XX')) {
    example = example.replace('XX', '01');
    replacements.push({ placeholder: 'XX', value: '01', description: 'Donem numarasi' });
  }

  return {
    template: table.tableName,
    example,
    replacements
  };
}
