import { Request, Response } from 'express';
import { ProductSearchService } from '../services/productSearch.service';

export class SearchController {
  /**
   * Búsqueda principal de productos
   * GET /api/search?q=gaming&category=laptops&minPrice=500&maxPrice=2000&page=1&limit=20
   */
  static async search(req: Request, res: Response): Promise<void> {
  try {
    const {
      q = '',
      sku, // 👈 Nuevo parámetro para búsqueda específica por SKU
      category,
      minPrice,
      maxPrice,
      inStock,
      garantee,
      procesator,
      gpu,
      ram,
      page = '1',
      limit = '20',
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      category: category as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      inStock: inStock === 'true',
      garantee: garantee as string,
      procesator: procesator as string,
      gpu: gpu as string,
      ram: ram as string,
      sku: sku as string // 👈 Agregar SKU a los filtros
    };

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as 'price' | 'name' | 'createdAt' | 'relevance',
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    const result = await ProductSearchService.searchProducts(
      q as string,
      filters,
      options
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al realizar la búsqueda',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

  /**
   * Sugerencias de autocompletado
   * GET /api/search/suggestions?q=gam
   */
  static async suggestions(req: Request, res: Response): Promise<void> {
    try {
      const { q = '', limit = '5' } = req.query;

      const suggestions = await ProductSearchService.getSuggestions(
        q as string,
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      console.error('Error al obtener sugerencias:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener sugerencias',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Productos relacionados
   * GET /api/search/related/:productId
   */
  static async relatedProducts(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const { limit = '5' } = req.query;

      const products = await ProductSearchService.getRelatedProducts(
        productId,
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error al obtener productos relacionados:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener productos relacionados',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Filtros disponibles
   * GET /api/search/filters?q=gaming
   */
  static async availableFilters(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      const filters = await ProductSearchService.getAvailableFilters(
        q as string
      );

      res.status(200).json({
        success: true,
        data: filters
      });
    } catch (error) {
      console.error('Error al obtener filtros:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener filtros disponibles',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Búsqueda por categoría
   * GET /api/search/category/:category
   */
  static async searchByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const {
        page = '1',
        limit = '20',
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as 'price' | 'name' | 'createdAt' | 'relevance',
        sortOrder: sortOrder as 'asc' | 'desc'
      };

      const result = await ProductSearchService.searchByCategory(
        category,
        options
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error en búsqueda por categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar por categoría',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}