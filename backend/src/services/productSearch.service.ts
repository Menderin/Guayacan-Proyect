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

    // Búsqueda de texto si hay query
    if (query && query.trim()) {
      searchQuery.$text = { $search: query };
    }

    // Aplicar filtros
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
    if (sortBy === 'relevance' && query) {
      sort = { score: { $meta: 'textScore' } };
    } else if (sortBy === 'price') {
      sort = { price: sortOrder === 'asc' ? 1 : -1 };
    } else if (sortBy === 'name') {
      sort = { name: sortOrder === 'asc' ? 1 : -1 };
    } else if (sortBy === 'createdAt') {
      sort = { createdAt: sortOrder === 'asc' ? 1 : -1 };
    }

    // Proyección para incluir score de relevancia
    const projection: any = {};
    if (query && query.trim()) {
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
   */
  static async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const regex = new RegExp(`^${query}`, 'i');
    
    const products = await Product.find({
      $or: [
        { name: regex },
        { category: regex }
      ]
    })
      .select('name')
      .limit(limit)
      .lean();

    return products.map(p => p.name);
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
        { 'components.procesator': product.components.procesator },
        { 'components.gpu': product.components.gpu }
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
}