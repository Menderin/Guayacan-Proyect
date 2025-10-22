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

export interface ProductApiResponse {
  success: boolean;
  data?: {
    productos?: Product[];
    product?: Product; // Para endpoints que retornan un solo producto
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message?: string;
}
