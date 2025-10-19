import { Product } from '../../database/mongodb/init';

interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  garantee?: string;
  // Filtros de componentes
  procesator?: string;
  gpu?: string;
  ram?: string;
  sku?: string;
}

interface SearchOptions {
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'name' | 'createdAt' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

interface SearchResult {
  products: any[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class ProductSearchService {
  /**
   * Búsqueda de texto completo con filtros avanzados
   */
  static async searchProducts(
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;

    // Construir query de búsqueda
    const searchQuery: any = {};

    // Búsqueda de texto o SKU
    if (query && query.trim()) {
      // Si parece un SKU (contiene "SKU" o es alfanumérico), buscar en ambos campos
      const looksLikeSKU = /^SKU/i.test(query) || /^[A-Z0-9\-]+$/i.test(query);
      
      if (looksLikeSKU) {
        // Buscar tanto en texto como en SKU
        searchQuery.$or = [
          { $text: { $search: query } },
          { sku: new RegExp(query, 'i') }
        ];
      } else {
        // Solo búsqueda de texto normal
        searchQuery.$text = { $search: query };
      }
    }

    // Filtro específico por SKU (tiene prioridad si se especifica)
    if (filters.sku) {
      // Si ya existe $or, combinarlo con $and
      if (searchQuery.$or) {
        const orCondition = searchQuery.$or;
        delete searchQuery.$or;
        searchQuery.$and = [
          { $or: orCondition },
          { sku: new RegExp(filters.sku, 'i') }
        ];
      } else {
        searchQuery.sku = new RegExp(filters.sku, 'i');
      }
    }

    // Aplicar filtros adicionales
    if (filters.category) {
      searchQuery.category = new RegExp(filters.category, 'i');
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      searchQuery.price = {};
      if (filters.minPrice !== undefined) {
        searchQuery.price.$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        searchQuery.price.$lte = filters.maxPrice;
      }
    }

    if (filters.inStock) {
      searchQuery.stock = { $gt: 0 };
    }

    if (filters.garantee) {
      searchQuery.garantee = filters.garantee;
    }

    // Filtros de componentes
    if (filters.procesator) {
      searchQuery['components.procesator'] = new RegExp(filters.procesator, 'i');
    }

    if (filters.gpu) {
      searchQuery['components.gpu'] = new RegExp(filters.gpu, 'i');
    }

    if (filters.ram) {
      searchQuery['components.ram'] = new RegExp(filters.ram, 'i');
    }

    // Configurar ordenamiento
    let sort: any = {};
    const hasTextSearch = (searchQuery.$text || (searchQuery.$or && searchQuery.$or.some((c: any) => c.$text)));
    
    if (sortBy === 'relevance' && hasTextSearch) {
      sort = { score: { $meta: 'textScore' } };
    } else if (sortBy === 'price') {
      sort = { price: sortOrder === 'asc' ? 1 : -1 };
    } else if (sortBy === 'name') {
      sort = { name: sortOrder === 'asc' ? 1 : -1 };
    } else if (sortBy === 'createdAt') {
      sort = { createdAt: sortOrder === 'asc' ? 1 : -1 };
    } else {
      // Ordenamiento por defecto
      sort = { createdAt: -1 };
    }

    // Proyección para incluir score de relevancia
    const projection: any = {};
    if (hasTextSearch) {
      projection.score = { $meta: 'textScore' };
    }

    // Ejecutar búsqueda
    const [products, total] = await Promise.all([
      Product.find(searchQuery, projection)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(searchQuery)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      products,
      total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  /**
   * Búsqueda específica por SKU
   */
  static async searchBySKU(
    sku: string,
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    return this.searchProducts('', { sku }, options);
  }

  /**
   * Búsqueda por categoría
   */
  static async searchByCategory(
    category: string,
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    return this.searchProducts('', { category }, options);
  }

  /**
   * Búsqueda por rango de precio
   */
  static async searchByPriceRange(
    minPrice: number,
    maxPrice: number,
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    return this.searchProducts('', { minPrice, maxPrice }, options);
  }

  /**
   * Obtener sugerencias de búsqueda (autocompletado)
   * Ahora incluye SKU en las sugerencias
   */
  static async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const regex = new RegExp(`^${query}`, 'i');
    
    const products = await Product.find({
      $or: [
        { name: regex },
        { category: regex },
        { sku: regex } // 👈 Agregar SKU a las sugerencias
      ]
    })
      .select('name sku')
      .limit(limit)
      .lean();

    // Retornar tanto nombres como SKUs
    const suggestions = new Set<string>();
    products.forEach(p => {
      suggestions.add(p.name);
      if (p.sku && p.sku.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(p.sku);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Productos relacionados basados en categoría y componentes
   */
  static async getRelatedProducts(productId: string, limit: number = 5): Promise<any[]> {
    const product = await Product.findById(productId);
    
    if (!product) {
      return [];
    }

    const relatedProducts = await Product.find({
      _id: { $ne: productId },
      $or: [
        { category: product.category },
        { 'components.procesator': product.components?.procesator },
        { 'components.gpu': product.components?.gpu }
      ]
    })
      .limit(limit)
      .lean();

    return relatedProducts;
  }

  /**
   * Filtros disponibles para una búsqueda
   */
  static async getAvailableFilters(query?: string): Promise<any> {
    const searchQuery = query 
      ? { $text: { $search: query } }
      : {};

    const [categories, priceRange, garantees] = await Promise.all([
      Product.distinct('category', searchQuery),
      Product.aggregate([
        { $match: searchQuery },
        {
          $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        }
      ]),
      Product.distinct('garantee', searchQuery)
    ]);

    return {
      categories: categories.sort(),
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 },
      garantees: garantees.sort()
    };
  }

  /**
   * Búsqueda exacta por SKU (útil para verificaciones)
   */
  static async findBySKUExact(sku: string): Promise<any | null> {
    return await Product.findOne({ sku: sku.toUpperCase() }).lean();
  }

  /**
   * Verificar si un SKU ya existe (útil para validaciones)
   */
  static async skuExists(sku: string, excludeId?: string): Promise<boolean> {
    const query: any = { sku: sku.toUpperCase() };
    
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const count = await Product.countDocuments(query);
    return count > 0;
  }
}