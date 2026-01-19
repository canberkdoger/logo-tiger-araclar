import { NextResponse } from 'next/server';
import { loadAllTables } from '@/lib/schema-loader';

/**
 * GET /api/schema/relationships
 * Tablo iliskilerini ve JOIN onerilerini getirir
 *
 * Query Parameters:
 * - table: Ana tablo adi (opsiyonel - belirtilmezse tum iliskiler)
 * - depth: Iliski derinligi (varsayilan: 1, max: 3)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table');
    const depth = Math.min(parseInt(searchParams.get('depth') || '1', 10), 3);

    const tables = await loadAllTables();
    const tableMap = new Map(tables.map(t => [t.tableName, t]));

    if (tableName) {
      // Belirli bir tablo icin iliskileri getir
      const table = tableMap.get(tableName);

      if (!table) {
        return NextResponse.json({
          success: false,
          error: `Tablo bulunamadi: ${tableName}`,
          availableTables: tables.map(t => t.tableName).slice(0, 20),
          tip: 'Tablo listesi icin /api/schema/tables adresini kullanin'
        }, { status: 404 });
      }

      const relationships = buildRelationshipTree(table, tableMap, depth, new Set());
      const joinSuggestions = generateJoinSuggestions(table, tableMap);

      return NextResponse.json({
        success: true,
        table: {
          tableName: table.tableName,
          displayName: table.displayName,
          category: table.category
        },
        depth,
        relationships,
        joinSuggestions,
        sqlExamples: generateSqlExamples(table, relationships)
      });

    } else {
      // Tum iliskileri ozet olarak getir
      const allRelationships = [];

      for (const table of tables) {
        if (table.relatedTables && table.relatedTables.length > 0) {
          allRelationships.push({
            sourceTable: table.tableName,
            sourceDisplayName: table.displayName,
            relations: table.relatedTables.map(rel => {
              // Field bilgisi: once dogrudan bak, yoksa ters yonden bul
              let sourceField = rel.field;
              if (!sourceField) {
                sourceField = findFieldFromReverse(table.tableName, rel.table, tableMap);
              }

              return {
                targetTable: rel.table,
                sourceField: sourceField || null,
                targetField: 'LOGICALREF',
                description: rel.description,
                joinType: 'LEFT'
              };
            })
          });
        }
      }

      return NextResponse.json({
        success: true,
        totalTablesWithRelations: allRelationships.length,
        relationships: allRelationships,
        tips: [
          'Belirli bir tablo icin ?table=TABLO_ADI parametresi kullanin',
          'Derin iliski agaci icin ?depth=2 veya ?depth=3 kullanin',
          'Tum tablolarda LOGICALREF birincil anahtar olarak kullanilir'
        ]
      });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * Ters yonden field bilgisi bul
 * Eger mevcut tablonun relatedTables'inda field yoksa,
 * hedef tablonun relatedTables'inda mevcut tabloyu arayarak field bul
 */
function findFieldFromReverse(currentTableName, targetTableName, tableMap) {
  const targetTable = tableMap.get(targetTableName);
  if (!targetTable?.relatedTables) return null;

  const reverseRelation = targetTable.relatedTables.find(
    r => r.table === currentTableName
  );

  return reverseRelation?.field || null;
}

/**
 * Iliski agacini olustur (recursive)
 */
function buildRelationshipTree(table, tableMap, depth, visited) {
  if (depth <= 0 || visited.has(table.tableName)) {
    return [];
  }

  visited.add(table.tableName);
  const relations = [];

  for (const rel of table.relatedTables || []) {
    const targetTable = tableMap.get(rel.table);

    // Field bilgisi: once dogrudan bak, yoksa ters yonden bul
    let sourceField = rel.field;
    if (!sourceField) {
      sourceField = findFieldFromReverse(table.tableName, rel.table, tableMap);
    }

    const relation = {
      targetTable: rel.table,
      targetDisplayName: targetTable?.displayName || rel.table,
      sourceField: sourceField || null,
      targetField: 'LOGICALREF',
      description: rel.description,
      joinClause: sourceField
        ? `${table.tableName}.${sourceField} = ${rel.table}.LOGICALREF`
        : null,
      targetExists: !!targetTable,
      children: []
    };

    // Daha derin iliskileri getir
    if (targetTable && depth > 1) {
      relation.children = buildRelationshipTree(targetTable, tableMap, depth - 1, new Set(visited));
    }

    relations.push(relation);
  }

  return relations;
}

/**
 * JOIN onerileri olustur
 */
function generateJoinSuggestions(table, tableMap) {
  const suggestions = [];

  for (const rel of table.relatedTables || []) {
    const targetTable = tableMap.get(rel.table);

    if (targetTable) {
      // Field bilgisi: once dogrudan bak, yoksa ters yonden bul
      let sourceField = rel.field;
      if (!sourceField) {
        sourceField = findFieldFromReverse(table.tableName, rel.table, tableMap);
      }

      // Hedef tablonun onemli alanlarini bul
      const usefulFields = (targetTable.fields || [])
        .filter(f => {
          const name = f.name.toUpperCase();
          return name === 'CODE' ||
                 name === 'NAME' ||
                 name.includes('DEFINITION') ||
                 name === 'SPECODE' ||
                 name === 'CYPHCODE';
        })
        .map(f => ({
          name: f.name,
          displayName: f.displayName,
          dataType: f.dataType
        }));

      suggestions.push({
        targetTable: rel.table,
        targetDisplayName: targetTable.displayName,
        sourceField: sourceField || null,
        description: rel.description,
        recommendedJoinType: 'LEFT',
        usefulFieldsToSelect: usefulFields,
        sampleJoin: sourceField ? {
          type: 'LEFT JOIN',
          clause: `${rel.table} ON ${table.tableName}.${sourceField} = ${rel.table}.LOGICALREF`
        } : null
      });
    }
  }

  return suggestions;
}

/**
 * Ornek SQL sorgulari olustur
 */
function generateSqlExamples(table, relationships) {
  const examples = [];

  // Basit sorgu
  examples.push({
    description: 'Temel sorgu (JOIN\'siz)',
    sql: `SELECT *\nFROM ${table.tableName}\nWHERE 1=1`
  });

  // Her iliski icin JOIN ornegi
  for (const rel of relationships.slice(0, 3)) {
    examples.push({
      description: `${rel.description || rel.targetTable} ile birlikte`,
      sql: `SELECT t.*, r.*\nFROM ${table.tableName} t\nLEFT JOIN ${rel.targetTable} r ON t.${rel.sourceField} = r.LOGICALREF\nWHERE 1=1`
    });
  }

  // Coklu JOIN ornegi
  if (relationships.length >= 2) {
    const joinClauses = relationships.slice(0, 3).map((rel, idx) => {
      const alias = String.fromCharCode(97 + idx + 1); // b, c, d...
      return `LEFT JOIN ${rel.targetTable} ${alias} ON a.${rel.sourceField} = ${alias}.LOGICALREF`;
    });

    examples.push({
      description: 'Coklu JOIN ornegi',
      sql: `SELECT a.*\nFROM ${table.tableName} a\n${joinClauses.join('\n')}\nWHERE 1=1`
    });
  }

  return examples;
}
