import { NextResponse } from 'next/server';
import { getCategories, loadAllTables } from '@/lib/schema-loader';
import { filterByCategory } from '@/lib/search-engine';

/**
 * GET /api/schema/categories
 * Mevcut tablo kategorileri
 */
export async function GET() {
  try {
    const categories = getCategories();
    const tables = await loadAllTables();

    // Her kategori icin tablo sayisini hesapla
    const enrichedCategories = categories.map(cat => {
      const categoryTables = filterByCategory(tables, cat.id);
      return {
        ...cat,
        tableCount: categoryTables.length,
        tables: categoryTables.map(t => ({
          tableName: t.tableName,
          displayName: t.displayName
        }))
      };
    });

    return NextResponse.json({
      success: true,
      count: enrichedCategories.length,
      categories: enrichedCategories
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
