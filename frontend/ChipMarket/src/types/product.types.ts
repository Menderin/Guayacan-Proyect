export interface Product {
  _id: string;
  sku: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  components: {
    procesator?: string;
    mother_board?: string;
    ram?: string;
    storage?: string;
    gpu?: string;
    power_supply?: string;
    cooling_system?: string;
    case?: string;
    operative_system?: string;
  };
  garantee: string;
  reviews: unknown[];
  score?: number;
}

export interface SearchFilters {
  category: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  garantee: string;
  procesator: string;
  gpu: string;
  ram: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AvailableFilters {
  categories: string[];
  priceRange: {
    minPrice: number;
    maxPrice: number;
  };
  garantees: string[];
}