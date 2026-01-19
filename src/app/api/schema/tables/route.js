import { NextResponse } from 'next/server';
import { loadAllTables } from '@/lib/schema-loader';
import { filterByCategory } from '@/lib/search-engine';

/**
 * GET /api/schema/tables
 * Tum tablolarin listesi
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let tables = await loadAllTables();

    // Kategori filtresi
    if (category && category !== 'all') {
      tables = filterByCategory(tables, category);
    }

    // Sadece temel bilgileri don (alan detaylari haric)
    const simplifiedTables = tables.map(table => ({
      tableName: table.tableName,
      displayName: table.displayName,
      description: table.description,
      category: table.category,
      type: table.type,
      placeholders: table.placeholders,
      fieldCount: table.fields?.length || 0,
      indexCount: table.indexCount || table.indexes?.length || 0,
      relatedTableCount: table.relatedTables?.length || 0,
      detailUrl: `/api/schema/tables/${table.tableName}`
    }));

    return NextResponse.json({
      success: true,
      count: simplifiedTables.length,
      tables: simplifiedTables
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
