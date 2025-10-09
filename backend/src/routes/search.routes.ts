import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';

const router = Router();

/**
 * @route   GET /api/search
 * @desc    Búsqueda principal de productos
 * @access  Public
 * @query   q, category, minPrice, maxPrice, inStock, garantee, procesator, gpu, ram, page, limit, sortBy, sortOrder
 */
router.get('/', SearchController.search);

/**
 * @route   GET /api/search/suggestions
 * @desc    Obtener sugerencias de autocompletado
 * @access  Public
 * @query   q, limit
 */
router.get('/suggestions', SearchController.suggestions);

/**
 * @route   GET /api/search/filters
 * @desc    Obtener filtros disponibles
 * @access  Public
 * @query   q (optional)
 */
router.get('/filters', SearchController.availableFilters);

/**
 * @route   GET /api/search/related/:productId
 * @desc    Obtener productos relacionados
 * @access  Public
 * @params  productId
 * @query   limit
 */
router.get('/related/:productId', SearchController.relatedProducts);

/**
 * @route   GET /api/search/category/:category
 * @desc    Buscar productos por categoría
 * @access  Public
 * @params  category
 * @query   page, limit, sortBy, sortOrder
 */
router.get('/category/:category', SearchController.searchByCategory);

export default router;